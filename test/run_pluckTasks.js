/*global describe:false, it:false */

'use strict';

var pluckTasks = require('../lib/run/pluckTasks');
var should = require('should');
require('mocha');

describe('lib/run/', function() {
	describe('pluckTasks()', function() {

		var makeArgs = function (tasks, runTaskNames) {
			return {
				orchestrator: {
					tasks: tasks // all of the registered tasks
				},
				runTaskNames: runTaskNames // the names of the tasks passed to #run()
			};
		};

		it('runs task successfully', function(done) {

			// arrange
			var args = makeArgs({}, []);

			// act
			pluckTasks(args, function (err) {

				// assert
				should.not.exist(err);

				done();
			});
		});

		it('finds two tasks', function(done) {

			// arrange
			var runTaskNames = ['task1', 'task2'];
			var tasks = {
				task1: {
					name: 'task1'
				},
				task2: {
					name: 'task2'
				}
			};
			var args = makeArgs(tasks, runTaskNames);

			// act
			pluckTasks(args, function (err) {

				// assert
				should.exist(args.runTasks);
				Object.keys(args.runTasks).length.should.equal(2);
				args.runTasks.task1.should.equal(tasks.task1);
				args.runTasks.task2.should.equal(tasks.task2);
				should.not.exist(err);

				done();
			});
		});

		it('finds no tasks', function(done) {

			// arrange
			var runTaskNames = [];
			var tasks = {};
			var args = makeArgs(tasks, runTaskNames);

			// act
			pluckTasks(args, function (err) {

				// assert
				should.exist(args.runTasks);
				Object.keys(args.runTasks).length.should.equal(0);
				should.not.exist(err);

				done();
			});
		});

		it('error on missing task', function(done) {

			// arrange
			var taskName = 'missing-task';
			var runTaskNames = [taskName];
			var tasks = {
				test: {
					name: 'test',
					dep: ['dep']
				}
			};
			var args = makeArgs(tasks, runTaskNames);

			// act
			pluckTasks(args, function (err) {

				// assert
				should.exist(err);
				should.exist(err.missingTasks);
				err.missingTasks.length.should.equal(1);
				err.missingTasks[0].should.equal(taskName);
				// IGNORE: args.runTasks

				done();
			});
		});

	});
});
