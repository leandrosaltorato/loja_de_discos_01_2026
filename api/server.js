require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensagem: 'Erro interno.' });
});

const movimentacaoestoqueRoutes = require('./src/routes/movimentacaoestoque.routes');

app.use('/movimentacaoestoque', movimentacaoestoqueRoutes);


const discoRoutes = require('./src/routes/disco.routes');

app.use('/disco', discoRoutes);


const usuarioRoutes = require('./src/routes/usuario.routes');

app.use('/usuario', usuarioRoutes);

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => console.log(`API disponível na porta ${port}`));

async function encerrar() {
  server.close();
  await prisma.$disconnect();
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
