with (Hasher()) {

  define('before_filter', function(name, callback) {
  	if (!this.hasOwnProperty('before_filters')) this.before_filters = [];
    this.before_filters.push({ name: name, callback: callback, context: this });
  });

  define('after_filter', function(name, callback) {
  	if (!this.hasOwnProperty('after_filters')) this.after_filters = [];
    this.after_filters.push({ name: name, callback: callback, context: this });
  });

  define('run_filters', function(name) {
  	var filters = [];
  	var obj = this;
  	var that = this;
  	while (obj) {
  		if (obj.hasOwnProperty(name + '_filters')) filters = obj[name + '_filters'].concat(filters);
  		obj = obj.__proto__;
  	}
	
	  for (var i=0; i < filters.length; i++) {
      Hasher.running_filters = true;
  		filters[i].callback.call(that);
      delete Hasher.running_filters;

  		if (Hasher.filter_performed_action) {
        var tmp_action = Hasher.filter_performed_action;
        delete Hasher.filter_performed_action;
  		  tmp_action.call(filters[i].context);
  		  return;
  		}
	  }

    return true;
  });

  define('capture_action_if_called_when_filtering', function(method_name) {
    var that = this;
    var real_method = this[method_name];
    define(method_name, function() {
      var this_args = Array.prototype.slice.call(arguments);
      if (Hasher.running_filters) {
        if (Hasher.filter_performed_action) {
          alert('ERROR: double action in filters');
          return;
        }
        Hasher.filter_performed_action = function() { real_method.apply(that, this_args); };
      } else {
        real_method.apply(this, this_args);
      }
    });
  });
  
  capture_action_if_called_when_filtering('set_route');
  capture_action_if_called_when_filtering('render');
}