(function (r, factory) {
    var NAME = 'WorkerPromise';

    if (typeof define === 'function' && define.amd) {
        define(['q'], function (Q) {
            return (r[NAME] = factory(Q));
        });
    } else {
        r[NAME] = factory(r.Q);
    }
});