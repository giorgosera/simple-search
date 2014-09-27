var crypto = require('crypto');

function cache() {

    var linkedList = {};

    linkedList.index = {};
    linkedList.head = null;
    linkedList.tail = null;
    linkedList.maxsize = 3;
    linkedList.size = 0;

    function getHash(query) {

        var md5 = crypto.createHash('md5');
        md5.update(query);
        return md5.digest('ascii');
    }

    function newNode(hash, data) {

        var newNode = {};

        newNode.data = data;
        newNode.hash = hash;
        newNode.next = null;
        newNode.prev = null;

        return newNode;
    }

    function addToHead(list, node) {

        if (list.head === null && list.tail === null) {
            list.head = node;
            list.tail = node;
        } else {
            node.next = list.head;
            list.head.prev = node;
            list.head = node;
        }
        return list;
    }

    function removeNode(list, node) {

        var hash = node.hash;

        if (node.prev === null) {

            list.head = node.next;

            if (list.head) {
                list.head.prev = null;
            }
        } else {
            node.prev.next = node.next;
        }

        if (node.next === null) {

            list.tail = node.prev;

            if (list.tail) {
                list.tail.next = null;
            }
        } else {
            node.next.prev = node.prev;
        }

        return hash;
    }


    linkedList.get = function (query) {

        var hash = getHash(JSON.stringify(query));

        if (this.index.hasOwnProperty(hash)) {

            var node = this.index[hash];

            removeNode(this, node);
            addToHead(this, node);

            return node.data;
        } else {

            return false
        }

    };

    linkedList.set = function (query, data) {

        var hash = getHash(JSON.stringify(query));
        // create new node
        var node = newNode(hash, data);
        // add index
        this.index[hash] = node;

        addToHead(this, node);

        if (this.size == this.maxsize) {

            // remove tail
            var tailHash = removeNode(this, this.tail);
            // deleting indexed teil node
            delete this.index[tailHash];

        } else {
            // keep increasing size until you reach max
            this.size++;
        }
    };

    return linkedList;
}


module.exports = cache();