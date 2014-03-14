var Expat = require('node-expat');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('util');
var Extraload = require('./../index.js');

var XmlNode = function(name, attrs) {
    this.name = name;
    this.children = [];
    this.attributes = attrs;
    this.text = '';

    this.getNodeText = function(node) {
        var numChildren = this.children.length;
        for (var i = 0; i < numChildren; ++i) {
            if (this.children[i].name == node)
                return this.children[i].text;
        }
        return null;
    };

    this.getAttribute = function(attr) {
        if (this.attributes[attr]) {
            return this.attributes[attr];
        } else {
            return null;
        }
    };
};

var ExtraloadXmlStream = function(opts) {
    EventEmitter.call(this);
    if (!opts)
        opts = {};

    var encoding = opts.encoding || 'UTF-8'; // others are UTF-16, ISO-8859-1, US-ASCII

    var targetNode = false;
    var nodeStack = false;
    var self = this;

    var parser = new Expat.Parser(encoding);
    parser.on('startElement', function(name, attrs) {
        name = name.toLowerCase();
        if (!nodeStack && name != targetNode)
            return;

        var node = new XmlNode(name, attrs);

        if (nodeStack) {
            nodeStack.push(node);
        } else {
            nodeStack = [node];
        }
    });
    parser.on('endElement', function(name) {
        if (nodeStack) {
            name = name.toLowerCase();
            var node = nodeStack.pop();
            if (nodeStack.length > 0) {
                nodeStack[nodeStack.length - 1].children.push(node);
            } else if (name == targetNode) {
                self.emit('data', node);
                nodeStack = false;
            } else {
                console.error('Malformed XML? Closing tag did not match expected tag name.');
            }
        }
    });
    parser.on('text', function(text) {
        if (nodeStack) {
            nodeStack[nodeStack.length-1].text += text;
        }
    });
    parser.on('end', function() {
        self.emit('end');
        Extraload._decrementTasks('xml-stream');
    });

    if (!opts.file) {
        throw new Error('No file provided to parse');
    }
    if (opts.target) {
        targetNode = opts.target.toLowerCase();
    }

    Extraload._incrementTasks('xml-stream');
    var stream = fs.createReadStream(opts.file);
    stream.pipe(parser);
};
util.inherits(ExtraloadXmlStream, EventEmitter);

module.exports = ExtraloadXmlStream;