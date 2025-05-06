require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes.js');


const app = express();
app.use(bodyParser.json());
app.use('/api', routes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});