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

  clients.push(socket);

  socket.emit("message",syncObjs);

  socket.on('message', function(message) {
    // append sync values to temporary storage
    // here you could block people trying to manually update via socket.send live readonly observables with named IDs
    syncObjs['knockoutObjects'][message.id] = message.value;
    for(var i=0,j=clients.length; i < j;i++ ) {
        if(clients[i].id !== socket.id)
            clients[i].emit("message",message); 
    }
  });

  socket.on('disconnect', function(){
      for(var i=0,j=clients.length; i < j;i++ ) {
          if(!!clients[i]['id'])
              if(clients[i].id == socket.id)
                  clients.splice(i,1);
      }
        console.log(socket.id,'disconnected ------------- ');
        console.log(clients);
  });

});
