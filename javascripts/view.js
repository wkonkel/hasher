// TODO: remove prototype dependency inject/flatten/$A/etc
HashTag({
	Helpers: ["script", "meta", "title", "link", "button", "script", "div", "p", "span", "a", "img", "br", "hr", "table", "tr", "th", "td", "thead", "tbody", "tfoot", "ul", "ol", "li", "dl", "dt", "dd", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "form", "input", "label", "option", "select", "textarea", "strong", "iframe", "fb:like"].inject({}, function(hash, tag){
		hash[tag.replace(/:/g,'_')] = function() {
			arguments = $A(arguments).flatten();

			var element = document.createElement(tag);

			var options = {};
			var start = 0;
			var end = arguments.length - 1;
			if ((typeof(arguments[end]) == 'object') && (typeof(arguments[end].nodeType) == 'undefined')) {
				options = arguments[end--];
			} else if ((typeof(arguments[start]) == 'object') && (typeof(arguments[start].nodeType) == 'undefined')) {
				options = arguments[start++];
			}

			for (var k in options) {
				if (k == 'events') {
					for (var ek in options[k]) {
						if (element.addEventListener) {
							element.addEventListener(ek, options[k][ek], false);
						} else {
							element.attachEvent("on" + ek, options[k][ek]);
						}
					}
				} else if (k == 'class') {
					element.className = options[k];
				} else if (k == 'style') {
					element.style.cssText = options[k];
				} else {
					element.setAttribute(k, options[k]);
				}
			}

			for (var j=start; j <= end; j++) {
				if (typeof(arguments[j]) == 'object') {
					element.appendChild(arguments[j]);
				} else if (arguments[j]) {
					element.appendChild(document.createTextNode(arguments[j]));
				}
			}
			
			return element;
		};

		return hash;
	})
});

HashTag({
	// Initializers: {
	// 	// move initial static DOM into hidden div
	// 	layouts: function() {
	// 		with (HashTag.Helpers) {
	// 			HashTag.Views.Layouts['static'] = div({ id: 'layout-static', style: 'display: none' });
	// 			document.body.appendChild(HashTag.Views.Layouts['static']);
	// 			while (document.body.childNodes[0] != HashTag.Views.Layouts['static']) HashTag.Views.Layouts['static'].appendChild(document.body.childNodes[0]);
	// 		}
	// 	}
	// },
	
	Views: {
		Layouts: {}
	},
	
	Helpers: {
		render: function(options) {
			with (HashTag.Helpers) {
				var layout = options.layouts || 'application';
				if (!document.getElementById('layout-' + layout)) {
					document.body.appendChild(div({ id: 'layout-' + layout }, (HashTag.Views.Layouts[layout]).call(HashTag.Context, div({ id: 'layout-' + layout + '-content' }))));
				}
				document.getElementById('layout-' + layout + '-content').innerHTML = '';
				// console.log('render');
				// console.log('HashTag.Views.' + options.view);
				var view = HashTag.Util.resolveNamespace('HashTag.Views.' + options.view);
				if (view) {
					document.getElementById('layout-' + layout + '-content').appendChild(view.call(HashTag.Context, options.locals || {}));
					FB.XFBML.parse($('layout-' + layout + '-content'));
				} else {
					//console.log('no view to render!?')
				}
			}
		}
	}
});
