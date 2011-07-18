HashTag({
	Initializers: {
		routing: function() {
			
			// checks the browser URL bar for changes every 50ms and does a UrlHash.set() if it changes.
			// this also kicks off the very initial url_hash_change event that starts the app as it goes from undefined to something.
			this.observe('after_initialize', function() { 
				setInterval(HashTag.UrlHash.check, 10);
				HashTag.UrlHash.check();
			});


			// whenever the URL changes, this loops through all Routes and runs the one that makes the most sense
			this.observe('url_hash_change', function(hash) { 
				if (hash == '#') hash = '#/';

				for (var route in HashTag.Routes) {
					// TODO: building regexp each time is expensive... it should be done once and cached
					var matches = hash.match((new RegExp("^" + route.replace(/:[a-z_]+/g, '([^/]+)') + '$')));
					if (matches) {
						var render_options = HashTag.Routes[route].apply(HashTag.Context, matches.slice(1)) || {};
					
						if (render_options) {
							if (render_options.redirect_to) {
								HashTag.UrlHash.set(render_options.redirect_to);
							} else if (render_options.view) {
								HashTag.Helpers.render(render_options);
								// if (!render_options.view) render_options.view = HashTag.Routes[route].to;
							}
						}
						
						return;
					}
				}

				alert('404: Hash not found');
			});
		}
	},
	
	Routes: {},
	
	UrlHash: {
		// NOTE: xd stuff could go in here as well... there's already a timer checking hash tags... maybe just prefix url with 'xd:'
		get: function() {
	    var path_bits = window.location.href.split('#');
	    var r = path_bits[1] && (path_bits[1].match(/^\//) || path_bits[1] == '') ? '#' + path_bits[1] : '#';
			return r;
		},

		set: function(hash) {
			window.location.href = window.location.href.split('#')[0] + hash;
		},
		
		check: function() {
			var hash = HashTag.UrlHash.get();
			if (hash != HashTag.UrlHash.previous_hash) {
				HashTag.UrlHash.previous_hash = hash;
				HashTag.Context.fire('url_hash_change', hash);
			}
		}
	}
});
