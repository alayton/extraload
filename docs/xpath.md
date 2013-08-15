# xpath

The xpath module synchronously loads an XML file and allows querying it with XPath selectors. It's built on top of the [xpath](https://npmjs.org/package/xpath) NPM module.

## Requirements

 - [xpath](https://npmjs.org/package/xpath) (`npm install xpath`)
 - [xmldom](https://npmjs.org/package/xmldom) (`npm install xmldom`)

## Usage

When creating a new xpath instance, keep in mind that the XML file is loaded immediately. This can cause a significant pause in your script, especially with large input files.

## Methods

### xpath Constructor
Creates a new xpath instance and loads the specified file.

#### Parameters
 - `opts`: Options controlling the loading of the XML file
  - `file`: **Required**. The path of the XML file to read
  - `encoding`: The encoding the use when reading the file. Default: `utf8`. Other valid values are `ascii`, `ucs2`, `utf16le`, `hex`, `binary`, `base64`, `raw`

#### Returns
A new xpath instance

#### Notes
 - Unlike most other drivers, xpath is completely synchronous. This means when you create or query an instance, your script will block until it completes that operation.
 - The full XML file is loaded and a DOM structure created up front. That makes this driver poorly suited to working with large files, as memory usage will quickly skyrocket. Whenever possible, using [xml-stream](./xml-stream.md) for XML data is preferable.

#### Example
```javascript
var data = Extraload.xpath({ file: 'data/example.xml' });
var node = data.queryOne("nodes/node[id='123']");
if (node) {
    console.log('Node 123 is named: ' + node.getNodeText('name'));
}
```

### queryOne
Selects a single node from the document using the given XPath selector.

#### Parameters
 - `str`: The XPath selector
 - `context`: _optional_. The node to use as the root of the selector
 - `callback`: _optional_. `function(node)`. A callback to receive the result instead of returning it. If no matching nodes are found, the callback is not called.

#### Returns
If `callback` is given, nothing. Otherwise, the matching node, or null if no matches were found.

#### Notes
 - Keep in mind that providing a callback prevents the method from returning any matched nodes.
 - The returned node is a standard DOM Element object, with the `getNodeText` method from [xml-stream's XmlNode](./xml-stream.md#xmlnode) added on

#### Example
```javascript
var data = Extraload.xpath({ file: 'data/example.xml' });
var node = data.queryOne("nodes/node[id='123']");
if (node) {
    console.log('Node 123's child "name" has the text: ' + node.getNodeText('name'));
}
```

### query
Selects a list of nodes from the document using the given XPath selector.

#### Parameters
 - `str`: The XPath selector
 - `context`: _optional_. The node to use as the root of the selector
 - `callback`: _optional_. `function(nodes)`. A callback to receive the result instead of returning it. If no matching nodes are found, the callback is not called.

#### Returns
If `callback` is given, nothing. Otherwise, an array of the matching nodes, if any.

#### Notes
 - Keep in mind that providing a callback prevents the method from returning any matched nodes.
 - The returned nodes are standard DOM Element objects, with the `getNodeText` method from [xml-stream's XmlNode](./xml-stream.md#xmlnode) added on

#### Example
```javascript
var data = Extraload.xpath({ file: 'data/example.xml' });
var nodes = data.query("nodes/node");
if (nodes.length > 0) {
    console.log('The first node has a child "name" with the text: ' + nodes[0].getNodeText('name'));
} else {
    console.log('No matching nodes found!');
}
```
