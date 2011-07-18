HashTag({
	
	Listeners: {},

	Context: {
		fire: function(str) {
			if (!str || !HashTag.Listeners[str]) return;
			
			// delay processing so we don't have to handle fireing an event inside of another event
			var _str = str;
			var _arguments = arguments;
			setTimeout(function() {
				// why doesn't arguments have .slice()?
				var actual_args = [];
				for (var i=1; i < _arguments.length; i++) {
					actual_args.push(_arguments[i]);
				}

				for (i=0; i < HashTag.Listeners[_str].length; i++) {
					HashTag.Listeners[_str][i].apply(HashTag.Context, actual_args);
				}
			}, 0);
		},

		observe: function(str, callback) {
			(HashTag.Listeners[str] = (HashTag.Listeners[str] || [])).push(callback);
		}
	}
});


// TODO: need a better onDomReady impl
window.onload = function() { 
	if (HashTag.Initializers) {
		for (var init in HashTag.Initializers) {
			HashTag.Initializers[init].call(HashTag.Context);
		}
	}

	HashTag.Context.fire('after_initialize');
};
