require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
