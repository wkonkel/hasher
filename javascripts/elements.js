with (Hasher()) {
  define('element', function() {
    // first argument is element type (div, span, etc)
    var arguments = flatten_to_array(arguments);
    var tag = arguments.shift();
    var element = document.createElement(tag);
    var options = shift_options_from_args(arguments);

    // process attributes
    for (var k in options) {
      if (k.indexOf('on') == 0) {
        var tmp_callback = options[k];
        var callback = function() { tmp_callback.apply(element, Array.prototype.slice.call(arguments)); };
        if (element.addEventListener) {
          element.addEventListener(k.substring(2).toLowerCase(), callback, false);
        } else {
          element.attachEvent(k.toLowerCase(), callback);
        }
      } else if (k == 'class') {
        element.className = options['class'];
      } else if (k == 'style') {
        element.style.cssText = options.style;
      } else {
        element.setAttribute(k, options[k]);
      }
    }
    
    // append child elements
    for (var i=0; i <= arguments.length; i++) {
      if (typeof(arguments[i]) == 'object') {
        element.appendChild(arguments[i]);
      } else if (arguments[i]) {
        element.appendChild(document.createTextNode(arguments[i]));
      }
    }

    return element;
  });

  // simple elements
  for_each(
    'script', 'meta', 'title', 'link', 'script', 'iframe', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'p', 'span', 'img', 'br', 'hr', 'i', 'b', 'strong',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'select', 'option', 'textarea', 'button', 'label',
    function(tag) { 
      define(tag, function() { return element(tag, arguments) }); 
    }
  );
  
  define('a', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.href && options.href.call) {
      var real_callback = options.href;
      options.href = '';
      options.onClick = function(e) {
        stop_event(e);
        real_callback();
      }
    } else if (options.href && options.href.indexOf('#') == 0) {
      var hash = options.href;
      options.href = '';
      options.onClick = function(e) {
        stop_event(e);
        set_route(hash);
      }
    }
    
    return element('a', options, arguments);
  });
  
  define('form', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.action && options.action.call) {
      var real_callback = options.action;
      options.onSubmit = function(e) {
        stop_event(e);

        var serialized_form = {};
        var elems = this.getElementsByTagName('*');
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

        real_callback(serialized_form);
      }
      options.action = '';
    }
    
    return element('form', options, arguments);
  });

  // input types
  for_each(
    'text', 'hidden', 'password', 'checkbox', 'radio',
    function(input_type) {
      define(input_type, function() { 
        var arguments = flatten_to_array(arguments);
        var options = shift_options_from_args(arguments);
        options.type = input_type;
        return element('input', options, arguments);
      });
    }
  );

}