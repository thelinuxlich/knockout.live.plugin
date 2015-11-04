# Knockout Live Plugin

## Installation:
Clone the repository

    npm install
    node server.js

Visit index.html

## Files:
* js/knockout.live.plugin.js on the client
* js/main.js has the example for the chat application
* server.js running on node server

## Dependencies:
* Knockout 3.3.0+
* Socket.io v1.3.7 client/server
* Node.js and socket.io on the server side

## Notes
* The chat example run on port 4000, change js/main.js and server.js if required
* This example does not use node, you need a web server running on 80 like nginx or apache

## What do you need for your application to go "live"?:
* Set .live() on all ko.observable() and ko.observableArray() you want to synchronize remotely(see the chat example)
* Run ko.utils.socketConnect(address,port) before ko.applyBindings()

## Options for live():
* id: "my_id" sets a custom ID for sync purposes. This is useful if you are syncing between different apps.
* readonly: true blocks all direct changes to the live observable. It will update only by socket messages from the server.

## TODO:
* Adapter interface for sync options besides socket.io

