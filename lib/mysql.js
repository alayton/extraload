var Mysql = require('mysql');
var Extraload = require('./../extraload.js');

var ExtraloadMysql = function(opts) {
    var connection = Mysql.createConnection(opts);

    this.query = function(sql, values, cb) {
        Extraload._incrementTasks('mysql');
        var query = connection.query(sql, values, cb);
        query.on('end', function() {
            Extraload._decrementTasks('mysql');
        });

        return query;
    };

    this.end = function(cb) {
        Extraload._incrementTasks('mysql');
        connection.end(function() {
            cb();
            Extraload._decrementTasks('mysql');
        })
    };

    this.pause = function() {
        connection.pause();
    };

    this.resume = function() {
        connection.resume();
    };

    this.escape = function(val, stringifyObjects, timeZone) {
        return Mysql.escape(val, stringifyObjects, timeZone || connection.config.timezone);
    };

    this.escapeId = function(val, forbidQualified) {
        return Mysql.escapeId(val, forbidQualified);
    };

    this.startTransaction = function() {
        Extraload._incrementTasks('mysql');
        this.query('START TRANSACTION');
        var self = this;
        connection.on('error', function(err) {
            self.rollback();
        });
    };

    this.commit = function() {
        this.query('COMMIT');
        Extraload._decrementTasks('mysql');
    };

    this.rollback = function() {
        this.query('ROLLBACK');
        Extraload._decrementTasks('mysql');
    };

    this.prepareTable = function(table) {
        Extraload._incrementTasks('mysql');
        var newTable = Mysql.escapeId(this.table(table));
        table = Mysql.escapeId(table);

        this.query('SET FOREIGN_KEY_CHECKS=0');
        this.query('DROP TABLE IF EXISTS ' + newTable);
        this.query('CREATE TABLE ' + newTable + ' LIKE ' + table);
        this.query('TRUNCATE TABLE ' + newTable);
    };

    this.table = function(table) {
        return '_' + table;
    };

    this.finishTable = function(table) {
        var backupTable = Mysql.escapeId('_' + table + '_backup');
        var newTable = Mysql.escapeId(this.table(table));
        table = Mysql.escapeId(table);

        this.query('SET FOREIGN_KEY_CHECKS=0');
        this.query('DROP TABLE IF EXISTS ' + backupTable);
        this.query('RENAME TABLE ' + table + ' TO ' + backupTable);
        this.query('RENAME TABLE ' + newTable + ' TO ' + table);
        Extraload._decrementTasks('mysql');
    };
};

module.exports = ExtraloadMysql;