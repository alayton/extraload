# xml-stream

The xml-stream module performs asynchronous streaming of XML data. It's built on the [node-expat](https://npmjs.org/package/node-expat) NPM module.

## Requirements

 - [node-expat](https://npmjs.org/package/node-expat) (`npm install node-expat`)

## Usage

Parsing begins upon creation of an instance. Events are emitted for any matching node, and when the end of the XML file is reached.

## Methods

### xmlStream Constructor
Creates an instance of the streaming parser and begins processing the specified file.

#### Parameters
 - `opts`: Options controlling the behavior of the XML stream
  - `file`: **Required**. The path of the XML file to read
  - `target`: **Required**. The name of the node you want to capture from the XML stream
  - `encoding`: The encoding to use when reading the file. Default: `UTF-8`. Other valid values are `UTF-16`, `ISO-8859-1`, `US-ASCII`

#### Returns
A new xml-stream instance

#### Notes
 - Unlike the `file` option, omitting the `target` option won't throw an error; instead, it won't ever fire a `data` event. This might be silly.

#### Example
```javascript
extraload.xmlStream({ file: 'data/example.xml', target: 'node' })
    .on('data', function(node) {
        console.log(node.name + '[id=' + node.getAttribute('id') + '] contains a name node with the text "' + node.getNodeText('name') + '"');
    })
    .on('end', function() {
        console.log('Finished reading XML file.');
    });
```

## Events

### data
Fired for each node with a name matching `target`.

#### Callback
`function(node)`

 - `node`: A [XmlNode](#xmlnode) instance

### end
Fired when the end of the XML stream is reached.

#### Callback
`function()`

## Structures

### XmlNode
An object representing the captured XML node.

#### Properties

 - `name`: The name of the node
 - `children`: An array of children `XmlNode` objects, if any
 - `attributes`: An associative array of attributes, with the attribute names as keys
 - `text`: Any text directly contained by the node

#### Methods

 - `getNodeText`: `function(nodeName)`. Retrieves the text of an immediate child with a name matching `nodeName`. If no matching child is found, returns `null`.
 - `getAttribute`: `function(attribute)`. Retrieves the value of the given attribute. If the attribute isn't set, returns `null`.