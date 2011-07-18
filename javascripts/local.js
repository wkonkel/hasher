HashTag({
	Local: {
		// need to move escaping, serializing, etc all into here... and local versus XD as well... this should be HashTag.Request though
		api: function(options) {
			if (!options.parameters) options.parameters = {};
			options.parameters.session = Object.toJSON(HashTag.Context.facebook_session);
			options.parameters.cache = options.parameters.cache || (new Date().getTime());

			new Ajax.Request(options.url, {
				method: options.method || 'get',
				parameters: options.parameters,
				onSuccess: function(response) { (options.onSuccess || function(){}).call(HashTag.Context, response.responseJSON); }
			});
		}
	},

	Remote: {
	  Callbacks: {},
	  
		api: function(options) {
      var callback_name = null;
      while (!callback_name || HashTag.Remote.Callbacks[callback_name]) {
        callback_name = 'callback_' + Math.floor(1000000*Math.random());
      }

      HashTag.Remote.Callbacks[callback_name] = function(response) {
        delete HashTag.Remote.Callbacks[callback_name];
        (options.onSuccess || function(){})(response);
      }

			if (!options.parameters) options.parameters = {};
			options.parameters.cache = options.parameters.cache || (new Date().getTime());
			options.parameters.jsonp = 'HashTag.Remote.Callbacks.' + callback_name;

      var script = document.createElement("script");        
      script.async = true;
      script.type = 'text/javascript';
      script.src = options.url + '?' + $H(options.parameters).toQueryString();
      document.body.appendChild(script);
		}
	}
	
})
