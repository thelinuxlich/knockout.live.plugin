/** Syntactic sugar */
var KO = function(value) {
  if($.isArray(value) === true)
    return ko.observableArray(value);
  else if(typeof value === "function") {
    if(arguments.length > 1)
        return ko.dependentObservable(value,arguments[1]);
    else
        return ko.dependentObservable(value);
  } else
    return ko.observable(value);
};

/** Cache to fasten varname searches */
ko.utils.cachedVarnameReferences = {};

/** Wraps socket.io client and messaging for knockout observables */
ko.utils.socketConnect = function(address,port) {
    ko.socket = new io.Socket(address, {port: port, rememberTransport: false});
    ko.socket.connect();
    ko.socket.on('message', function(obj){
      if(obj.msg.varname in ko.utils.cachedVarnameReferences) {
        var temporaryViewModelField = ko.utils.cachedVarnameReferences[obj.msg.varname];
      } else {
        var obj_tree = obj.msg.varname.split("."),
            temporaryViewModelField = window[obj_tree.splice(0,1)];
        for(var i = 0;i < obj_tree.length;i++) {
          temporaryViewModelField = temporaryViewModelField[obj_tree[i]];
        }
        ko.utils.cachedVarnameReferences[obj.msg.varname] = temporaryViewModelField;
      }
      temporaryViewModelField({koValue: obj.msg.value,sync: false});
    });
};

/** Custom writable dependent observable that handles synchronizing with node server */
Function.prototype.live = function(varname) {
  var underlyingObservable = this;

  var obs = ko.dependentObservable({
          read: underlyingObservable,
          write: function(value) {
              if(typeof value === "object" && value.sync === false && value.koValue !== undefined) {
                underlyingObservable(value.koValue);
              } else if(typeof value === "object" && value.koValue !== undefined){
                underlyingObservable(value.koValue);
                ko.socket.send({varname: varname,value: value.koValue});
              } else {
                underlyingObservable(value);
                ko.socket.send({varname: varname,value: value});
              }
          }
  });

  //This is needed for observableArrays
  if($.isArray(underlyingObservable()) === true) {
      ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
          obs[methodName] = function () {
              var methodCallResult = underlyingObservable[methodName].apply(underlyingObservable(), arguments);
              ko.socket.send({varname: varname,value: underlyingObservable()});
              underlyingObservable.valueHasMutated();
              return methodCallResult;
          };
      });

      obs.slice = function () {
          return underlyingObservable[methodName].apply(underlyingObservable(), arguments);
      };

      obs.remove = function (valueOrPredicate) {
          var underlyingArray = underlyingObservable();
          var remainingValues = [];
          var removedValues = [];
          var predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
          for (var i = 0, j = underlyingArray.length; i < j; i++) {
              var value = underlyingArray[i];
              if (!predicate(value))
                  remainingValues.push(value);
              else
                  removedValues.push(value);
          }
          underlyingObservable(remainingValues);
          ko.socket.send({varname: varname,value: underlyingObservable()});
          return removedValues;
      };

      obs.removeAll = function (arrayOfValues) {
          // If you passed zero args, we remove everything
          if (arrayOfValues === undefined) {
              var allValues = underlyingObservable();
              underlyingObservable([]);
              ko.socket.send({varname: varname,value: underlyingObservable()});
              return allValues;
          }

          // If you passed an arg, we interpret it as an array of entries to remove
          if (!arrayOfValues)
              return [];
          var elements = underlyingObservable.remove(function (value) {
              return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
          });
          ko.socket.send({varname: varname,value: underlyingObservable()});
          return elements;
      };

      obs.destroy = function (valueOrPredicate) {
          var predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
          for (var i = underlyingObservable().length - 1; i >= 0; i--) {
              var value = underlyingObservable()[i];
              if (predicate(value))
                  underlyingObservable()[i]["_destroy"] = true;
          }
          underlyingObservable.valueHasMutated();
          ko.socket.send({varname: varname,value: underlyingObservable()});
      };

      obs.destroyAll = function (arrayOfValues) {
          // If you passed zero args, we destroy everything
          if (arrayOfValues === undefined) {
              var result = underlyingObservable.destroy(function() { return true });
              ko.socket.send({varname: varname,value: underlyingObservable()});
              return result;
          }
          // If you passed an arg, we interpret it as an array of entries to destroy
          if (!arrayOfValues)
              return [];
          var result = underlyingObservable.destroy(function (value) {
              return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
          });
          ko.socket.send({varname: varname,value: underlyingObservable()});
          return result;
      };

      obs.indexOf = function (item) {
          var underlyingArray = underlyingObservable();
          return ko.utils.arrayIndexOf(underlyingArray, item);
      };

      obs.replace = function(oldItem, newItem) {
          var index = underlyingObservable.indexOf(oldItem);
          if (index >= 0) {
              underlyingObservable()[index] = newItem;
              underlyingObservable.valueHasMutated();
              ko.socket.send({varname: varname,value: underlyingObservable()});
          }
      };
  }
  return obs;
};

