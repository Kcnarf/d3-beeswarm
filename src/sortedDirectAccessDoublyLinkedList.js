///////////////////////
//////// Data /////////
////// Strucutre //////
///////////////////////

// each data MUST have a 'value' property (for sorting)
// each data MUST have a 'id' property (for direct-access)

// data in SortedDirectAccessDoublyLinkedList are sorted by 'value', from min to max, in a doubly-linked list
// each node in the doubly-linked list is of the form {datum: , value: , prev: , next: }
// 'datum' refers to the original datum; 'value' is retrieved from data, 'prev'/'next' refer to previous/next value-based nodes

export default function SortedDirectAccessDoublyLinkedList () {
  this._valueAccesor =          // accessor to the value to sort on
    function (obj) {
      return obj.value;
    };
  this._min = null;             // reference to a doubly-linked node with the min value
  this._max = null;             // reference to a doubly-linked node with the max value
  this._closestTo0 = null;      // reference to the doubly-linked node with the value closest or egal to 0
  this.size = 0;                // number of data in the doubly-linked list
  this._idToNode = {};          // direct access to a node of the doubly-linked list
}

SortedDirectAccessDoublyLinkedList.prototype.valueAccessor = function (_) {
  if (!arguments.length) { return this._valueAccesor; }
  this._valueAccesor = _;

  //for chaining purpose
  return this;
};

SortedDirectAccessDoublyLinkedList.prototype.closestTo0 = function () {
  return this._closestTo0;
};

SortedDirectAccessDoublyLinkedList.prototype.clear = function () {
  this._min = null;
  this._max = null;
  this._closestTo0 = null;
  this.size = 0;
  this._idToNode = {};

  //for chaining purpose
  return this;
};

SortedDirectAccessDoublyLinkedList.prototype.dln = function (datum){
  // dln = doubly-linked node
  return this._idToNode[datum.id];
};

SortedDirectAccessDoublyLinkedList.prototype.addMany = function (data) {

  data.forEach( function (datum, item) {
    this.add(datum);
  }, this);

  //for chaining purpose
  return this;
};

SortedDirectAccessDoublyLinkedList.prototype.add = function (datum){
  //create a new doubly-linked node
  var dln = {
    datum: datum, // original datum
    value: this._valueAccesor(datum),
    prev: null,	// previous value-based node
    next: null		// next value-based node
  };

  //insert node in the adequate position in the doubly-linked list
  if (this.size === 0) { //special case: no node in the list yet
    this._min = this._max = this._closestTo0 = dln;
  } else {
    if (dln.value <= this._min.value) {//special case: new datum is the min
      dln.next = this._min;
      dln.next.prev = dln;
      this._min = dln;
    } else if (dln.value >= this._max.value) { //special case: new datum is the max
      dln.prev = this._max;
      dln.prev.next = dln;
      this._max = dln;
    } else {
      //insert the node at the adequate position
      var current = this._max;
      //loop to find immediate prev
      while (current.value > dln.value) {
        current = current.prev;
      }
      dln.prev = current;
      dln.next = current.next;
      dln.next.prev = dln;
      dln.prev.next = dln;
    }
    if (Math.abs(dln.value) < Math.abs(this._closestTo0.value)) {
      this._closestTo0 = dln;
    }
  }

  //direct access to the node
  this._idToNode[dln.datum.id] = dln;

  //update size
  this.size++;

  //for chaining purpose
  return this;
};

SortedDirectAccessDoublyLinkedList.prototype.remove = function (datum) {
  var dln = this.dln(datum);

  //remove node from the doubly-linked list
  if (this.size === 1) { //special case: last item to remove
    this._min = this._max = this._closestTo0 = null;
  } else {
    if (dln===this._closestTo0) {
      if (this._closestTo0.next === null) {
        //closestTo0 is also the max, consider merge code with below
        this._closestTo0 = dln.prev;
      } else if (this.closestToZero.prev === null) {
        //closestTo0 is also the min, consider merge code with below
        this._closestTo0 = dln.prev;
      } else {
        //consider merge code with below
        var prevAbsValue = Math.abs(this._closestTo0.prev.value);
        var nextAbsValue = Math.abs(this._closestTo0.next.value);
        if (prevAbsValue < nextAbsValue) {
          this._closestTo0 = this._closestTo0.prev;
        } else {
          this._closestTo0 = this._closestTo0.next;
        }
      }
    }
    if (dln === this._min) { //special case: datum is the min
      this._min = this._min.next;
      this._min.prev = null;
    } else if (dln === this._max) { //special case: datum is the max
      this._max = this._max.prev;
      this._max.next = null;
    } else {
      //remove pointers to the node
      dln.next.prev = dln.prev;
      dln.prev.next = dln.next;
    }
  }


  dln = null; // carbage collector
  delete this._idToNode[datum.id]; //remove direct access to the node

  //update size
  this.size--;

  //for chaining purpose
  return this;
};
