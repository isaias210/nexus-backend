const express = require('express');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

// rota raiz
app.get('/', (req, res) => {
  res.send('Nexus Backend Online 🚀');
});

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
