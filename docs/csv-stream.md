# csv-stream

The csv-stream module performs asynchronous streaming of CSV data. It's built on the [csv-stream](https://npmjs.org/package/csv-stream) NPM module.

## Requirements

 - [csv-stream](https://npmjs.org/package/csv-stream) (`npm install csv-stream`)

## Usage

Parsing begins upon creation of an instance. Events are emitted for each row, and when the end of the file is reached.

## Methods

### csvStream Constructor
Creates an instance of the streaming parser and begins processing the specified file.

#### Parameters
 - `opts`: Options controlling the behavior of the CSV stream
  - `file`: **Required**. The path of the CSV file to read

#### Returns
A new csv-stream instance

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

## Events

### data
Fired for each row of data.

#### Callback
`function(row)`

 - `row`: An object with fields for each column, named according to the first line of the file

### end
Fired when the end of the CSV stream is reached.

#### Callback
`function()`