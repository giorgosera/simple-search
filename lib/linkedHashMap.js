'use strict';

function LinkedHashMap(maxLength) {     //constructor
    this.map = {};          //hashmap
    this.length = 0;        //current size
    this.head = null;
    this.tail = null;
    this.maxLength = maxLength;
}

LinkedHashMap.prototype.get = function(key){    //query terms will work as keys
    if(this.map[key]){
        var item = this.map[key];
        console.log('GET: key: ' + key + 'value: ' + map[key])
        return item;
    }
    else{
        return null;
    }
};

LinkedHashMap.prototype.addItem = function(key,value){
    if(key == null || value == null){            //checking for null values
        throw new Error('Must provide non-null values');
    }
    
    //when we insert an element, we want to remove the same entry, as to not allow duplicates,
    //and to ensure that our last search is at the head of the structure(LRU implementation)
    this.deleteByKey(key);
    
    var item = {        //to new item tha isaxthei stin arxi tou map
        key: key,       //etsi wste na diatireitai to insertion order
        value: value,
        prev: Null,
        next: this.head
    };
    
    console.log('ADD: key: ' + key + ' value: ' + value)
    
    //checking if map if full
    if(this.length == this.maxLength){
        this.remove();      //remove the tail element
    }
    
    //inserting the new item
    this.head.prev = item;
    this.head = item;
    this.map[key] = item;
    this.length++;
    
    console.log('IN MAP: ' + this.map[key].value)
    return map;
}

LinkedHashMap.prototype.deleteByKey = function(key){
    var item = this.map[key];
    this.deleteItem(item);
}


LinkedHashMap.prototype.deleteItem = function(item){ //remove an item from the linked list and update length
    if(!item)
        throw new Error('Must provide valid item for deletion');
    
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
