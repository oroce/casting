var redis = require('redis');
var url = require('url');
var redisUrl = process.env.REDIS || '';

var parts = url.parse(redisUrl)

var client = module.exports = redis.createClient(parts.hostname || 'localhost', parts.port || 6379);

if (parts.auth) {
  client.auth(parts.auth);
}
