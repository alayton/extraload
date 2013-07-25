# extraload

The extraload module is the access point for all built-in drivers. It also provides a pair of utility methods for managing the flow of execution.

## Usage

Require the module:
```javascript
var extraload = require('extraload');
```

This gives you an instance to work with. If called in multiple modules, the same instance is returned.

## Methods

### extraload.run(callback)
When called, it immediately calls the callback function. By wrapping your main processing in this function, extraload is able to identify when your synchronous processes are done. This is needed to make sure the [extraload.end](#extraloadendcallback) callback is called at the correct time.

#### Returns
Nothing

#### Example
```javascript
extraload.run(function() {
    extraload.csvStream({ file: 'data/example.csv' })
        .on('data', function(row) {
            console.log(row.id + ', ' + row.name);
        });
});
```

### extraload.end(callback)
Registers a callback to be fired when all synchronous and asynchronous processes are completed.

#### Parameters
 - `callback`: A function containing any final logic that should be called before exiting.

#### Returns
Nothing

#### Notes
 - [extraload.run](#extraloadruncallback) must be used for the `end` event to be fired.
 - If any asynchronous code is run in the callback, there's no guarantee it will finish before the script exits.
 - Shorthand for `extraload.on('end', callback);`.

#### Example
```javascript
extraload.end(function() {
    console.log('Processing completed!');
});
```

### extraload.csvStream(opts)
Creates a new [csv-stream](./csv-stream.md) instance which immediately begins reading the file. As the file is read, a `data` event will be generated for each row of data.

#### Parameters
 - `opts`: Options controlling the behavior of the CSV stream
  - `file`: **Required**. The path of the CSV file to read

#### Returns
A new [csv-stream](./csv-stream.md) instance

#### Events
 - `data`: Fired for each row of data read from the file. The callback receives an object containing the values in fields named for each column.
 - `end`: Fired when the end of the file has been reached.

#### Notes
 - The first line of the CSV file is expected to specify the column names.

#### Example
```javascript
extraload.csvStream({ file: 'data/example.csv' })
    .on('data', function(row) {
        console.log(row.id + ', ' + row.name);
    })
    .on('end', function() {
        console.log('Finished reading CSV file.');
    });
```

### extraload.mysql(opts)
Creates a new [mysql](./mysql.md) instance.

#### Parameters
 - `opts`: Connection options
  - `host`: The hostname of the MySQL server (Default: `localhost`)
  - `port`: The port number of the MySQL server (Default: `3306`)
  - `user`: The user to connect as
  - `password`: The password of the `user`
  - `database`: The default database for the connection
  - A full list of options can be found [here](https://github.com/felixge/node-mysql#connection-options)

#### Returns
A new [mysql](./mysql.md) instance

### extraload.xmlStream(opts)
Creates a new [xml-stream](./xml-stream.md) instance which immediately begins reading the file. As the file is read, a `data` event will be generated for each `target` node encountered.

#### Parameters
 - `opts`: Options controlling the behavior of the XML stream
  - `file`: **Required**. The path of the XML file to read
  - `target`: **Required**. The name of the node you want to capture from the XML stream
  - `encoding`: The encoding to use when reading the file. Default: `UTF-8`. Other valid values are `UTF-16`, `ISO-8859-1`, `US-ASCII`

#### Returns
A new [xml-stream](./xml-stream.md) instance

#### Events
 - `data`: Fired for each node matching `target` from the file. The callback receives a [XmlNode](./xml-stream.md#xmlnode) instance.
 - `end`: Fired when the end of the file has been reached.

#### Notes
 - Unlike the `file` option, omitting the `target` option won't throw an error; instead, it won't ever fire a `data` event. This might be silly.

#### Example
```javascript
extraload.xmlStream({ file: 'data/example.xml' })
    .on('data', function(node) {
        console.log(node.name + '[id=' + node.getAttribute('id') + '] contains a name node with the text "' + node.getNodeText('name') + '"');
    })
    .on('end', function() {
        console.log('Finished reading XML file.');
    });
```

### extraload.xpath(opts)
Creates a new [xpath](./xpath.md) instance and synchronously loads the given XML file.

#### Parameters
 - `opts`: Options controlling the loading of the XML file
  - `file`: **Required**. The path of the XML file to read
  - `encoding`: The encoding the use when reading the file. Default: `utf8`. Other valid values are `ascii`, `ucs2`, `utf16le`, `hex`, `binary`, `base64`, `raw`

#### Returns
A new [xpath](./xpath.md) instance

#### Notes
 - Unlike most other drivers, xpath is completely synchronous. This means when you create or query an instance, your script will block until it completes that operation.
 - The full XML file is loaded and a DOM structure created up front. That makes this driver poorly suited to working with large files, as memory usage will quickly skyrocket. Whenever possible, using [xml-stream](./xml-stream.md) for XML data is preferable.

#### Example
```javascript
var data = extraload.xpath({ file: 'data/example.xml' });
var node = data.queryOne("nodes/node[id='123']");
if (node) {
    console.log('Node 123 is named: ' + node.getNodeText('name'));
}
```