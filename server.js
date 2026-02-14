const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Porta do Render (OBRIGATÓRIO usar process.env.PORT)
const PORT = process.env.PORT || 10000;

// ===============================
// ROUTES
// ===============================

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).send('🚀 Nexus Backend Online');
});

// Health Check (ESSENCIAL para Render e APIs)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'nexus-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Backend funcionando corretamente ✅'
  });
});

// ===============================
// ERROR HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
