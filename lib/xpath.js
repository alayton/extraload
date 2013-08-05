var Xpath = require('xpath');
var Dom = require('xmldom').DOMParser;
var fs = require('fs');
var console = require('console');

var ExtraloadXpath = function(opts) {
    if (!opts)
        opts = {};

    if (!opts.file) {
        throw new Error('No file provided to load');
    }

    var encoding = opts.encoding || 'utf8';

    var contents = fs.readFileSync(opts.file, { encoding: encoding });
    var doc = new Dom().parseFromString(contents);

    var queryText = function(str) {
        var context = this;
        var result = Xpath.select(str + '/text()', context, true);
        if (result) {
            return result.toString();
        } else {
            return null;
        }
    };

    this.queryOne = function(str, context, callback) {
        if (typeof context === 'function') {
            callback = context;
            context = doc;
        } else if (context === undefined) {
            context = doc;
        }

        var result = Xpath.select(str, context, true);
        if (result === undefined) {
            return null;
        }

        result.__proto__.getNodeText = queryText;
        if (callback) {
            callback(result);
        } else {
            return result;
        }
    };

    this.query = function(str, context, callback) {
        if (typeof context === 'function') {
            callback = context;
            context = doc;
        } else if (context === undefined) {
            context = doc;
        }

        var nodes = Xpath.select(str, context);
        if (callback) {
            var numNodes = nodes.length;
            for (var i = 0; i < numNodes; ++i) {
                nodes[i].__proto__.getNodeText = queryText;
                callback(nodes[i]);
            }
        } else {
            return nodes;
        }
    };

    this.getText = function(context, str) {
        var result = Xpath.select(str + '/text()', context, true);
        if (result) {
            return result.toString();
        } else {
            return null;
        }
    };
};

module.exports = ExtraloadXpath;