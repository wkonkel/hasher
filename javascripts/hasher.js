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
 

// TODO:
//   - figure out better way of communicating errors other than alert()
//   - browser quirks (tbody for table(), colSpan/cellSpacing/frameBorder case sensitivity, etc)
//   - replace controller_parent_chain (i.e. get_recursive_property('before_filters', ['default']), auto merge hashes/arrays, etc)
//   - arguments to_array'ing is gheto (search: _arguments) -- replace with: var args = Array.prototype.slice.call(arguments, 0);
//   - figure out a nice way of passing event object into action() for mouse/keyboard/etc events
//   - allow no layout
//   - skip_before_filters
//   - new variable scope can pollute window[] (see spinner_row() in webforward and menu/item in application)
//   - eliminate need for "return" in create_view (first dom element creation call automatically sets itself to the return value for create_view)

var Hasher = {
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
              arguments = arguments.slice(1);
              e.cancelBubble = true;
              e.returnValue = false;
            }
            callback.apply(null, arguments);
          };
        },
        
        action: function(action_name) {
          var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;
          var args = arguments.slice(1);
          return function(e) {
            if (e && (typeof e.cancelBubble != 'undefined')) {
              e.cancelBubble = true;
              e.returnValue = false;
            }
            Hasher.Internal.controllers[namespace].actions[action_name].apply(null,args); 
          };
        },
        
        call_action: function(action_name) {
          var _arguments = []; for (var i=1; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;
          return Hasher.Internal.controllers[namespace].actions[action_name].apply(_arguments);
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
      
      action: function(name) {
        var _arguments = []; for (var i=0; i < arguments.length; i++) _arguments.push(arguments[i]); arguments = _arguments;
        var args = arguments.slice(1);
        return function(e) {
          if (e && (typeof e.cancelBubble != 'undefined')) {
            e.cancelBubble = true;
            e.returnValue = false;
          }
          var inner_args = []; for (var i=0; i < arguments.length; i++) inner_args.push(arguments[i]);
          Hasher.Internal.controllers[namespace].actions[name].apply(null,args.concat(inner_args)); 
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
                  e.cancelBubble = true;
                  e.returnValue = false;
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
                if (e && (typeof e.cancelBubble != 'undefined')) {
                  e.cancelBubble = true;
                  e.returnValue = false;
                }
                
                var serialized_form = {};
                var elems = element.getElementsByTagName('*');
                for (var i=0; i < elems.length; i++) {
                  if (elems[i].name) serialized_form[elems[i].name] = elems[i].value;
                  // TODO: support textarea, select, multiple select, checkbox/radios, etc
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
        });
      }());
    }
    
    return helpers;
  })()

};


window.onload = function() { 
  setInterval(Hasher.Routes.checkHash, 10);
  for (var i=0; i < Hasher.Internal.initializers.length; i++) {
    Hasher.Internal.initializers[i].call();
  }
  Hasher.Routes.checkHash();
};




