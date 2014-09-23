A simple search engine that runs on Node.JS, Express and MongoDB. It support basic document indexing and querying.

## Installation
```npm install simple-search```

## Usage

You can use the search engine either via a REST API using HTTP requests.

###RESTful API

** Indexing API**

You can index a document using the index endpoint ```/index```.

**Example**
```
$ curl -XPOST 'http://localhost:3000/index/1' 
	-H "Content-Type: application/json" 
	-d '{"_body" : "This is an example doc."}'
```

** Searching API**

You can search the index using the index endpoint ```/search```.

**Example**
```
$ curl -XGET 'http://localhost:3000/search' 
	-H "Content-Type: application/json" 
	-d '{"q" : "example document"}'
```

## Contributing

If you wish to contribute to the development of this project please fork and send your pull requests.

1. Fork the repo
2. ```npm install``` to install the dependencies
3. ```npm start``` or ```nodemon index.js``` to start the search engine server

If you want to run the tests use ```npm test```