with (Hasher()) {
  define('render', function() {
    document.body.innerHTML='';
    var arguments = flatten_to_array(arguments);
    for (var i=0; i < arguments.length; i++) {
      document.body.appendChild(arguments[i]);
    }
  });
  
  // TODO: view, layout
}
