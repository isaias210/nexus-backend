require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/*
 Root Route
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Nexus Backend Running",
    version: "1.0.0"
  });
});

/*
 Health Check
*/
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime()
  });
});

/*
 Database Test
*/
app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      database: "Connected"
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message
    });
  }
});

/*
 404
*/
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nexus Backend running on port ${PORT}`);
});

