with (Hasher()) {
  Hasher.__initializers = [];

  define('initializer', function(callback) {
    Hasher.__initializers.push(callback);
  });
  
  // setup browser hook
  window.onload = function() {
    for (var i=0; i < Hasher.__initializers.length; i++) Hasher.__initializers[i]();
    delete Hasher.__initializers;
  }
}