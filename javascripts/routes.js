Hasher.routes = [];

with (Hasher()) {
  define('get_route', function() {
    var path_bits = window.location.href.split('#');
    var r = '#' + (path_bits[1] || '');
    return r;
  });

  define('set_route', function(path, skip_updating_browser_bar) {
    if (!skip_updating_browser_bar) window.location.href = window.location.href.split('#')[0] + path;
    Hasher.previous_route = path;

    for (var i=0; i < Hasher.routes.length; i++) {
      var route = Hasher.routes[i];
      var matches = path.match(route.regex);
      if (matches) {

        // run before filters (copied below)
        // TODO: check skip_before_filters and skip_after_filters
        // var controller_chain = Hasher.InternalHelpers.controller_parent_chain(route.namespace);
        // for (var j=0; j < controller_chain.length; j++) {
        //   for (var k=0; k < (controller_chain[j].before_filters || []).length; k++) {
        //     controller_chain[j].before_filters[k].callback.call();
        //     if (Hasher.Internal.performed_action) return;
        //   }
        // }

        // run the action
        route.callback.apply(null, matches.slice(1));

        // // run after filters (copied form above)
        // var controller_chain = Hasher.InternalHelpers.controller_parent_chain(route.namespace);
        // for (var j=0; j < controller_chain.length; j++) {
        //   for (var k=0; k < (controller_chain[j].after_filters || []).length; k++) {
        //     controller_chain[j].after_filters[k].callback.call();
        //     if (Hasher.Internal.performed_action) return;
        //   }
        // }

        return;
      }
    }

    alert('404 not found: ' + path);
  });
  
  define('route', function(path, callback) {
    Hasher.routes.push({ 
      regex: (new RegExp("^" + path.replace(/:[a-z_]+/g, '([^/]+)') + '$')),
      callback: callback
    });
  });

  // TODO: before_filter, after_filter

  // setup browser hooks and timers
  (function() {
    var callback = function() {
      var hash = get_route();
      if (hash != Hasher.previous_route) set_route(hash, true);
    }
    window.onload = callback;
    setInterval(callback, 100);
  })();
}