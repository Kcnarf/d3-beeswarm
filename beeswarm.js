d3.layout.beeswarm = function () {		
  /////// Inputs ///////
  var data = [];							// original data to arrange
  var	radius = 4;							// default radius
  var	x =											// accessor to the x value
          function (datum) {
            return datum.x;
          };

  /////// Result ///////
  var arrangement; 						// result, array of {datum: , x: , y: }

  /////// Internals ///////
  var minDistanceBetweenCircles;
  var minSquareDistanceBetweenCircles;
  var xBasedDataManager;			// for collision detection, x-based sorted direct-access doubly-linked list of data, used to find nearest already arranged data
  var xBasedColliderManager;	// for collision detection, x-based sorted direct-access doubly-linked list of already arranged data, limit collision detection to already arranged neighbours
  var yBasedColliderManager;	// for collision detection, y-based sorted direct-access doubly-linked list of already arranged data, limit collision detection to already arranged neighbours


  //--> for metrics purpose
  var totalPossibleColliders, maxPossibleColliders,
      totalTestedPlacements,
      visitedColliderCount, totalVisitedColliders, maxVisitedColliders;
  //<-- for metrics purpose

  function _beeswarm () {}; 		// constructor ???

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  _beeswarm.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    
    return _beeswarm;
  };

  _beeswarm.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    
    return _beeswarm;
  };

  _beeswarm.x = function (_) {
    if (!arguments.length) return x;
    x = _;
    
    return _beeswarm;
  };

  _beeswarm.arrange = function() {
    initArrangement();
    arrangement.forEach(function (d) {
      var bestYPosition = -Infinity,
          relativeYPos,
          xBasedPossibleColliders = gatherXBasedPossibleColliders(d);
      if (xBasedPossibleColliders.length===0) {
        bestYPosition = 0;
      } else {
        yBasedColliderManager.clear();
        yBasedColliderManager.addMany(xBasedPossibleColliders);
        xBasedPossibleColliders.forEach(function(xbpc) {
          relativeYPos = yPosRelativeToXbpc(xbpc, d);
          placeBelow(d, xbpc, relativeYPos);
          if (isBetterPlacement(d, bestYPosition) &&
              !collidesWithOther(d, yBasedColliderManager.dln(xbpc))) {
            bestYPosition = d.y;
          }
          //-->for metrics purpose
          totalVisitedColliders += visitedColliderCount;
          if (visitedColliderCount > maxVisitedColliders) {
            maxVisitedColliders = visitedColliderCount;
          }
          visitedColliderCount = 0;
          //<--for metrics purpose
          placeAbove(d, xbpc, relativeYPos);
          if (isBetterPlacement(d, bestYPosition) &&
              !collidesWithOther(d, yBasedColliderManager.dln(xbpc))) {
            bestYPosition = d.y;
          }
          //-->for metrics purpose
          totalVisitedColliders += visitedColliderCount;
          if (visitedColliderCount > maxVisitedColliders) {
            maxVisitedColliders = visitedColliderCount;
          }
          visitedColliderCount = 0;
          //<--for metrics purpose
          totalTestedPlacements += 2; //for metrics purpose
        })
      };
      d.y = bestYPosition;
      xBasedColliderManager.add(d);
    });
    return arrangement;
  };

  _beeswarm.metrics = function () {
    return {
      totalPossibleColliders: totalPossibleColliders,
      maxPossibleColliders: maxPossibleColliders,
      totalTestedPlacements: totalTestedPlacements,
      visitedColliderCount: visitedColliderCount,
      totalVisitedColliders: totalVisitedColliders,
      maxVisitedColliders: maxVisitedColliders
    };
  };

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function initArrangement () {
    arrangement = data.map(function (d,i) {
      return {
        datum: d,
        id: i,
        x: x(d),
        y: -Infinity
      }; 
    });

    minDistanceBetweenCircles = 2*radius;
    minSquareDistanceBetweenCircles = Math.pow(minDistanceBetweenCircles, 2);
    xBasedDataManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.x;})
      .addMany(arrangement);
    xBasedColliderManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.x;});
    yBasedColliderManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.y;});


    //-->for metrics purpose
    totalPossibleColliders = maxPossibleColliders = 0;
    totalTestedPlacements = 0;
    visitedColliderCount = totalVisitedColliders = maxVisitedColliders =0;
    //<--for metrics purpose
  };

	function findNearestPossibleCollider(dln, visitedDln, direction) {
    if (visitedDln === null) { // special case: max reached
      return null;
    } else if ((direction==="below")
               ? dln.value - visitedDln.value > minDistanceBetweenCircles
               : visitedDln.value - dln.value > minDistanceBetweenCircles
              ) {
      // stop visit, remaining data are too far away
      return null;
    } else {// visitedDln is close enought
      if (isFinite(visitedDln.datum.y)) { // visitedDln is already arranged, and hence is the nearest possible x-based collider
        return(visitedDln.datum);
      }
      // continue finding
      return findNearestPossibleCollider(dln, visitedDln[direction], direction);
    }
  };

  function visitToGatherXBasedPossibleColliders(dln, visitedDln, direction, xBasedPossibleColliders) {
    if (visitedDln === null) { // special case: extreme reached
      return;
    } else if ((direction==="below")
               ? dln.value - visitedDln.value > minDistanceBetweenCircles
               : visitedDln.value - dln.value > minDistanceBetweenCircles
              ) {
      // stop visit, remaining data are too far away
      return;
    } else {// visitedDln is close enought
      // visitedDln is already arranged, and hence is a possible x-based collider
      xBasedPossibleColliders.push(visitedDln.datum);
      // continue gathering
      visitToGatherXBasedPossibleColliders(dln, visitedDln[direction], direction, xBasedPossibleColliders);
    }
  };

  function gatherXBasedPossibleColliders (datum) {
    var xBasedPossibleColliders = [];
    var dln = xBasedDataManager.dln(datum);
    //use xBasedDataManager to retrieve nearest already arranged data
    var nearestXBelowAlreadyArrangedData = findNearestPossibleCollider(dln, dln.below, "below");
    var nearestXAboveAlreadyArrangedData = findNearestPossibleCollider(dln, dln.above, "above");

    //use xBasedColliderManager to retrieve already arranged data that may collide with datum (ie, close enought to datum considering x position)
    if (nearestXBelowAlreadyArrangedData != null) {
      //visit x-below already arranged nodes
      dln = xBasedColliderManager.dln(nearestXBelowAlreadyArrangedData);
      visitToGatherXBasedPossibleColliders(dln, dln, "below", xBasedPossibleColliders);
    }

    if (nearestXAboveAlreadyArrangedData != null) {
      //visit x-above already arranged nodes
      dln = xBasedColliderManager.dln(nearestXAboveAlreadyArrangedData);
      visitToGatherXBasedPossibleColliders(dln, dln, "above", xBasedPossibleColliders);
    }

    //-->for metrics purpose
    totalPossibleColliders += xBasedPossibleColliders.length;
    if (xBasedPossibleColliders.length > maxPossibleColliders) {
      maxPossibleColliders = xBasedPossibleColliders.length;
    }
    //<--for metrics purpose
    return xBasedPossibleColliders;
  };

  function isBetterPlacement(datum, bestYPosition) {
    return Math.abs(datum.y) < Math.abs(bestYPosition);
  };

  function yPosRelativeToXbpc(xbpc, d) {
    // handle Float approximation with +1E-6
    return Math.sqrt(minSquareDistanceBetweenCircles-Math.pow(d.x-xbpc.x,2))+1E-6;
  };

  function placeBelow(d, aad, relativeYPos) {
    d.y = aad.y - relativeYPos;

    //showOnTheFlyCircleArrangement(d, "test");
  };

  function placeAbove(d, aad, relativeYPos) {
    d.y = aad.y + relativeYPos;

    //showOnTheFlyCircleArrangement(d, "test");
  };

  function areCirclesColliding(d0, d1) {
    visitedColliderCount++; //for metrics prupose

    return (Math.pow(d1.y-d0.y, 2) + Math.pow(d1.x-d0.x, 2)) < minSquareDistanceBetweenCircles;
  };

  function collidesWithBelow(datum, visitedDln, visitCount) {
    if (visitedDln === null) { // special case: y_min reached, no collision detected
      return false;
    } else if ((datum.y - visitedDln.datum.y) > minDistanceBetweenCircles) {
      // stop visit, no collision detected, remaining data are too far away
      return false;
    } else if (areCirclesColliding(datum, visitedDln.datum)) {
      return true;
    } else {
      // continue visit
      return collidesWithBelow(datum, visitedDln.below, visitCount++)
    }
  };

  function collidesWithAbove(datum, visitedDln, visitCount) {
    if (visitedDln === null) { // special case: y_max reached, no collision detected
      return false;
    } else if ((visitedDln.datum.y - datum.y) > minDistanceBetweenCircles) {
      // stop visit, no collision detected, remaining data are too far away
      return false;
    } else if (areCirclesColliding(datum, visitedDln.datum)) {
      return true;
    } else {
      // continue visit
      return collidesWithAbove(datum, visitedDln.above, visitCount++)
    }
  };

  function collidesWithOther (datum, visitedDln) {
    var visitCount = 0;
    //visit below dlns for collision check
    if (collidesWithBelow(datum, visitedDln.below, visitCount++)) {
      return true;
    } else {
      //visit above dlns for collision check
      return collidesWithAbove(datum, visitedDln.above, visitCount++);
    }
  };

  ///////////////////////
  //////// Data /////////
  ////// Strucutre //////
  ///////////////////////

  // each data MUST have a 'value' property (for sorting)
  // each data MUST have a 'id' property (for direct-access)

  // data in SortedDirectAccessDoublyLinkedList are sorted by 'value', from min to max, in a doubly-linked list
  // each node in the doubly-linked list is of the form {datum: , value: , prev: , next: }
  // 'datum' refers to the original datum; 'value' is retrieved from data, below'/'above' refer to previous/next value-based nodes

  function SortedDirectAccessDoublyLinkedList () {
    this._valueAccessor = // accessor to the value to sort on
      function (datum) {
      return datum.value;
    }
    this._min = null; // reference to the doubly-linked node with the min value
    this._max = null; // reference to the doubly-linked node with the max value
    this.size = 0 // number of data in the doubly-linked list
    this._idToNode = {}; // direct access to a node of the doubly-linked list
  };

  SortedDirectAccessDoublyLinkedList.prototype.valueAccessor = function (_) {
    if (!arguments.length) return this._valueAccessor;
    this._valueAccessor = _;

    //for chaining purpose
    return this;
  };

  SortedDirectAccessDoublyLinkedList.prototype.clear = function () {
    this._min = null;
    this._max = null;
    this.size = 0;
    this._idToNode = {};

    //for chaining purpose
    return this
  };

  SortedDirectAccessDoublyLinkedList.prototype.dln = function (datum){
    // dln = doubly-linked node
    return this._idToNode[datum.id];
  };

  SortedDirectAccessDoublyLinkedList.prototype.addMany = function (data) {

    data.forEach( function (datum, item) {
      this.add(datum);
    }, this)

    //for chaining purpose
    return this;
  };

  SortedDirectAccessDoublyLinkedList.prototype.add = function (datum){
    //create a new doubly-linked node
    var dln = {
      datum: datum, // original datum
      value: this._valueAccessor(datum),
      below: null,	// previous value-based node
      above: null		// next value-based node
    };

    //insert node in the adequate position in the doubly-linked list
    if (this.size === 0) { //special case: no node in the list yet
      this._min = this._max = dln;
    } else if (dln.value <= this._min.value) {//special case: new datum is the min
      dln.above = this._min;
      dln.above.below = dln;
      this._min = dln;
    } else if (dln.value >= this._max.value) { //special case: new datum is the max
      dln.below = this._max;
      dln.below.above = dln;
      this._max = dln;
    } else {
      //insert the node at the adequate position
      var current = this._max;
      //loop to find immediate below
      while (current.value > dln.value) {
        current = current.below;
      }
      dln.below = current;
      dln.above = current.above;
      dln.above.below = dln;
      dln.below.above = dln;
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
      this._min = this._max = null;
    } else if (dln === this._min) { //special case: datum is the min
      this._min = this._min.above;
      this._min.below = null;
    } else if (dln === this._max) { //special case: datum is the max
      this._max = this._max.below;
      this._max.above = null;
    } else {
      //remove pointers to the node
      dln.above.below = dln.below;
      dln.below.above = dln.above;
    }

    dln = null // carbage collector
    delete this._idToNode[datum.id]; //remove direct access to the node

    //update size
    this.size--;

    //for chaining purpose
    return this;
  }

  return _beeswarm;
}
