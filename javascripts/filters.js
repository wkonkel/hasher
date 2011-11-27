with (Hasher()) {
  define('before_filter', function(name, callback) {
    this.define(name, callback);
    Filters.add('before', callback);
  });

  define('after_filter', function(name, callback) {
    this.define(name, callback);
    Filters.add('after', callback);
  });
}

with (Hasher('Filters')) {
  define('run', function(name) {
    // console.log(this);
    // console.log('run ' + name + ' filters!')
  });
  
  define('add', function(type, callback) {
//    console.log(this);
    // console.log(arguments);
    // console.log(this);
    // if (!this.hasOwnProperty('')) {
    //   
    // }
  });
}



// define('add', function() {
//   console.log('run_before_filters');
//   console.log(arguments);
//   console.log(this);
//   console.log(this.prototype);
//   console.log(this.__proto__);
// });

//Filters.add('before', )
// if (!this.before_filters) this.before_filters = [];
// this.before_filters.push(this[name]);


// // run before filters (copied below)
// var before_filters = this.chained_before_filters();
// for (var j=0; j < before_filters; j++) {
//   before_filters[j].call();
//   //if (Hasher.Internal.performed_action) return;
// }

// // run after filters (copied form above)
// var controller_chain = Hasher.InternalHelpers.controller_parent_chain(route.namespace);
// for (var j=0; j < controller_chain.length; j++) {
//   for (var k=0; k < (controller_chain[j].after_filters || []).length; k++) {
//     controller_chain[j].after_filters[k].callback.call();
//     if (Hasher.Internal.performed_action) return;
//   }
// }


// define('before_filter', function(name, callback) {
//   define(name, callback, this);
//   if (!this.hasOwnProperty('before_filters')) this.before_filters = [];
//   this.before_filters.push(this[name]);
// });
// 
// define('chained_before_filters', function() {
//   var chain = [];
//   console.log(this);
//   console.log(this.prototype);
//   if (this.prototype.chained_before_filters) chain.concat(this.prototype.chained_before_filters());
//   chain.concat(this.before_filters || []);
//   return chain;
// });


// define(name, callback, this);
// if (!this.after_filters) this.after_filters = [];
// this.after_filters.push(this[name]);


// define('inheritable_array', function() {
//   
// });
