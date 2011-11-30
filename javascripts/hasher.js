/**********************************************************************************
 *                                                                                *
 *  Hasher.js - 0.1.0 - A client-side view-controller framework for JavaScript.   *
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

// "There is nothing you can do with a with statement that you can't do as well without one." 
//   --Douglas Crockford  http://www.youtube.com/watch?v=taaEzHI9xyY

var Hasher = function(namespace, base) {
  var create_context = function(proto) {
    function Context() {};
    Context.prototype = proto;
    Context.prototype
    var obj = new Context();
    if (!obj.__proto__) obj.__proto__ = proto;
    return obj;
  }

  if (!Hasher.contexts) Hasher.contexts = {
    Base: create_context({ 
      define: function(key, value) { 
        this[key] = value;
      }
    })
  };

  if (namespace) {
    if (base && !Hasher.contexts[base]) {
      alert('Invalid Hasher parent: ' + base);
    } else {
      if (!Hasher.contexts[namespace]) Hasher.contexts[namespace] = create_context(base ? Hasher.contexts[base] : Hasher.contexts.Base);
      return Hasher.contexts[namespace];
    }
  } else {
    return Hasher.contexts.Base;
  }
};