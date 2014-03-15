'use strict';

var async = require('async');

var timeRun = require('./timeRun');
var validateArgs = require('./validateArgs');
var discoverDependencies = require('./discoverDependencies');
var pluckTasks = require('./pluckTasks');
var validateTasks = require('./validateTasks');
var cloneTasks = require('./cloneTasks');
var normalizeDependencies = require('./normalizeDependencies');
var resolveBuilderDependencies = require('./resolveBuilderDependencies');
var sequenceTasks = require('./sequenceTasks');
var doneArgs = require('./doneArgs');
var makeRunOneFn = require('./makeRunOneFn');
var shimToAuto = require('./shimToAuto');
var runQueue = require('./runQueue');

var runOne = require('../runOne');

// Orchestrator#run() -- run the builder's tasks, their dependencies, and call the callback when done
function run (builder, options, cb) {
	// builder is required
	// options is optional
	// cb is optional
	if (!cb && options && typeof options === 'function') {
		cb = options;
		options = {};
	}

	/*jshint validthis:true */
	var args = {
		builder: builder,
		runOptions: options,
		doneCallback: cb,
		runOneFn: runOne,
		orchestrator: this
	};
	/*jshint validthis:false */

	return async.series([
		// setup and run
		timeRun.start,
		validateArgs,
		discoverDependencies,
		pluckTasks,
		validateTasks,
		cloneTasks,
		normalizeDependencies,
		resolveBuilderDependencies,
		sequenceTasks,
		makeRunOneFn,
		shimToAuto,
		runQueue
	].map(function (fn) {
		// stick args on the front of everything
		return fn.bind(this, args);
	}), function (err1/*, results*/) {

		async.series([
			// cleanup from run and report
			timeRun.end,
			doneArgs.bind(null, err1)
		].map(function (fn) {
			// stick args on the front of everything
			return fn.bind(this, args);
		}), function (err2/*, results*/) {

			// tell the user what happened
			var cb = args.doneCallback;
			var err = err1 || err2;
			if (cb) {
				return cb(err, args.doneArgs);
			} else if (err) {
				throw err;
			//} else {
				// done successfully and you didn't want to know
			}
		});
	});

}

module.exports = run;
