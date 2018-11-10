const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp').default;
const ws = require("ws");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
};

describe('simpleDDP', function(){
  let server = new simpleDDP(opts);

  describe('#sub', function (){

    it('should subscribe and simpleDDP.collections should update', async function () {

      let subid = "";

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'added',
          collection: "test",
          id: '0',
          fields: {isOk:true}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subid]
        });
      },50);

      let sub = await server.sub("testsub");
      subid = sub.subid;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

    it('should subscribe and simpleDDP.collections should update, await sub ready should work both times', async function () {

      let subid = "";

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'changed',
          collection: "test",
          id: '0',
          fields: {isOk:false}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subid]
        });
      },50);

      let sub = await server.sub("testsub");
      subid = sub.subid;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
