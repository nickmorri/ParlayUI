(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.utility.workerpool", module_dependencies)
        .factory("ParlayWorkerPool", ParlayWorkerPoolFactory);

   ParlayWorkerPoolFactory.$inject = [];
    function ParlayWorkerPoolFactory () {

        // constructs new onmessage and onerror functions that close workers when they are done
        function receiveAndClose(worker, onMorE, isCompleted) {
            return function(e){
                //call the old onmessage or onerror
                onMorE.bind(worker)(e);
                if (isCompleted(e)) {
                    //end the worker
                    worker.terminate();
                }
            };
        }

        // constructs new onmessage and onerror functions that free workers when they are done
        function receiveAndFree(worker, onMorE, isCompleted) {
            return function(e){
                //are we free?
                if (isCompleted.bind(worker)(e)) worker.isBusy = false;
                //call the old onmessage or onerror
                onMorE.bind(worker)(e);
            };
        }

        function ParlayWorkerPool() {
            // worker properties
            var workerScript;
            var onmessage = function(e){};
            var onerror = function(e){};
            // by default, close workers
            var isCompleted = function(e) { return true;};

            //worker pool
            var pool = [];

            /**
             * Initializes the pool to hold a particular kind of worker.
             * Can be called multiple times. Each call marks al old workers for termination.
             * @member module:ParlayWidget.ParlayWorkerPool#initialize
             * @public
             * @param {URL} ws - URL for the script that workers in this pool run
             * @param {Function} om - If provided, is used to receive messages from the workers.
             * @param {Function} oe - If provided, handles errors received from the workers.
             * @param {Function} isComp - If provided, determines whether a worker has signaled completion.
             *
             */
            this.initialize = function(ws, om, oe, isComp) {
                // the script URL must be defined to run workers
                if (!ws){
                    throw new Error("Script URL not defined."); //TODO: right error type?
                } else {
                    workerScript = ws;
                }

                // clear the pool of old workers and set them to terminate when finished
                if (pool.length > 0) {
                    var worker;
                    for (worker in pool) {
                        //use the old isCompleted since it was provided for the old workers
                        worker.onmessage = receiveAndClose(worker, worker.onmessage, isCompleted);
                        worker.onerror = receiveAndClose(worker, worker.onerror, isCompleted);
                    }
                    pool = [];
                }

                // if no onmessage function is provided, ignore messages
                if (typeof om == "function") {
                    onmessage = om;
                } else {
                    onmessage = function(e){};
                }
                // if no onerror function is provided, ignore errors
                if (typeof oe == "function") {
                    onerror = oe;
                } else {
                    onerror = function(e){};
                }
                if (typeof isComp == "function") {
                    isCompleted = isComp;
                } else {
                    isCompleted = function(e) { return true;};
                }
            };

            /**
             * Returns a worker in the pool, creating a new one if necessary.
             * @member module:ParlayWidget.ParlayWorkerPool#getWorker
             * @public
             * @returns {Worker} - A Worker from this WorkerPool
             *
             */
            this.getWorker = function() {
                // find the next available worker
                var nextAvailable = 0;
                while (nextAvailable < pool.length && pool[nextAvailable].isBusy) {
                    nextAvailable++;
                }
                // If we have a free worker, we use it.
                // Otherwise, we make a new one.
                if (nextAvailable < pool.length) {
                    // mark this worker as in use and return it
                    pool[nextAvailable].isBusy = true;
                    return pool[nextAvailable];
                } else {
                    // create and initialize a new worker
                    var worker = new Worker(workerScript);
                    worker.onmessage = receiveAndFree(worker, onmessage, isCompleted);
                    worker.onerror = receiveAndFree(worker, onerror, isCompleted);
                    // mark the worker as in use
                    worker.isBusy = true;
                    // add the worker to the pool
                    pool.push(worker);
                    return worker;
                }
            };

            /**
             * Closes all free workers.
             * @member module:ParlayWidget.ParlayWorkerPool#getWorker
             * @public
             *
             */
            this.collect = function() {
                var next = 0;
                // traverse the workers in pool
                while (next < pool.length) {
                    // skip busy workers
                    if (pool[next].isBusy) {
                        next++;
                    // remove idle workers
                    } else {
                        pool[next].terminate();
                        pool.splice(next, 1);
                    }
                }
            };

        }

        return ParlayWorkerPool;
    }

}());