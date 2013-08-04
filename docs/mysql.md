# mysql

The mysql module provides access to MySQL databases. It's built on top of the [mysql](https://npmjs.org/package/mysql) NPM module.

For more complete documentation of wrapper methods, see [mysql on GitHub](https://github.com/felixge/node-mysql).

## Requirements

The [mysql](https://npmjs.org/package/mysql) NPM module must be installed.
`npm install mysql`

## Usage

Retrieve an instance:
```javascript
var Extraload = require('extraload');
var options = require('./options.json');
var mysql = Extraload.mysql(options.mysql);
```

options.json:
```javascript
{
    "mysql": {
        "user": "etl_user",
        "password": "foobar",
        "database": "foo"
    }
}
```

This is one method for providing connection options. It can also be given inline:
```javascript
var mysql = Extraload.mysql({
    user: 'etl_user',
    password: 'foobar',
    database: 'foo'
});
```

Each call to [Extraload.mysql](./../extraload.md#extraloadmysql) returns a new instance. To connect to multiple different databases, simply call it once for each set of connection options.

A complete list of connection options can be found [here](https://github.com/felixge/node-mysql#connection-options).

## Methods

### mysql.query
Executes a query on the instance's MySQL connection. Wrapper around [mysql.Connection.query](https://github.com/felixge/node-mysql#escaping-query-values).

#### Parameters
 - `sql`: The SQL query string.
 - `values`: _optional_. An array or object containing values to populate placeholders or key/value pairs to be inserted.
 - `callback`: _optional_. `function(err, result)`. A function to be called when the query completes. If a query fails, `err` is an object containing details. When issuing a SELECT query, `results` contains the returned rows. When INSERTing, `results.insertId` will contain the auto-increment ID value of the row, if any.

#### Returns
A [query](https://github.com/felixge/node-mysql#streaming-query-rows) object, primarily useful for attaching events to for asynchronous processing of results.

#### Notes
 - If omitting the `values` parameters, the `callback` parameter can go in its place; there's no need to provide a null value to fill that parameter position.
 - If you don't listen for an `error` event, the script will halt and dump debug info if one occurs.
 - If you include the `callback` parameter, don't use the events for streaming rows.
 - When using the streaming events, the `result` event will fire for successful INSERT and UPDATE queries.

#### Examples
Inserting data:
```javascript
var data = {
    id: 42,
    name: 'example',
    foo: 'bar'
};
mysql.query('INSERT INTO ?? SET ?', ['example_table', data]);
```

Selecting data:
```javascript
// To wait to process until all rows are returned:
mysql.query('SELECT * FROM example_table WHERE id < ?', [42], function(err, results) {
    for (var i in results) {
        console.log(results[i]);
    }
});

// To process rows as they're returned:
var query = mysql.query('SELECT * from example_table');
query
    .on('result', function(row) {
        console.log(row);
    })
    .on('error', function(err) {
        console.log(err);
    })
    .on('end', function(err) {
        console.log('Last row received');
    });
```

----------

### mysql.end
Finishes any remaining queries and terminates the MySQL connection. Wrapper around [mysql.Connection.end](https://github.com/felixge/node-mysql#terminating-connections).

#### Parameters
 - `callback`: `function(err)`. A function to be called when the connection is closed. If an error occurred, `err` will contain information about it.

#### Returns
Nothing

----------

### mysql.pause
Pauses the MySQL connection and prevents any further results from being returned until [mysql.resume](#mysqlresume) is called. Wrapper around [mysql.Connection.pause](https://github.com/felixge/node-mysql#streaming-query-rows).

#### Returns
Nothing

----------

### mysql.resume
Resumes the MySQL connection after [pausing](#mysqlpause) it. Wrapper around [mysql.Connection.resume](https://github.com/felixge/node-mysql#streaming-query-rows).

#### Returns
Nothing

----------

### mysql.escape
Escapes values for safe use in SQL queries. Wrapper around [mysql.Connection.escape](https://github.com/felixge/node-mysql#escaping-query-values).

#### Parameters
 - `val`: The value to be escaped.
 - `stringifyObjects`: _optional_. A boolean specifying whether to convert objects to strings instead of `"key1" = "value", "key2" = "value"` key/value pairs.
 - `timeZone`: _optional_. `local`, `Z` (UTC time), or a form of [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Times) time: PST would be represented as -0800 or -08:00.

#### Returns
A string containing the escaped value

#### Notes
 - It's usually easier to use placeholders, which automatically escape values.

#### Example
```javascript
mysql.query('UPDATE example_table SET name = ' + mysql.escape('new example name') + ' WHERE id = 42);
// vs
mysql.query('UPDATE example_table SET name = ? WHERE id = 42, ['new example name']);
```

----------

### mysql.escapeId
Escapes identifiers to be used in SQL queries, such as table or column names. Wrapper around [mysql.Connection.escapeId](https://github.com/felixge/node-mysql#escaping-query-values).

#### Parameters
 - `val`: The value to be escaped.
 - `forbidQualified`: _optional_. A boolean specifying whether to allow identifiers such as `example_table.name` that qualify column names with a table name.

#### Returns
A string containing the escaped identifier

#### Notes
 - It's usually easier to use placeholders, which automatically escape identifiers.

#### Example
```javascript
mysql.query('UPDATE ' + mysql.escapeId('example_table') + ' SET ' + mysql.escapeId('name') + ' = ' + mysql.escape('new example name') + ' WHERE id = 42');
// vs
mysql.query('UPDATE ?? SET ?? = ? WHERE id = 42', ['example_table', 'name', 'new example name']);
```

----------

### mysql.startTransaction
Begins a transaction that will be automatically rolled back if the connection throws an error.

#### Returns
Nothing

#### Example
```javascript
mysql.startTransaction();
var data = {
    id: 42,
    name: 'example',
    foo: 'bar'
};
mysql.query('INSERT INTO example_table SET ?', data);
mysql.commit();
```

----------

### mysql.commit
Commits the current transaction, persisting its contents to the database.

#### Returns
Nothing

#### Example
```javascript
mysql.startTransaction();
var data = {
    id: 42,
    name: 'example',
    foo: 'bar'
};
mysql.query('INSERT INTO example_table SET ?', data);
mysql.commit();
```

----------

### mysql.rollback
Reverts the current transaction, preventing any of it from being written to the database.

#### Returns
Nothing

----------

### mysql.prepareTable
Prepares a table to be recreated without destroying existing data until the new data is ready.

#### Parameters
 - `table`: The name of the table that will be recreated.

#### Returns
Nothing

#### Notes
 - This method disables foreign key constraints, and creates a temporary table identical to `table` that data will be inserted into.
 - When inserting data, use [mysql.table](#mysqltable) to get the name of the table that data should be inserted into.
 - When finished inserting data, use [mysql.finishTable](#mysqlfinishtable) to create a backup of the original table and replace it with the new table.

### Example
```javascript
mysql.prepareTable('example_table');
var table = mysql.table('example_table');
mysql.query('INSERT INTO ?? SET ? [table, { id: 42, name: 'example', foo: 'bar' }]);
mysql.query('INSERT INTO ?? SET ? [table, { id: 43, name: 'example2', foo: 'foobar' }]);
mysql.finishTable('example_table');
```

----------

### mysql.finishTable
Finishes the non-destructive table replacement process.

#### Parameters
 - `table`: The name of the table being replaced.

#### Returns
Nothing

#### Notes
 - This method removes any previous backup version of the table, creates a new backup, and replaces the original table with the new table.

### Example
```javascript
mysql.prepareTable('example_table');
var table = mysql.table('example_table');
mysql.query('INSERT INTO ?? SET ? [table, { id: 42, name: 'example', foo: 'bar' }]);
mysql.query('INSERT INTO ?? SET ? [table, { id: 43, name: 'example2', foo: 'foobar' }]);
mysql.finishTable('example_table');
```

----------

### mysql.table
Gets the name of the temporary table being used to insert fresh data.

#### Parameters
 - `table`: The name of the table being replaced.

#### Returns
Nothing

### Example
```javascript
mysql.prepareTable('example_table');
var table = mysql.table('example_table');
mysql.query('INSERT INTO ?? SET ? [table, { id: 42, name: 'example', foo: 'bar' }]);
mysql.query('INSERT INTO ?? SET ? [table, { id: 43, name: 'example2', foo: 'foobar' }]);
mysql.finishTable('example_table');
```