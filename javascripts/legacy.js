// this file should be avoided if possible... this is a backwards compatibilty layer with 0.0.5
with (Hasher()) {
  Hasher.Controller = Hasher;
  Hasher.View = Hasher;
  Hasher.Routes = { getHash: get_route, setHash: set_route };

  define('create_layout', layout);
  define('redirect_to', set_route);

  // performed_action is used for the legacy "render default view if no render/redirect_to"
  redefine('render', function(callback) {
    Hasher.performed_action = true;
    callback.apply(this, Array.prototype.slice.call(arguments,1));
  });
  redefine('set_route', function(callback) {
    Hasher.performed_action = true;
    callback.apply(this, Array.prototype.slice.call(arguments,1));
  });
  define('create_action', function(name,callback) { 
    var that = this;
    this.define("action_" + name, function() {
      Hasher.performed_action = false;
      callback.apply(that, Array.prototype.slice.call(arguments));
      if (!Hasher.performed_action) {
        if (that['view_' + name]) that.render(that['view_' + name].call(this));
      }
      delete Hasher.performed_action;
    });
  });
  
  
  define('action', function() {
    var that_arguments = arguments;
    var that = this;
    return function() { 
      if (that_arguments[0].indexOf('.') >= 0) {
        var parts = that_arguments[0].split('.');
        return that[parts[0]]['action_' + parts[1]].apply(that[parts[0]], Array.prototype.slice.call(that_arguments,1).concat(Array.prototype.slice.call(arguments,0)));
      } else {
        return that['action_' + that_arguments[0]].apply(that, Array.prototype.slice.call(that_arguments,1).concat(Array.prototype.slice.call(arguments,0)));
      }
    }
  });
  define('call_action', function() {
    return action.apply(this,Array.prototype.slice.call(arguments))();
  });


  define('create_helper', function(name,callback) { this.define("helper_" + name, callback); });
  define('helper', function() {
    var that_arguments = arguments;
    var that = this;

    if (that_arguments[0].indexOf('.') >= 0) {
      var parts = that_arguments[0].split('.');
      return that[parts[0]]['helper_' + parts[1]].apply(that[parts[0]], Array.prototype.slice.call(that_arguments,1));
    } else {
      return that['helper_' + that_arguments[0]].apply(that, Array.prototype.slice.call(that_arguments,1));
    }
  });

  define('create_view', function(name,callback) { this.define("view_" + name, callback); }); 


  define('input', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    return this[options.type || 'text'](options, arguments);
  });
  
  (function() {
    var real_route = route;
    define('route', function(hash) {
      var that = this;
      for (var key in hash) {
        (function(key,hash) {
          real_route.call(that, key, function() {
            var func = that['action_' + hash[key]] || function(){ this.render(this['view_' + hash[key]].call(this)); };
            func.apply(that, flatten_to_array(arguments));
          });
        })(key, hash);
      }
    });
  })();
  
  (function() {
    var real_render = render;
    define('render', function(view_name) {
      if ((typeof(view_name) == 'string') && this['view_' + view_name]) { 
        real_render.call(this, this['view_' + view_name].apply(this, Array.prototype.slice.call(arguments,1)));
      } else {
        real_render.apply(this, flatten_to_array(arguments));
      }
    });
  })();

  // add in legacy events hash
  redefine('element', function(callback) {
    var arguments = Array.prototype.slice.call(arguments,1);
    var tag = arguments.shift();
    var options = shift_options_from_args(arguments);
    if (options.events) {
      var events = options.events;
      delete options.events;
      for (var k in events) {
        options['on' + k] = events[k];
      }
    }
    return callback.call(this, tag, options, arguments);
  });

  (function() {
    var real_layout = layout;
    define('layout', function(name, callback) {
      if (!callback) {
        this.default_layout = this[name];
      } else {
        real_layout.apply(this, flatten_to_array(arguments));
      }
    });
  })();

}