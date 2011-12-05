with (Hasher()) {
  define('render', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);

    options.layout = typeof(options.layout) == 'undefined' ? (options.target ? false : this.default_layout) : options.layout;
    options.target = options.target || document.body;
    if (options.layout) {
      var layout_element = options.layout(arguments);
      if (layout_element.parentNode != options.target) {
        options.target.innerHTML = '';
        options.target.appendChild(layout_element);
      }
    } else {
      options.target.innerHTML = '';
      for (var i=0; i < arguments.length; i++) {
        options.target.appendChild(typeof(arguments[i]) == 'string' ? document.createTextNode(arguments[i]) : arguments[i]);
      }
    }
  });

  define('layout', function(name, callback) {
    define(name, function callback_wrapper(yield) {
      // NOTE: this approach might be sketchy... we're storing state in the function object itself
      if (!callback_wrapper.layout_elem) {
        var tmp_div = div();
        callback_wrapper.layout_elem = callback(tmp_div);
        callback_wrapper.yield_parent = tmp_div.parentNode;
      }
      
      // replace contents and add content
      callback_wrapper.yield_parent.innerHTML='';
      yield = flatten_to_array(yield);
      for (var i=0; i < yield.length; i++) callback_wrapper.yield_parent.appendChild((typeof(yield[i]) == 'string') ? document.createTextNode(yield[i]) : yield[i]);
      
      return callback_wrapper.layout_elem;
    });
  });

}
