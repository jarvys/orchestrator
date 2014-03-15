/*global describe:false, it:false */

'use strict';

var Orchestrator = require('../');
var should = require('should');
require('mocha');

describe('lib/builder/', function() {

	var makeOrchestrator = function (run) {
		var orchestrator = new Orchestrator();
		// monkey-patch run
		orchestrator.run = run;
		return orchestrator;
	};

	describe('runParallel()', function() {

		it('runs zero tasks with no callback successfully', function(done) {

			// arrange
			var orchestrator = makeOrchestrator(function (builder, cb) {

				// assert
				builder.isBuilder.should.equal(true);
				builder.parallel.length.should.equal(0);
				should.not.exist(cb);

				done();
			});

			// act
			orchestrator.runParallel();
		});

		it('runs two tasks with no callback successfully', function(done) {

			// arrange
			var orchestrator = makeOrchestrator(function (builder, cb) {

				// assert
				builder.isBuilder.should.equal(true);
				builder.parallel.length.should.equal(2);
				builder.parallel[0].should.equal('one');
				builder.parallel[1].should.equal('two');
				should.not.exist(cb);

				done();
			});

			// act
			orchestrator.runParallel('one', 'two');
		});

		it('runs one task with a callback successfully', function(done) {

			// arrange
			var arg = 'one';
			var actualCb = function () {};
			var orchestrator = makeOrchestrator(function (builder, cb) {

				// assert
				builder.isBuilder.should.equal(true);
				builder.parallel.length.should.equal(1);
				builder.parallel[0].should.equal(arg);
				cb.should.equal(actualCb);

				done();
			});

			// act
			orchestrator.runParallel(arg, actualCb);
		});

	});
});
