Hasher.routes = [];

with (Hasher()) {
  // check for new routes on the browser bar every 100ms
  initializer(function() {
    var callback = function() {
      setTimeout(callback, 100);
      var hash = get_route();
      if (hash != Hasher.current_route) set_route(hash, true);
    }
    callback();
  });
 
  // TODO: add a handler to document.body that intercepts clicks on <a href="#..."> tags
  // if (options.href && options.href.indexOf('#') == 0) {
  //   var hash = options.href;
  //   options.href = '';
  //   options.onClick = function(e) {
  //     stop_event(e);
  //     set_route(hash);
  //   }
 
  // define a route
  //   route('#', function() {})  or  route({ '#': function(){}, '#a': function(){} })
  define('route', function(path, callback) {
    if (typeof(path) == 'string') {
      Hasher.routes.push({
        regex: (new RegExp("^" + path.replace(/:[a-z_]+/g, '([^/]+)') + '$')),
        callback: callback,
				context: this
      });
    } else {
      for (var key in path) {
        this.route(key, path[key]);
      }
    }
  });

  // return the current route as a string from browser bar
  define('get_route', function() {
    var path_bits = window.location.href.split('#');
    var r = '#' + (path_bits[1] || '');
    return r;
  });

  define('set_route', function(path, skip_updating_browser_bar) {
		// if (Hasher.performing_action) {
		// 	setTimeout(curry(set_route, path, skip_updating_browser_bar), 0);
		// 	return;
		// }
		// Hasher.performing_action = true;

    if (!skip_updating_browser_bar) window.location.href = window.location.href.split('#')[0] + path;
    Hasher.current_route = path;

    for (var i=0; i < Hasher.routes.length; i++) {
      var route = Hasher.routes[i];
      var matches = path.match(route.regex);
      if (matches) {
        route.context.run_filters('before');
				//if (!Hasher.performed_action) {
	        route.callback.apply(null, matches.slice(1));
	        route.context.run_filters('after');
				//}
        return;
      }
    }

    alert('404 not found: ' + path);
  });


  define('before_filter', function(name, callback) {
		if (!this.hasOwnProperty('before_filters')) this.before_filters = [];
	  this.before_filters.push({ name: name, callback: callback });
  });

  define('after_filter', function(name, callback) {
		if (!this.hasOwnProperty('after_filters')) this.after_filters = [];
	  this.after_filters.push({ name: name, callback: callback });
  });

	define('run_filters', function(name) {
		var filters = [];
		var obj = this;
		var that = this;
		while (obj) {
			if (obj.hasOwnProperty(name + '_filters')) filters = obj[name + '_filters'].concat(filters);
			obj = obj.__proto__;
		}
		
		for_each(filters, function(filter) {
			filter.callback.call(that);
			//if (Hasher.performed_action) return;
		});
	});
}