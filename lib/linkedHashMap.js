'use strict';

//TODO use object.defineProperty to implement length as a property

function LinkedHashMap(maxLength) {     //constructor
    this.map = {};          //hashmap
    this.length = 0;        //current size
    this.head = null;
    this.tail = null;
    this.maxLength = maxLength;
}

LinkedHashMap.prototype.get = function(key){    //query terms will work as keys
    
    var item = this.map[key] || {};             //returning item at key position of the map, 
    return item.value;                          //or the first true value from left to right
};

LinkedHashMap.prototype.addItem = function(key,value){
    if(key == null || value == null){            //checking for null values
        console.log('Undefined insertion values');
    }
    
    var item = {        //to new item tha isaxthei stin arxi tou map
        key: key,       //etsi wste na diatireitai to insertion order
        value: value,
        next: this.head,
        prev: null
    };
    
    //checking if map if full
    if(this.length == maxLength){
        this.remove();      //remove the tail element
    }
    
    //inserting the new item
    this.head.prev = item;
    this.head = item;
    this.map[key] = item;
    this.length++;
    return map;
}

LinkedHashMap.prototype.deleteItem = function(item){ //remove an item from the linked list and update length
    if(!item)
        console.log('Empty item to delete');
    
    if(this.head === item )
        this.head = item.next;
    if (this.tail === item) {
      this.tail = item.prev;
    }
    if (item.prev) {
      item.prev.next = item.next;
    }
    if (item.next) {
      item.next.prev = item.prev;
    }
    delete this.map[item.key];
    this.length--;
}

LinkedHashMap.prototype.remove = function(){
    if(this.tail)                   //if there is an element in our tail, 
        this.deleteItem(tail);      //which is the least requested item at any time, we remove it
}

module.exports = LinkedHashMap;
