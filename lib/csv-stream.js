var Csv = require('csv-stream');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var Extraload = require('./../index.js');

var ExtraloadCsvStream = function(opts) {
    EventEmitter.call(this);

    var self = this;

    var csvStream = Csv.createStream(opts);
    csvStream.on('data', function(data) {
        self.emit('data', data);
    });
    csvStream.on('end', function() {
        self.emit('end');
        Extraload._decrementTasks('csv-stream');
    });

    if (!opts)
        opts = {};

    if (!opts.file) {
        throw new Error('No file provided to parse');
    }

    Extraload._incrementTasks('csv-stream');
    var stream = fs.createReadStream(opts.file);
    stream.pipe(csvStream);
};
util.inherits(ExtraloadCsvStream, EventEmitter);

module.exports = ExtraloadCsvStream;