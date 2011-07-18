// possible todos?
// - json parsing
// - ajax requests/jsonp
// - xd communication
// - query string processing
// - array/hash/string helpers
// - alert if there's ane expected return value but it returns null/undefined
// - recursion using callee -- alert((function(n){ if(n <= 1){return 1;}else{return n*arguments.callee(n-1);}})(10));

var HashTag = function(hash) {
	// for (var i=0; i < arguments.length; i++) {
	// 	for (k in )
	// }
	if (typeof hash === "function") {
		var _func = hash;
		return function() {
			return _func.apply(HashTag.Context, arguments);
		};
	} else {
		for (key in hash) {
			if (!HashTag[key]) {
				HashTag[key] = hash[key];
			} else if (HashTag[key].concat) {
				// this order could be backwards
				HashTag[key] = HashTag[key].concat(hash[key]);
			} else {
				// assume this is a hash
				// could automatically create objects
				for (var k2 in hash[key]) {
					HashTag[key][k2] = hash[key][k2];
				}
			}
		}
	}
};

HashTag({
	Event: {
		stop: function(e) {
		  if (e) {
  	    e.cancelBubble = true;
  			e.returnValue = false;
  			e.stopped = true;
		  }
		}
	},
	
	Util: {
		resolveNamespace: function(str) {
			var retval = window;
			var ns = null;
			var path = str.split('.');
			while ((ns = path.shift())) {
				if (!retval[ns]) {
					return null;
				} else {
					retval = retval[ns];
				}
			}
			return retval;
		}
	},
	
	Helpers: {
		redirect_to: function(url) { 
			var _url = url;
			return function() { 
				HashTag.Event.stop(event || window.event); 
				HashTag.UrlHash.set(_url);
			};
		}
	}
});
