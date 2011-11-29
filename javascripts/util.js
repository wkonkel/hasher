with (Hasher()) {
  define('stop_event', function(e) {
    if (!e) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
  });
  
  define('flatten_to_array', function() {
    var stack = Array.prototype.slice.call(arguments);
    var arguments = [];
    while (stack.length > 0) {
      var obj = stack.shift();
      if (obj) {
        if ((typeof(obj) == 'object') && obj.concat) {
          // array? just concat
          stack = obj.concat(stack);
        } else if ((typeof(obj) == 'object') && obj.callee) {
          // explicitly passed arguments object? to another function
          stack = Array.prototype.slice.call(obj).concat(stack);
        } else {
          arguments.push(obj);
        }
      }
    }
    return arguments;
  });

  define('shift_options_from_args', function(args) {
    if ((typeof(args[0]) == 'object') && (typeof(args[0].nodeType) == 'undefined')) {
      return args.shift();
    } else if ((typeof(args[args.length-1]) == 'object') && (typeof(args[args.length-1].nodeType) == 'undefined')) {
      return args.pop();
    } else {
      return {};
    }
  });
  
  define('for_each', function() {
    var objs = flatten_to_array(arguments);
    var callback = objs.pop();
    for (var i=0; i < objs.length; i++) callback(objs[i]);
  });
  
  define('curry', function() {
    var real_args = Array.prototype.slice.call(arguments);
    return (function() {
      real_args.shift().apply(null, Array.prototype.concat.apply(real_args, arguments));
    });
  });
}