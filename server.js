require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/**
 * Root Route
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Nexus Backend Running",
    version: "1.0.0"
  });
});

/**
 * Health Check Route
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

/**
 * Database Test Route
 */
app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message
    });
  }
});

/**
 * Vector Test Route (pgvector)
 */
app.get("/api/test-vector", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT '[1,2,3]'::vector`;
    res.status(200).json({
      vector: "pgvector working"
    });
  } catch (error) {
    res.status(500).json({
      error: "pgvector not working",
      details: error.message
    });
  }
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/**
 * Global Error Middleware
 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nexus Backend running on port ${PORT}`);
});
