const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// ✅ ROTA BASE
app.get('/', (req, res) => {
  res.status(200).send('Nexus Backend Online 🚀');
});

// ✅ CALLBACK INSTAGRAM
app.get('/auth/instagram/callback', (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Código não recebido do Instagram.');
  }

  res.status(200).send(`Instagram OAuth recebido com sucesso! Código: ${code}`);
});

// Start server
app.listen(port, () => {
  console.log(`Nexus Backend running on port ${port}`);
});
