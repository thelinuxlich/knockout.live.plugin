/*!
 * Knockout Live plugin
 * http://github.com/thelinuxlich/knockout.live.plugin
 *
 * Copyright 2011, Alisson Cavalcante Agiani
 * Licensed under the MIT license.
 * http://github.com/thelinuxlich/knockout.live.plugin/MIT-LICENSE.txt
 *
 * Date: Mon Feb 01 09:00:29 2011 -0300
*/

/** Temporary values with unique IDs for syncable objects goes here */
ko.syncObjects = {sequenceSyncID: 0};

/** isArray helper */
ko.utils.isArray = function(obj) {
    return Array.isArray(obj) || toString.call(obj) === "[object Array]";
};

/** Syntactic sugar */
var KO = function(value) {
  if(ko.utils.isArray(value) === true)
    return ko.observableArray(value);
  else if(typeof value === "function") {
    if(arguments.length > 1)
        return ko.computed(value,arguments[1]);
    else
        return ko.computed(value);
  } else
    return ko.observable(value);
};

/** Wraps socket.io client and messaging for knockout observables */
ko.utils.socketConnect = function(address,port) {
    ko.socket = io.connect(address, {port: port, rememberTransport: false});
    ko.socket.on('message', function(obj){
      // primitive server-side storage
      if(obj.knockoutObjects !== undefined) {
        for(var i in obj.knockoutObjects) {
            if(obj.knockoutObjects.hasOwnProperty(i))
                ko.syncObjects[i]({value: obj.knockoutObjects[i],sync: false});
        }
      } else {
          ko.syncObjects[obj.id]({value: obj.value,sync: false});
      }
    });
};

/** Custom writable dependent observable that handles synchronizing with node server */
Function.prototype.live = function(options) {

  var underlyingObservable = this,
      tempID    = null;
      options   = options ? options : {readonly: false},  
      readonly  = options.readonly;
  
  
  if(options.id === undefined || options.id === null) {
    tempID = ko.syncObjects.sequenceSyncID + 1;
    ko.syncObjects.sequenceSyncID = tempID;
    tempID = "ko_update_"+tempID;
  } else {
    tempID = options.id;
  }  

  var obs = ko.computed({
          read: underlyingObservable,
          write: function(value) {
              if(readonly === false) {
                if(typeof value === "object" && value.sync === false && value.value !== undefined) {
                  underlyingObservable(value.value);
                } else if(typeof value === "object" && value.value !== undefined){
                  underlyingObservable(value.value);
                  ko.socket.emit("message",{id: tempID,value: value.value});
                } else {
                  underlyingObservable(value);
                  ko.socket.emit("message",{id: tempID,value: value});
                }
              }  
          }
  });

  // This is needed for observableArrays
  if(ko.utils.isArray(underlyingObservable()) === true) {
      ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
          obs[methodName] = function () {
              if(readonly === false) {
                var methodCallResult = underlyingObservable[methodName].apply(underlyingObservable, arguments);
                ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
                underlyingObservable.valueHasMutated();
                return methodCallResult;
              }
          };
      });

      obs.slice = function () {
          return underlyingObservable[methodName].apply(underlyingObservable, arguments);
      };

      obs.remove = function (valueOrPredicate) {
          if(readonly === false) {
            
            var 
              underlyingArray = underlyingObservable(),
              remainingValues = [],
              removedValues = [],
              predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) { return value === valueOrPredicate; };

            for (var i = 0, j = underlyingArray.length; i < j; i++) {
                var value = underlyingArray[i];
                if (!predicate(value))
                    remainingValues.push(value);
                else
                    removedValues.push(value);
            }

            underlyingObservable(remainingValues);
            ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
            
            return removedValues;
          }  
      };

      obs.removeAll = function (arrayOfValues) {
          if(readonly === false) {
            // If you passed zero args, we remove everything
            if (arrayOfValues === undefined) {
                var allValues = underlyingObservable();
                underlyingObservable([]);
                ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
                return allValues;
            }

            // If you passed an arg, we interpret it as an array of entries to remove
            if (!arrayOfValues)
                return [];
            var elements = underlyingObservable.remove(function (value) {
                return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
            });
            ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
            return elements;
          }  
      };

      obs.destroy = function (valueOrPredicate) {
          if(readonly === false) {
            var predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
            for (var i = underlyingObservable().length - 1; i >= 0; i--) {
                var value = underlyingObservable()[i];
                if (predicate(value))
                    underlyingObservable()[i]["_destroy"] = true;
            }
            underlyingObservable.valueHasMutated();
            ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
          }  
      };

      obs.destroyAll = function (arrayOfValues) {
          if(readonly === false) {
            // If you passed zero args, we destroy everything
            if (arrayOfValues === undefined) {
                var result = underlyingObservable.destroy(function() { return true });
                ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
                return result;
            }
            // If you passed an arg, we interpret it as an array of entries to destroy
            if (!arrayOfValues)
                return [];
            var result = underlyingObservable.destroy(function (value) {
                return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
            });
            ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
            return result;
          }  
      };

      obs.indexOf = function (item) {
          var underlyingArray = underlyingObservable();
          return ko.utils.arrayIndexOf(underlyingArray, item);
      };

      obs.replace = function(oldItem, newItem) {
          if(readonly === false) {
            var index = underlyingObservable.indexOf(oldItem);
            if (index >= 0) {
                underlyingObservable()[index] = newItem;
                underlyingObservable.valueHasMutated();
                ko.socket.emit("message",{id: tempID,value: underlyingObservable()});
            }
          }  
      };
  }

  /** Let's eat our own dog food now */

  ko.syncObjects[tempID] = KO("");

  ko.syncObjects[tempID].subscribe(function(value) {
    if ( readonly === false ) {
      obs(value);
    } else {
      underlyingObservable(value);
    }
  });

  return obs;
};
