(function (r, f) {
    var NAME = 'WorkerPromise';

    if (typeof define === 'function' && define.amd) {
        define(['q'], function (Q) {
            return (r[NAME] = f(Q));
        });
    } else {
        r[NAME] = f(r.Q);
    }
}(this, function (Q) {
    var source = (function __workerEnv() {
            var RegExp = /^function\s*([a-zA-Z0-9_$]*)\s*\(([a-zA-Z0-9_$,\s]*)\)\s*[^{]*{\s*([\d\D]*)\s*}[^}]*$/gim;

            function deserialize(functionText) {
                var functionParts = RegExp.exec(functionText),
                    functionArgs = functionParts[2].split(/\s*,\s*/),
                    functionBody = functionParts[3];

                return Function.apply(null, functionArgs.concat(functionBody));
            }

            function post (result) {
                self.postMessage(result);
                self.close();
            }

            self.onmessage = function (evt) {
                var commandObject = evt.data,
                    invokeFn,
                    invokeArguments,
                    invokeResult;
                
                switch (commandObject.command.toLowerCase()) {
                    case "import":
                        importScripts.apply(null, commandObject.arguments);
                    break;
                    case "invoke":
                        invokeFn = deserialize(commandObject.arguments[0]);
                        invokeArguments = commandObject.arguments.slice(1);

                        invokeResult = invokeFn.apply(this, invokeArguments);

                        if (invokeResult != null && typeof invokeResult.then == 'function') {
                            invokeResult.then (post)
                        }
                        else {
                            post(invokeResult)
                        }
                    break;
                }
            };
        }).toString().replace(/^[^{]*{\s*([\d\D]*)\s*}[^}]*$/,'$1'),
        wBlob = new Blob([Source]),
        wUrl = window.URL.createObjectURL(wBlob);

    function getUrl(scriptPath) {
        if (scriptPath.toLowerCase().indexOf("http") == 0) {
            return scriptPath;
        }

        return location.protocol + "//" + location.hostname + 
            (location.port && ":" + location.port) + "/" + scriptPath;
    }

    return function (workerFunction, imports) {
        var importUrls = (imports || []).map(getUrl);

        return function () {
            var worker = new Worker(wUrl),
                deferred = Q.defer();

            worker.addEventListener('message', function (evt) {
                deferred.resolve(evt.data);
            }, false);

            worker.addEventListener('error', function (errorEvent) {
                deferred.reject(errorEvent);
            }, false);

            worker.postMessage({
                command: "import",
                arguments: importUrls
            });

            worker.postMessage({
                command: "invoke",
                arguments: [workerFunction.toString()]
                    .concat([].slice.call(arguments))
            });

            return deferred.promise;
        };
    };
}));