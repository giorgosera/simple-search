A simple search engine that runs on Node.JS, Express and MongoDB. It support basic document indexing and querying.

## Features
- Multi-index search
- RESTful API for indexing and searching
- [Replacable backend storage](#custom-backend) for indices (uses MongoDB out of the box)

## Installation
```npm install simple-search```

## Usage

You can use the search engine via a REST API using HTTP requests. 

**Indexing API**

You can index a document using the index endpoint ```/index/<indexName>```.

**Example**
```
$ curl -XPOST 'http://localhost:3000/index/myIndex/1' 
	-H "Content-Type: application/json" 
	-d '{"_body" : "This is an example doc."}'
```

**Searching API**

You can search the index using the index endpoint ```/search/<indexName>```.

**Example**
```

$ curl -XGET 'http://localhost:3000/search/myIndex/?q=example%20document'
```

## Custom Backend

The project works out of the box with MongoDB for inverted index creation. If you wish to use a different backend storage then you can do so by defining a custom index. All you need to do is create a new object that implements the following API:

```add(indexName, docId, body, terms)``` - This function takes as arguments the index name, a document id, body and an array of terms which you can use to store this document in your custom index. It should return a Promise. 
```retrieve(indexName, terms)``` - This function takes as arguments the index name and an array of query terms. You should retrieve and rank your docs using these terms. It should return a promise. 

Finally, in the [index.js](https://github.com/giorgosera/simple-search/blob/master/index.js#L2) you should replace the MongoIndex with your own. That's it.

## Contributing

If you wish to contribute to the development of this project please fork and send your pull requests.

1. Fork the repo
* ```npm install``` to install the dependencies
* [Install MongoDB](http://docs.mongodb.org/manual/administration/install-on-linux/) (or your chosen backend system)
* ```npm start``` or ```nodemon index.js``` to start the search engine server

If you want to run the tests use ```npm test```
