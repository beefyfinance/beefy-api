const redis = require('redis');

var redisClient;

const initRedis = async () => {
  if (!process.env.REDISCLOUD_URL) return;
  redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
  });

  redisClient.on('connect', async () => {
    console.log('Connected to redis');
  });

  redisClient.on('error', err => {
    console.log('Failed to connect to redis: ', err);
  });

  await redisClient.connect();
  // await loadCachedValues();
};

const setKey = async (key, value) => {
  if (!redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value));
  } catch (err) {
    console.log(`Failed storing value for key "${key}": `, err);
  }
};

const getKey = async key => {
  if (!redisClient) return;
  try {
    let value = await redisClient.get(key);
    return JSON.parse(value);
  } catch (err) {
    console.log(`Failed getting value for key "${key}": `, err);
  }
};

module.exports = {
  initRedis,
  setKey,
  getKey,
};
