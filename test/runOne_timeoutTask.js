/*global describe:false, it:false */

'use strict';

var timeoutTask = require('../lib/runOne/timeoutTask');
var makeArgs = require('../lib/runOne/args');
var should = require('should');
require('mocha');

describe('lib/runOne/', function() {
	describe('timeoutTask()', function() {
		var defaultTaskTimeout = 10;
		var fakeOrchestrator = {
			taskTimeout: defaultTaskTimeout
		};

		it('runs task successfully', function(done) {

			// arrange
			var task = {
				fn: function (cb) {
					cb();
				}
			};
			var runOptions = {};
			var args = makeArgs(task, runOptions, fakeOrchestrator);

			// act
			timeoutTask.run(task.fn, args, function (err) {

				// assert
				should.not.exist(err);

				done();
			});
		});

		it('aborts task on timeout', function(done) {

			// arrange
			var taskTimeout = 4;
			var taskName = 'timeout-task';
			var a = 0;
			var task = {
				name: taskName,
				fn: function(cb) {
					a++;
					setTimeout(function () {
						task.isDone = true;
						cb();
					}, taskTimeout*1.5);
				}
			};

			var runOptions = {};
			var orchestrator = {
				taskTimeout: taskTimeout
			};
			var args = makeArgs(task, runOptions, orchestrator);

			// act
			timeoutTask.run(task.fn, args, function (/*err*/) {
				a++;
			});

			setTimeout(function () {

				// assert
				should.exist(task.err);
				task.err.message.indexOf('timed out').should.be.above(-1);
				should.exist(task.runMethod);
				task.runMethod.should.equal('timeout');
				a.should.equal(2); // task, run callback

				done();
			}, taskTimeout*2);
		});

		it('passes error on timeout then fail', function(done) {

			// arrange
			var taskTimeout = 4;
			var taskName = 'timeout-task';
			var expectedErr = new Error('expected');
			var expectedRunMethod = 'the_runMethod';
			var a = 0;
			var task = {
				name: taskName,
				err: expectedErr,
				runMethod: expectedRunMethod,
				fn: function (cb) {
					a++;
					setTimeout(function () {
						task.isDone = true;
						cb();
					}, taskTimeout*1.5);
				}
			};

			var runOptions = {};
			var orchestrator = {
				taskTimeout: taskTimeout
			};
			var args = makeArgs(task, runOptions, orchestrator);

			// act
			timeoutTask.run(task.fn, args, function (/*err*/) {
				a++;
			});

			setTimeout(function () {

				// assert
				should.exist(task.err);
				task.err.should.equal(expectedErr);
				should.exist(task.runMethod);
				task.runMethod.should.equal(expectedRunMethod);

				a.should.equal(2); // task, run callback

				done();
			}, taskTimeout*2);
		});

		it('done successfully stops timeout timer', function(done) {
			// e.g. the timeout timer doesn't call done again

			// arrange
			var taskTimeout = 4;
			var a = 0;
			var task = {
				fn: function(cb) {
					a++;
					cb();
				}
			};

			var runOptions = {};
			var orchestrator = {
				taskTimeout: taskTimeout
			};
			var args = makeArgs(task, runOptions, orchestrator);

			// act
			timeoutTask.run(task.fn, args, function (/*err*/) {
				a++;
			});

			setTimeout(function () {

				// assert
				a.should.equal(2);

				done();
			}, taskTimeout*2);
		});

	});
});
