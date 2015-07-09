var Client = require('castv2').Client;
var etcd = require('./lib/etcd');
var watcher = etcd.watcher('cast-servers', null, {recursive: true});
var casts = {};
watcher
  .on('set', function(info) {
    var raw = info.node.value;
    var data = JSON.parse(raw);
    console.log('New node %s with %s:%s', data.name, data.ip, data.port);
    connect(data);
  })
  .on('delete', function(info) {
    var raw = info.prevNode.value;
    var data = JSON.parse(raw);
    console.log('Deleted node %s with %s:%s', data.name, data.ip, data.port);
    disconnect(data);
  })
  .on('expire', function(info) {
    var raw = info.prevNode.value;
    var data = JSON.parse(raw);
    console.log('Expired node %s with %s:%s', data.name, data.ip, data.port);
    disconnect(data);
  });

function connect(data) {
  if (casts[data.name]) {
    // already connected go away
    return;
  }
  var client = casts[data.name] = new Client();
  client.connect({
    host: data.ip,
    port: data.port
  }, function() {
    var receiver = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');
    //receiver.send({ type: 'LAUNCH', appId: 'say', requestId: 1, word: 'RUFF I LOVE YOU' });
    receiver.send({ type: 'LAUNCH', appId: 'YouTube', requestId: 1, link: 'https://www.youtube.com/watch?v=riwrptGuqtc' });
  });
}

function disconnect(data) {}
/*var client = new Client();
client.connect('folia.oroszi.net', function(err, res) {
  function onerr(ee) {
    'on' in ee && ee.on('error', console.error.bind(console));
  }

  onerr(client);

  // create various namespace handlers
  var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
  var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
  var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');
  onerr(connection);
  onerr(heartbeat);
  onerr(receiver);
  // establish virtual connection to the receiver
  connection.send({ type: 'CONNECT' });

  // start heartbeating
  setInterval(function() {
    heartbeat.send({ type: 'PING' });
  }, 5000);

  // display receiver status updates
  receiver.on('message', function(data, broadcast) {
    if(data.type = 'RECEIVER_STATUS') {
      console.log(data.status);
    }
  });
  receiver.send({ type: 'LAUNCH', appId: 'say', requestId: 1, word: 'you are beautiful' });
});
*/
