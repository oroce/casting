var read = require('fs').readFileSync;
var spawn = require('child_process').spawn;
var cast = require('castv2');
var etcd = require('./lib/etcd');
var getIPs = require("getip").getNetworkIPs;
var runinterval = require('runinterval');
var sillyname = require('sillyname');
var server = new (cast.Server)({
   key: read('./keys/oroce-key.pem'),
   cert: read('./keys/oroce-cert.pem')
});
var e = server.emit;
server.notemit = function() {
   var a = [].slice.call(arguments);
   console.log.apply(console, ['emit'].concat(a));
   return e.apply(this, a);
};

server.on('message', function(clientId, sourceId, destId, ns, message) {
   var args = [].slice.call(arguments);
   console.log.apply(console, ['Message arrived'].concat(args));
   var data;
   try{
     data = JSON.parse(message) || {};
     if (data.type === 'LAUNCH' && data.appId === 'say') {
        console.log('sayin=', data.word);
        spawn('say', [data.word]);
     }
   } catch(x) {console.error(x);}
   //console.log('msg=%s, typeof=%s', message, typeof message);
});
server.listen(8009, function(err) {
  if (err) throw err;
  var port = server.server.address().port;
  getIPs(function(err, ips) {
    if (err) throw err;

    ips.forEach(function(ip) {
      var serverName = sillyname();
      register(serverName, ip, port);
    });
  });
});


function register(serverName, ip, port) {
  console.log('Registering as %s port=%s, ip=%s', serverName, port, ip);
  runinterval(function() {
    etcd.set('cast-servers/' + serverName, JSON.stringify({
      ip: ip,
      port: port,
      name: serverName
    }), {
      ttl: 10
    });
  }, 5000);
}
