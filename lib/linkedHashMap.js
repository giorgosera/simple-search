'use strict';

function LinkedHashMap(maxLength) {     //constructor
    this.map = {};        //hashmap
    this.length = 0;        //current size
    
    this.head = null;
    this.tail = null;
    this.maxLength = maxLength;
}

LinkedHashMap.prototype.get = function(key){    //query terms work as keys
    var item = this.map[key] || {};             //returning item at key position of the map, or the first true value from left to right
    return item.value;
};


// LinkedHashMap.prototype.add = function(key, value){
//     var retValue = null;
//     
//     if(value == null){
//         console.log('Error value');
//         throw new Error("Null value is not permitted!");
//     }
//     
//     var node = this.nodes[key]
//     if(!node){      
//         node = new Array();
//         this.nodes[key] = node;
//     }
//     
//     for (var i = 0; i < node.length; i++) {
//         if (node[i].key.equals(key)) {
//             retValue = node[i].value;
//             node[i].value = value;
//             return retValue;
//         }
//     }
//     
//     this.length++;
// };

module.exports = LinkedHashMap;
