const redisClient = require('./config');

async function save(key, value) {
  try {
    return await redisClient.set(key, JSON.stringify(value));
  } catch (error) {
    console.log('Erro ao salvar no Redis:', error);
    return null;
  }
}

async function get(key) {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log('Erro ao buscar do Redis:', error);
    return null;
  }
}

async function getAllKeys(pattern) {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log('Erro ao buscar chaves no Redis:', error);
    return [];
  }
}

async function remove(key) {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.log('Erro ao remover do Redis:', error);
    return null;
  }
}

module.exports = {
  save,
  get,
  getAllKeys,
  remove
};
