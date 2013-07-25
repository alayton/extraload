# Extraload

Extraload is an ETL (EXtract, TRAnsform, LOAD) framework for [Node.js](http://nodejs.org). In plain English, it's a tool for taking data from one or more sources, performing any needed manipulations, and storing the transformed data somewhere else.

## Common use cases

 - Importing data from XML or CSV files into a database
 - Migrating data from one database to another (for example, when switching forum software)
 - Updating Solr or Lucene indexes

## Goals

 - ETL scripts should be easily understood. By using pure JavaScript instead of an amalgamation of other languages with XML, understanding a script becomes much easier.
 - Scripts should be fast. They are.
 - Supporting different data sources and databases should be easy. Extraload drivers are usually thin wrappers around pre-existing Node.js modules, making it quick and easy to support something new.

## Installation

 - `npm install extraload`
 - Install any dependencies needed for the drivers you're using. Find these on the reference pages below.

## API Reference

 - [Writing a script](./docs/writing-a-script.md)
 - [Creating a driver](./docs/creating-a-driver.md)
 - Core module: [extraload](./docs/extraload.md)
 - Drivers:
  - CSV: [csv-stream](./docs/csv-stream.md)
  - MySQL: [mysql](./docs/mysql.md)
  - XML: [xml-stream](./docs/xml-stream.md)
  - XPath: [xpath](./docs/xpath.md)