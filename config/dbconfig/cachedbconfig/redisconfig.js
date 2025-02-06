const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  // password: "mustafa",
});

(async () => { 
  await redisClient.connect(); 
})(); 

redisClient.on('connect', () => {
  console.log('################----------Connected to Redis-------------------######');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});
module.exports = redisClient;
