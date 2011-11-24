/**********************************************************************************
 *                                                                                *
 *  Hasher.js - 0.0.5 - A client-side view-controller framework for JavaScript.   *
 *                                                                                *
 *  Copyright (C) 2011 by Warren Konkel                                           *
 *                                                                                *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy  *
 *  of this software and associated documentation files (the "Software"), to deal *
 *  in the Software without restriction, including without limitation the rights  *
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell     *
 *  copies of the Software, and to permit persons to whom the Software is         *
 *  furnished to do so, subject to the following conditions:                      *
 *                                                                                *
 *  The above copyright notice and this permission notice shall be included in    *
 *  all copies or substantial portions of the Software.                           *
 *                                                                                *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    *
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      *
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   *
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        *
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, *
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     *
 *  THE SOFTWARE.                                                                 *
 *                                                                                *
 **********************************************************************************/

var Hasher = {
  ie7_browser: false,
  Event: {
    listeners: {},

    fire: function(event) {
      var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]);
      (Hasher.Event.listeners[event] || []).map(function(listener) {
        listener.callback.apply(listener.context, _arguments.slice(1));
      });
    },

    observe: function(event, callback, context) {
      if (!Hasher.Event.listeners[event]) Hasher.Event.listeners[event] = [];
      Hasher.Event.listeners[event].push({ callback: callback, context: context } );
    },

    stop: function(e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      e.cancelBubble = true;
      e.returnValue = false;
    }
  },

  Controller: function(namespace, parent) {
    // controller object defaults
    Hasher.Internal.controllers[namespace] = Hasher.Internal.controllers[namespace] || {
      parent: parent,
      layout: null,
      before_filters: [],
      skip_before_filters: [],
      after_filters: [],
      skip_after_filters: [],
      actions: {},
      scope: {
        initializer: function(callback) {
          Hasher.Internal.initializers.push(callback);
        },

        before_filter: function(filter_name, callback) {
          Hasher.Internal.controllers[namespace].before_filters.push({ name: filter_name, callback: callback });
        },

        // skip_before_filter: function(filter_name) {
        //   Hasher.Internal.controllers[namespace].skip_before_filters.push({ name: filter_name, callback: callback });
        // },

        after_filter: function(filter_name, callback) {
          Hasher.Internal.controllers[namespace].after_filters.push({ name: filter_name, callback: callback });
        },

        // skip_after_filter: function(filter_name) {
        //   Hasher.Internal.controllers[namespace].skip_after_filters.push({ name: filter_name, callback: callback });
        // },

        layout: function(layout_name) {
          Hasher.Internal.controllers[namespace].layout = 'Layout.' + layout_name;
        },

        create_action: function(action_name, callback) {
          Hasher.Internal.controllers[namespace].actions[action_name] = function(e) {
            var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;
            if (e && (typeof e.cancelBubble != 'undefined')) {
              // TODO: sometimes you want this event... perhaps suppress only some events
              arguments = arguments.slice(1);
              Hasher.Event.stop(e);
            }
            callback.apply(null, arguments);
          };
        },

        action: function(name) {
          var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;
          var args = arguments.slice(1);
          return function(e) {
            if (e && (typeof e.cancelBubble != 'undefined')) {
              Hasher.Event.stop(e);
            }
            var nmsp = namespace;
            if (name.indexOf('.') > 0) {
              var parts = name.split('.');
              nmsp = parts[0];
              name = parts[1];
            }
            Hasher.Internal.controllers[nmsp].actions[name].apply(null,args);
          };
        },

        call_action: function(name) {
          var nmsp = namespace;
          if (name.indexOf('.') > 0) {
            var parts = name.split('.');
            nmsp = parts[0];
            name = parts[1];
          }
          return Hasher.Internal.controllers[nmsp].actions[name].apply(null, Array.prototype.slice.call(arguments,1));
        },

        route: function(routes) {
          for (var route in routes) {
            Hasher.Internal.routes.push({
              regex: (new RegExp("^" + route.replace(/:[a-z_]+/g, '([^/]+)') + '$')),
              callback: routes[route],
              default_view: namespace + '.' + routes[route],
              namespace: namespace
            });
          }
        },

        redirect_to: function(url) {
          Hasher.Internal.performed_action = true;
          Hasher.Routes.setHash(url);
        },

        helper: function(name) {
          if (name.indexOf('.') == -1) name = namespace + '.' + name;
          return Hasher.Internal.helpers[name].apply(null, Array.prototype.slice.call(arguments,1));
        },

        render: function() {
          var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;

          Hasher.Internal.performed_action = true;

          var view = arguments[0];
          if (view.indexOf('.') == -1) view = namespace + '.' + view;
          if (!Hasher.Internal.views[view]) {
            alert('View not found: ' + view);
            return;
          }

          var parent_chain = Hasher.InternalHelpers.controller_parent_chain(namespace);
          var layout = null;
          for (var i=0; i < parent_chain.length; i++) {
            if (parent_chain[i].layout) layout = parent_chain[i].layout;
          }

          if (layout && !Hasher.Internal.views[layout]) {
            alert('Layout not found: ' + layout);
            return;
          }

          if (typeof(view) != 'string') {
            if (view.layout) layout = view.layout;
            view = view.view;
          }

          if (!Hasher.Internal.compiled_layouts[layout]) {
            Hasher.Internal.compiled_layouts[layout] = {};
            Hasher.Internal.compiled_layouts[layout].content_div = document.createElement('div');
            Hasher.Internal.compiled_layouts[layout].root_element = Hasher.Internal.views[layout].call(null, Hasher.Internal.compiled_layouts[layout].content_div);
            document.body.appendChild(Hasher.Internal.compiled_layouts[layout].root_element);
          }

          for (var key in Hasher.Internal.compiled_layouts) {
            Hasher.Internal.compiled_layouts[key].root_element.style.display = (key == layout ? 'block' : 'none');
          }

          var results = Hasher.Internal.views[view].apply(null, arguments.slice(1));
          Hasher.Internal.compiled_layouts[layout].content_div.innerHTML = '';
          Hasher.Internal.compiled_layouts[layout].content_div.appendChild(results);
        }
      }
    };

    return Hasher.Internal.controllers[namespace].scope;
  },

  View: function(namespace) {
    var methods = {
      create_layout: function(name, callback) {
        Hasher.Internal.views['Layout.' + name] = callback;
      },

      create_view: function(name, callback) {
        Hasher.Internal.views[namespace + '.' + name] = callback;
      },

      create_helper: function(name, callback) {
        Hasher.Internal.helpers[namespace + '.' + name] = callback;
      },

      helper: function(name) {
        if (name.indexOf('.') == -1) name = namespace + '.' + name;
        return Hasher.Internal.helpers[name].apply(null, Array.prototype.slice.call(arguments,1));
      },

      action: function(name) {
        // accepts "action_name" (current controller) or "Controller.action_name"
        var nmsp = namespace;
        if (name.indexOf('.') > 0) {
          var parts = name.split('.');
          nmsp = parts[0];
          name = parts[1];
        }

        var outer_args = Array.prototype.slice.call(arguments,1);
        return function(e) {
          if (e && (typeof e.cancelBubble != 'undefined')) {
            Hasher.Event.stop(e);
          }
          var inner_args = Array.prototype.slice.call(arguments);
          Hasher.Internal.controllers[nmsp].actions[name].apply(null,outer_args.concat(inner_args));
        };
      },

      inside_layout: function() {},
      inside_body: function() {}
    };

    // add in dom helpers
    for (var key in Hasher.DomHelpers) methods[key] = Hasher.DomHelpers[key];

    return methods;
  },

  Internal: {
    routes: [],
    controllers: {},
    views: {},
    helpers: {},
    compiled_layouts: {},
    initializers: []
  },

  Routes: {
    getHash: function() {
      var path_bits = window.location.href.split('#');
      var r = '#' + (path_bits[1] || '');
      return r;
    },

    setHash: function(hash) {
      window.location.href = window.location.href.split('#')[0] + hash;
      Hasher.Internal.previous_hash = null;
      setTimeout(Hasher.Routes.checkHash, 0);
    },

    checkHash: function() {
      var hash = Hasher.Routes.getHash();
      if (hash != Hasher.Internal.previous_hash) {
        Hasher.Internal.previous_hash = hash;
        Hasher.Routes.recognizeHash(hash);
        Hasher.Event.fire('hash_change', hash);
      }
    },

    recognizeHash: function(hash) {
      Hasher.Internal.performed_action = false;
      for (var i=0; i < Hasher.Internal.routes.length; i++) {
        var route = Hasher.Internal.routes[i];

        var matches = hash.match(route.regex);
        if (matches) {
          // run before filters (copied below)
          // TODO: check skip_before_filters and skip_after_filters
          var controller_chain = Hasher.InternalHelpers.controller_parent_chain(route.namespace);
          for (var j=0; j < controller_chain.length; j++) {
            for (var k=0; k < (controller_chain[j].before_filters || []).length; k++) {
              controller_chain[j].before_filters[k].callback.call();
              if (Hasher.Internal.performed_action) return;
            }
          }

          // run the action
          if (typeof(route.callback) == 'string') route.callback = Hasher.Internal.controllers[route.namespace].actions[route.callback];
          (route.callback || function(){}).apply(null, matches.slice(1));

          // render default view if render/redirect wasn't called
          if (!Hasher.Internal.performed_action) {
            Hasher.Internal.controllers[route.namespace].scope.render(route.default_view);
          }

          // run after filters (copied form above)
          var controller_chain = Hasher.InternalHelpers.controller_parent_chain(route.namespace);
          for (var j=0; j < controller_chain.length; j++) {
            for (var k=0; k < (controller_chain[j].after_filters || []).length; k++) {
              controller_chain[j].after_filters[k].callback.call();
              if (Hasher.Internal.performed_action) return;
            }
          }

          return;
        }
      }

      alert('404 not found: ' + hash)
    }
  },

  InternalHelpers: {
    // given a controller object (or name as a string), returns an array of parent controllers
    controller_parent_chain: function(controller) {
      if (typeof(controller) == 'string') controller = Hasher.Internal.controllers[controller]
      var stack = [controller];
      while (controller.parent) {
        controller = Hasher.Internal.controllers[controller.parent];
        stack.unshift(controller)
      }
      return stack;
    }
  },

  DomHelpers: (function() {
    var helpers = {};
    var tags = ["script", "meta", "title", "link", "button", "script", "div", "p", "span", "a", "img", "br", "hr", "table",
                "tr", "th", "td", "thead", "tbody", "tfoot", "ul", "ol", "li", "dl", "dt", "dd", "h1", "h2", "h3", "h4",
                "h5", "h6", "h7", "form", "input", "label", "option", "select", "textarea", "strong", "iframe"];

    for (var i=0; i < tags.length; i++) {
      (function() {
        var tag = tags[i];
        helpers[tag] = (function() {
          // flatten arguments
          var stack = [];
          for (var j=0; j < arguments.length; j++) stack.push(arguments[j]);
          var arguments = [];
          while (stack.length > 0) {
            var obj = stack.shift();
            if (obj) {
              if ((typeof(obj) == 'object') && obj.concat) {
                stack = obj.concat(stack);
              } else if ((typeof(obj) == 'object') && obj.callee) {
                // edge case for when you pass through in an actual "arguments" object to another function
                stack = Array.prototype.slice.call(obj).concat(stack);
              } else {
                arguments.push(obj);
              }
            }
          }

          var element = document.createElement(tag);

          var options = {};
          var start = 0;
          var end = arguments.length - 1;
          if ((typeof(arguments[end]) == 'object') && (typeof(arguments[end].nodeType) == 'undefined')) {
            options = arguments[end--];
          } else if ((typeof(arguments[start]) == 'object') && (typeof(arguments[start].nodeType) == 'undefined')) {
            options = arguments[start++];
          }

          if (options.type || (tag == 'input')) {
            element.setAttribute('type', options.type || 'text');
            // Fix bug for IE7: when create dynamically a radio button group/checkbox, we cannot set attributes: name, checked, etc.
            // This bug is fixed in IE8
            if (Hasher.ie7_browser && (options.type == 'radio' || options.type == 'checkbox')) {
              element = document.createElement("<input type='" + options.type + "' " + (options['name'] ? "name='" + options['name'] + "'" : "") + (options['checked'] != null ? "CHECKED":" ") + "/>");
            }
            if (options.type) delete options.type;
          }

          if (options['class']) {
            element.className = options['class'];
            delete options['class'];
          }

          if (options.style) {
            element.style.cssText = options.style;
            delete options.style;
          }

          for (var k in options) {
            if (k == 'events') {
              for (var ek in options[k]) {
                if (ek == 'hash_change') {
                  Hasher.Event.observe('hash_change', options[k][ek], element);
                } else if (element.addEventListener) {
                  element.addEventListener(ek, options[k][ek], false);
                } else {
                  element.attachEvent("on" + ek, options[k][ek]);
                }
              }
            } else if ((k == 'href') && (typeof(options[k]) == 'function')) {

              var real_callback = options[k];
              var callback = function(e) {
                if (e && (typeof e.cancelBubble != 'undefined')) {
                  Hasher.Event.stop(e);
                }
                real_callback.apply(element); //, e);
              }

              element.setAttribute('href', '#');

              var hook = 'click';
              if (element.addEventListener) {
                element.addEventListener(hook, callback, false);
              } else {
                element.attachEvent("on" + hook, callback);
              }
            } else if ((k == 'action') && (typeof(options[k]) == 'function')) {
              var real_callback = options[k];
              var callback = function(e) {
                Hasher.Event.stop(e);
                var serialized_form = {};
                var elems = element.getElementsByTagName('*');
                for (var i=0; i < elems.length; i++) {
                  if (elems[i].name) {
                    if (elems[i].tagName == 'SELECT') {
                      // TODO: support multiple select
                      serialized_form[elems[i].name] = elems[i].options[elems[i].selectedIndex].value;
                    } else if ((['radio', 'checkbox'].indexOf(elems[i].getAttribute('type')) == -1) || elems[i].checked) {
                      serialized_form[elems[i].name] = elems[i].value;
                    }
                  }
                }

                real_callback.call(null, serialized_form);
              }

              var hook = 'submit';
              if (element.addEventListener) {
                element.addEventListener(hook, callback, false);
              } else {
                element.attachEvent("on" + hook, callback);
              }

            } else if (k == 'only_if') {
              if (!options[k]) return null;
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
        });
      }());
    }

    return helpers;
  })()

};


window.onload = function() {
  //detect whether the browser is IE7
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && (new Number(RegExp.$1) == 7)) {
    Hasher.ie7_browser = true;
  }
  
  setInterval(Hasher.Routes.checkHash, 10);
  for (var i=0; i < Hasher.Internal.initializers.length; i++) {
    Hasher.Internal.initializers[i].call();
  }
  Hasher.Routes.checkHash();
};




