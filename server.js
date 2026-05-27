import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const dbConfig = {
  host: process.env.AIVEN_DB_HOST || process.env.MYSQL_HOST,
  user: process.env.AIVEN_DB_USER || process.env.MYSQL_USER,
  password: process.env.AIVEN_DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.AIVEN_DB_NAME || process.env.MYSQL_DATABASE,
  port: Number(process.env.AIVEN_DB_PORT || process.env.MYSQL_PORT) || 3306,
  ssl: {
    rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED === "true",
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const validCategories = new Set(["meals", "drinks", "desserts", "sides"]);
const validStatuses = new Set(["pending", "preparing", "out-for-delivery", "delivered", "cancelled"]);
const validPaymentMethods = new Set(["e-wallet", "cash-on-delivery"]);

const toBoolean = (value) => value === true || value === 1 || value === "1";
const toSqlDate = (dateString) => new Date(dateString || Date.now()).toISOString().slice(0, 23).replace("T", " ");
const toIsoDate = (value) => {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const mapMenuItem = (row) => ({
  id: String(row.id),
  name: row.name,
  description: row.description,
  price: Number(row.price),
  image: row.image,
  category: row.category,
  available: toBoolean(row.available),
  featured: toBoolean(row.featured),
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      image TEXT NOT NULL,
      category VARCHAR(30) NOT NULL DEFAULT 'meals',
      available TINYINT(1) NOT NULL DEFAULT 1,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      customer_name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(80) NOT NULL,
      payment_method VARCHAR(40) NOT NULL,
      created_at DATETIME(3) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      menu_item_id VARCHAR(64) NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      item_description TEXT NOT NULL,
      item_price DECIMAL(10,2) NOT NULL,
      item_image TEXT NOT NULL,
      item_category VARCHAR(30) NOT NULL,
      item_available TINYINT(1) NOT NULL DEFAULT 1,
      item_featured TINYINT(1) NOT NULL DEFAULT 0,
      quantity INT NOT NULL,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet (
      id INT PRIMARY KEY,
      balance DECIMAL(10,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id VARCHAR(64) PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT NOT NULL,
      date DATETIME(3) NOT NULL
    )
  `);

  await pool.query("INSERT IGNORE INTO wallet (id, balance) VALUES (1, 0)");
}

async function getMenuItems() {
  const [rows] = await pool.query(
    "SELECT id, name, description, price, image, category, available, featured FROM menu_items ORDER BY created_at DESC, id DESC"
  );
  return rows.map(mapMenuItem);
}

async function getOrders() {
  const [rows] = await pool.query(`
    SELECT
      o.id AS order_id,
      o.total,
      o.status,
      o.customer_name,
      o.address,
      o.phone,
      o.payment_method,
      o.created_at,
      oi.menu_item_id,
      oi.item_name,
      oi.item_description,
      oi.item_price,
      oi.item_image,
      oi.item_category,
      oi.item_available,
      oi.item_featured,
      oi.quantity
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    ORDER BY o.created_at DESC, oi.id ASC
  `);

  const orderMap = new Map();

  for (const row of rows) {
    const id = String(row.order_id);
    if (!orderMap.has(id)) {
      orderMap.set(id, {
        id,
        items: [],
        total: Number(row.total),
        status: row.status,
        customerName: row.customer_name,
        address: row.address,
        phone: row.phone,
        paymentMethod: row.payment_method,
        createdAt: toIsoDate(row.created_at),
      });
    }

    if (row.menu_item_id) {
      orderMap.get(id).items.push({
        menuItem: {
          id: String(row.menu_item_id),
          name: row.item_name,
          description: row.item_description,
          price: Number(row.item_price),
          image: row.item_image,
          category: row.item_category,
          available: toBoolean(row.item_available),
          featured: toBoolean(row.item_featured),
        },
        quantity: Number(row.quantity),
      });
    }
  }

  return Array.from(orderMap.values());
}

async function getWallet() {
  const [[walletRow]] = await pool.query("SELECT balance FROM wallet WHERE id = 1");
  const [transactionRows] = await pool.query(
    "SELECT id, type, amount, description, date FROM wallet_transactions ORDER BY date DESC"
  );

  return {
    walletBalance: Number(walletRow?.balance || 0),
    walletTransactions: transactionRows.map((row) => ({
      id: String(row.id),
      type: row.type,
      amount: Number(row.amount),
      description: row.description,
      date: toIsoDate(row.date),
    })),
  };
}

function validateMenuItem(body) {
  const category = validCategories.has(body.category) ? body.category : "meals";
  return {
    id: String(body.id || `item-${Date.now()}`),
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    price: Number(body.price),
    image: String(body.image || "").trim(),
    category,
    available: toBoolean(body.available),
    featured: toBoolean(body.featured),
  };
}

function validateOrder(body) {
  const paymentMethod = validPaymentMethods.has(body.paymentMethod) ? body.paymentMethod : "cash-on-delivery";
  const status = validStatuses.has(body.status) ? body.status : "pending";

  return {
    id: String(body.id || `ORD-${Date.now().toString(36).toUpperCase()}`),
    items: Array.isArray(body.items) ? body.items : [],
    total: Number(body.total),
    status,
    customerName: String(body.customerName || "").trim(),
    address: String(body.address || "").trim(),
    phone: String(body.phone || "").trim(),
    paymentMethod,
    createdAt: body.createdAt || new Date().toISOString(),
  };
}

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      success: true,
      message: "Database connected successfully",
      time: rows[0].now,
    });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/app-data", async (req, res) => {
  try {
    const [menuItems, orders, wallet] = await Promise.all([getMenuItems(), getOrders(), getWallet()]);
    res.json({ menuItems, orders, ...wallet });
  } catch (err) {
    console.error("Failed to load app data:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/menu-items", async (req, res) => {
  try {
    res.json(await getMenuItems());
  } catch (err) {
    console.error("Failed to load menu items:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/menu-items", async (req, res) => {
  try {
    const item = validateMenuItem(req.body);
    if (!item.name || !item.description || !item.image || !Number.isFinite(item.price)) {
      return res.status(400).json({ error: "Invalid menu item data" });
    }

    await pool.query(
      `INSERT INTO menu_items (id, name, description, price, image, category, available, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.name, item.description, item.price, item.image, item.category, Number(item.available), Number(item.featured)]
    );

    res.status(201).json(item);
  } catch (err) {
    console.error("Failed to create menu item:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/menu-items/:id", async (req, res) => {
  try {
    const item = validateMenuItem({ ...req.body, id: req.params.id });
    if (!item.name || !item.description || !item.image || !Number.isFinite(item.price)) {
      return res.status(400).json({ error: "Invalid menu item data" });
    }

    const [result] = await pool.query(
      `UPDATE menu_items
       SET name = ?, description = ?, price = ?, image = ?, category = ?, available = ?, featured = ?
       WHERE id = ?`,
      [item.name, item.description, item.price, item.image, item.category, Number(item.available), Number(item.featured), item.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
  } catch (err) {
    console.error("Failed to update menu item:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/menu-items/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM menu_items WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete menu item:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    res.json(await getOrders());
  } catch (err) {
    console.error("Failed to load orders:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const order = validateOrder(req.body);
    if (!order.customerName || !order.address || !order.phone || !Number.isFinite(order.total) || order.items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO orders (id, total, status, customer_name, address, phone, payment_method, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.id, order.total, order.status, order.customerName, order.address, order.phone, order.paymentMethod, toSqlDate(order.createdAt)]
    );

    for (const item of order.items) {
      const menuItem = item.menuItem || {};
      await connection.query(
        `INSERT INTO order_items
          (order_id, menu_item_id, item_name, item_description, item_price, item_image, item_category, item_available, item_featured, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          String(menuItem.id || ""),
          String(menuItem.name || ""),
          String(menuItem.description || ""),
          Number(menuItem.price || 0),
          String(menuItem.image || ""),
          validCategories.has(menuItem.category) ? menuItem.category : "meals",
          Number(toBoolean(menuItem.available)),
          Number(toBoolean(menuItem.featured)),
          Number(item.quantity || 1),
        ]
      );
    }

    await connection.commit();
    res.status(201).json(order);
  } catch (err) {
    await connection.rollback();
    console.error("Failed to create order:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const status = req.body.status;
    if (!validStatuses.has(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/wallet", async (req, res) => {
  try {
    res.json(await getWallet());
  } catch (err) {
    console.error("Failed to load wallet:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/wallet/top-up", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid wallet amount" });
    }

    const transactionId = `txn-${Date.now()}`;
    await connection.beginTransaction();
    await connection.query("UPDATE wallet SET balance = balance + ? WHERE id = 1", [amount]);
    await connection.query(
      "INSERT INTO wallet_transactions (id, type, amount, description, date) VALUES (?, 'topup', ?, 'Wallet top-up', ?)",
      [transactionId, amount, toSqlDate(new Date().toISOString())]
    );
    await connection.commit();

    res.json(await getWallet());
  } catch (err) {
    await connection.rollback();
    console.error("Failed to top up wallet:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.post("/api/wallet/payment", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const amount = Number(req.body.amount);
    const description = String(req.body.description || "Wallet payment");
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid wallet amount" });
    }

    await connection.beginTransaction();
    const [[walletRow]] = await connection.query("SELECT balance FROM wallet WHERE id = 1 FOR UPDATE");
    const currentBalance = Number(walletRow?.balance || 0);
    if (currentBalance < amount) {
      await connection.rollback();
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    const transactionId = `txn-${Date.now()}`;
    await connection.query("UPDATE wallet SET balance = balance - ? WHERE id = 1", [amount]);
    await connection.query(
      "INSERT INTO wallet_transactions (id, type, amount, description, date) VALUES (?, 'payment', ?, ?, ?)",
      [transactionId, amount, description, toSqlDate(new Date().toISOString())]
    );
    await connection.commit();

    res.json(await getWallet());
  } catch (err) {
    await connection.rollback();
    console.error("Failed to process wallet payment:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

await initializeDatabase();

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
