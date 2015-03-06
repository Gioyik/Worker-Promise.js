# Worker-Promise.js

This is an utility for defining web worker tasks inline. It uses a Promise ([powered by Q](https://github.com/kriskowal/q)).

A simple example is:

``` js
var add = SimpleWorker(function (a, b) {
  return a + b;
});

var promise = add(1, 2);

promise.then(function (result) {
  alert(result); // 3
});
```
 
SimpleWorkers embraces promises throughout. If the result within your web worker is also asynchronous, you can return a promise-like object from your worker and it will automatically post back the result to the main thread. 

``` js
var add = SimpleWorker(function (a, b) {
  var deferred = Q.defer();

  setTimeout(function () {
    deferred.resolve(a + b);
  }, 3000);

  return deferred.promise;
}, ['https://raw.github.com/kriskowal/q/master/q.js']);
```
    
This particular example loads Q.js to provide promises from within the worker. In general, you can use this to take advantage of other third party libraries that use promises. This always isn't realistic - if you need to return a result asynchronously, you can do so by calling the `post(result)` function from within your worker.