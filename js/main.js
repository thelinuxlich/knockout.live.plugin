jQuery(function ($) {

  var 
  port          = 4000,
  serverAddress = 'http://'+document.domain+':'+port;

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

    self.send = function() {
      self.messages.push("<em>"+self.message()+"<em><br/>");
      self.message("");
    };

  } // ko


  var appmodel = new AppViewModel();
  
  ko.utils.socketConnect( serverAddress, port );

  ko.applyBindings( appmodel );


}); // jQuery ends
