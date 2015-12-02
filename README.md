# Knockout Live Plugin

## Installation:
Clone the repository

    npm install
    node server.js

Visit /index.html to see the example chat application.

## Files:
* js/knockout.live.plugin.js on the client
* js/main.js has the example for the chat application
* server.js running on node server

## Dependencies:
* Knockout 3.4.0
* Socket.io v1.3.7 client/server
* Node.js and socket.io on the server side
* index.html should be requested from a web server e.g. apache, nginx

## Notes
* The chat example runs on port 4000, change port variable in js/main.js and server.js if required
* Check the terminal for logs (message sent & disconnected client)

## What do you need for your application to go "live"?:
* Set .live() on all ko.observable() and ko.observableArray() you want to synchronize remotely(see the chat example)
* Run ko.utils.socketConnect(address,port) before ko.applyBindings()

## Options for live():
* id: "my_id" sets a custom ID for sync purposes. This is useful if you are syncing between different apps.
* readonly: true blocks all direct changes to the live observable. It will update only by socket messages from the server.

## TODO:
* Adapter interface for sync options besides socket.io

