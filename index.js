var console = require('console');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Extraload = function() {
    EventEmitter.call(this);

    var _tasks = {};
    var _hasRun = false;
    var _hasEnded = false;

    var hasTasks = function() {
        for (var t in _tasks) {
            if (_tasks[t] > 0)
                return true;
        }
        return false;
    };

    this.run = function(cb) {
        cb();
        _hasRun = true;
    };

    this.end = function(cb) {
        if (_hasEnded || !hasTasks()) {
            cb();
            process.exit(0);
        } else {
            this.on('end', function() {
                cb();
                process.exit();
            });
        }
    };

    this.mysql = function(opts) {
        var constructor = require('./lib/mysql.js');
        return new constructor(opts);
    };

    this.xpath = function(opts) {
        var constructor = require('./lib/xpath.js');
        return new constructor(opts);
    };

    this.xmlStream = function(opts) {
        var constructor = require('./lib/xml-stream.js');
        return new constructor(opts);
    };

    this.csvStream = function(opts) {
        var constructor = require('./lib/csv-stream.js');
        return new constructor(opts);
    };

    this._incrementTasks = function(type) {
        if (!_tasks[type]) {
            _tasks[type] = 1;
        } else {
            _tasks[type]++;
        }
    };
    this._decrementTasks = function(type) {
        if (_tasks[type] && _tasks[type] > 0) {
            _tasks[type]--;
        }

        if (hasTasks())
            return;

        if (_hasRun) {
            this.emit('end');
            _hasEnded = true;
        }
    }
};
util.inherits(Extraload, EventEmitter);

module.exports = new Extraload();
