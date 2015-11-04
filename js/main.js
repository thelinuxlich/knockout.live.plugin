/*
var VM = {
  messages: KO([]).live(),
  message: KO("")
};

VM.messages_html = KO(function() { return VM.messages().join("")});

VM.messages.subscribe(function() { $('#chat').scrollTop = 1000000; });

VM.send = function(){
  VM.messages.push("<em>"+VM.message()+"<em><br/>");
  VM.message("");
};

$(function() {
  ko.utils.socketConnect(null,4000); //Always start the remote client before applying bindings
  ko.applyBindings(VM);
});

*/


jQuery(function ($) {

  var 
  port          = 4000,
  serverAddress = 'http://'+document.domain+':'+port;
//  socket        = io.connect(serverAddress);

  /**
  *
  * App View Model
  *
  */

  function AppViewModel() {
    
    var self = this;

    self.message        = ko.observable('');
    
    self.messages       = ko.observableArray([]).live();
    
    self.messages_html  = ko.computed(function (){
      return self.messages().join('');
    });

    self.messages.subscribe(function(){
      $('#chat').scrollTop = 1000000;
    });

    self.send = function(){
      self.messages.push("<em>"+self.message()+"<em><br/>");
      self.message("");
    };

  } // ko


  var hatchmodel = new AppViewModel();
  
  ko.utils.socketConnect( serverAddress, port );

  ko.applyBindings( hatchmodel );


}); // jQuery ends
