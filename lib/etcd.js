var Etcd = require('node-etcd');
var url = require('url');
var etcdUrl = process.env.ETCD || '127.0.0.1:4001';


var client = module.exports = new Etcd(etcdUrl.split(','))
