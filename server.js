var app     = require('express')(),
  http      = require('http').Server(app),
  io        = require('socket.io')(http, {serveClient: false} ),
  clients   = [],
  syncObjs  = {knockoutObjects: {}},
  port      = 4000;

http.listen( port, function(){
  console.log('listening on *:'+port);
});


io.on('connection', function(socket) {

  clients[socket.id] = socket;

  socket.emit("message",syncObjs);

  socket.on('message', function(message) {
    // append sync values to temporary storage
    // here you could block people trying to manually update via socket.send live readonly observables with named IDs
    syncObjs.knockoutObjects[message.id] = message.value;
    
    for ( var client in clients ) {
        if ( socket.id !== client ) {
            io.to(client).emit("message", message);
        }
    }

    console.log( 'message sent to connected clients: ', Object.keys(clients), ' by: ', socket.id );

  });

  socket.on('disconnect', function(){
      delete clients[socket.id];
      console.log('/// disconnected client /////////////>', socket.id);
  });

});
