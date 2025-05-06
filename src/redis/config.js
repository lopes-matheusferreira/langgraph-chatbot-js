const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  (async () => {
    try {
      await redisClient.connect();
      console.log('Conectado ao Redis');
    } catch (err) {
      console.error('Erro ao conectar ao Redis:', err);
    }
  })();

  process.on('SIGINT', async () => {
    console.log('Fechando conexão com Redis...');
    await redisClient.quit();
    process.exit(0);
  });
  
  module.exports = redisClient;