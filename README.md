# Knockout Live Plugin

## Installation:
* Clone the repository

    npm install
    node server.js

* Visit index.html

## Files:
* knockout.live.plugin.js on the client
* server.js running on node server

## Dependencies:
* Knockout 2.0+
* Socket.io client/server
* Node.js and socket.io on the server side

## Steps to see it happen:
* Clone the repo
* Run "npm install socket.io"
* Run "node server.js"
* Point your browser to localhost:8080

## What do you need for your application to go "live"?:
* Start a simple node server with the server.js included in this project(modify it as you desire)
* Set .live() on all ko.observable() and ko.observableArray() you want to synchronize remotely(see the chat example)
* Run ko.utils.socketConnect(address,port) before ko.applyBindings()

## Options for live():
* id: "my_id" sets a custom ID for sync purposes. This is useful if you are syncing between different apps.
* readonly: true blocks all direct changes to the live observable. It will update only by socket messages from the server.

## TODO:
* Adapter interface for sync options besides socket.io

