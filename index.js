module.exports = function () {
  /////// Inputs ///////
  var data = [];                  // original data to arrange
  var radius = 4;                 // default radius
  var orientation = "horizontal"; // default orientation; "vertical" also available
  var side = "symetric";          // default side; "positive" and "negative" are also available
  var distributeOn =              // accessor to the x value
          function (datum) {
            return datum.x;
          };

  /////// Internals ///////
  var minDistanceBetweenCircles;
  var minSquareDistanceBetweenCircles;
  var xBasedDataManager;          // for collision detection, x-based sorted direct-access doubly-linked list of data, used to find nearest already arranged data
  var xBasedColliderManager;      // for collision detection, x-based sorted direct-access doubly-linked list of already arranged data, limit collision detection to already arranged neighbours
  var yBasedColliderManager;      // for collision detection, y-based sorted direct-access doubly-linked list of already arranged data, limit collision detection to already arranged neighbours
  var arrangement;                // result, array of {datum: , x: , y: }

  //--> for metrics purpose
  var totalPossibleColliders, maxPossibleColliders,
      totalTestedPlacements,
      visitedColliderCount, totalVisitedColliders, maxVisitedColliders;
  //<-- for metrics purpose

  function _beeswarm () {}       // constructor ???

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  _beeswarm.data = function(_) {
    if (!arguments.length) { return data; }
    data = _;

    return _beeswarm;
  };

  _beeswarm.radius = function (_) {
    if (!arguments.length) { return radius; }
    radius = _;

    return _beeswarm;
  };

  _beeswarm.orientation = function (_) {
    if (!arguments.length) { return orientation; }
    if (_ === "horizontal" ||
        _ === "vertical"
       ) {
      orientation = _;
    }

    return _beeswarm;
  };

  _beeswarm.side = function (_) {
    if (!arguments.length) { return side; }
    if (_ === "symetric" ||
        _ === "positive" ||
        _ === "negative"
       ) {
      side = _;
    }

    return _beeswarm;
  };

  _beeswarm.distributeOn = function (_) {
    if (!arguments.length) { return distributeOn; }
    distributeOn = _;

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
        // try to place on the x-axis
        d.free = 0;
        if (!collidesWithOther(d, yBasedColliderManager.closestTo0())) {
          bestYPosition = 0;
          //-->for metrics purpose
          totalVisitedColliders += visitedColliderCount;
          if (visitedColliderCount > maxVisitedColliders) {
            maxVisitedColliders = visitedColliderCount;
          }
          visitedColliderCount = 0;
          totalTestedPlacements += 1;
          //<--for metrics purpose
        } else {
          xBasedPossibleColliders.forEach(function(xbpc) {
            // try to place below and above an already arranged datum
            relativeYPos = yPosRelativeToXbpc(xbpc, d);
            placeBelow(d, xbpc, relativeYPos);
            if (isAuthorizedPlacement(d) &&
                isBetterPlacement(d, bestYPosition) &&
                !collidesWithOther(d, yBasedColliderManager.dln(xbpc))) {
              bestYPosition = d.free;
            }
            //-->for metrics purpose
            totalVisitedColliders += visitedColliderCount;
            if (visitedColliderCount > maxVisitedColliders) {
              maxVisitedColliders = visitedColliderCount;
            }
            visitedColliderCount = 0;
            totalTestedPlacements += 1;
            //<--for metrics purpose
            placeAbove(d, xbpc, relativeYPos);
            if (isAuthorizedPlacement(d) &&
                isBetterPlacement(d, bestYPosition) &&
                !collidesWithOther(d, yBasedColliderManager.dln(xbpc))) {
              bestYPosition = d.free;
            }
            //-->for metrics purpose
            totalVisitedColliders += visitedColliderCount;
            if (visitedColliderCount > maxVisitedColliders) {
              maxVisitedColliders = visitedColliderCount;
            }
            visitedColliderCount = 0;
            totalTestedPlacements += 1;
            //<--for metrics purpose
        	})
        }
      };
      d.free = bestYPosition;
      if (orientation === "horizontal") {
        d.x = d.fixed;
        d.y = bestYPosition;
      } else {
        d.x = bestYPosition;
        d.y = d.fixed;
      }
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
        fixed: distributeOn(d),
        free: -Infinity
      };
    });

    minDistanceBetweenCircles = 2*radius;
    minSquareDistanceBetweenCircles = Math.pow(minDistanceBetweenCircles, 2);
    xBasedDataManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.fixed;})
      .addMany(arrangement);
    xBasedColliderManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.fixed;});
    yBasedColliderManager = new SortedDirectAccessDoublyLinkedList()
      .valueAccessor(function(d){return d.free;});


    //-->for metrics purpose
    totalPossibleColliders = maxPossibleColliders = 0;
    totalTestedPlacements = 0;
    visitedColliderCount = totalVisitedColliders = maxVisitedColliders =0;
    //<--for metrics purpose
  }

	function findNearestPossibleCollider(dln, visitedDln, direction) {
    if (visitedDln === null) { // special case: max reached
      return null;
    } else if ((direction==="prev") ?
               dln.value - visitedDln.value > minDistanceBetweenCircles :
               visitedDln.value - dln.value > minDistanceBetweenCircles
              ) {
      // stop visit, remaining data are too far away
      return null;
    } else {// visitedDln is close enought
      if (isFinite(visitedDln.datum.free)) { // visitedDln is already arranged, and hence is the nearest possible x-based collider
        return(visitedDln.datum);
      }
      // continue finding
      return findNearestPossibleCollider(dln, visitedDln[direction], direction);
    }
  }

  function visitToGatherXBasedPossibleColliders(dln, visitedDln, direction, xBasedPossibleColliders) {
    if (visitedDln === null) { // special case: extreme reached
      return;
    } else if ((direction==="prev") ?
               dln.value - visitedDln.value > minDistanceBetweenCircles :
               visitedDln.value - dln.value > minDistanceBetweenCircles
              ) {
      // stop visit, remaining data are too far away
      return;
    } else {// visitedDln is close enought
      // visitedDln is already arranged, and hence is a possible x-based collider
      xBasedPossibleColliders.push(visitedDln.datum);
      // continue gathering
      visitToGatherXBasedPossibleColliders(dln, visitedDln[direction], direction, xBasedPossibleColliders);
    }
  }

  function gatherXBasedPossibleColliders (datum) {
    var xBasedPossibleColliders = [];
    var dln = xBasedDataManager.dln(datum);
    //use xBasedDataManager to retrieve nearest already arranged data
    var nearestXPrevAlreadyArrangedData = findNearestPossibleCollider(dln, dln.prev, "prev");
    var nearestXNextAlreadyArrangedData = findNearestPossibleCollider(dln, dln.next, "next");

    //use xBasedColliderManager to retrieve already arranged data that may collide with datum (ie, close enought to datum considering x position)
    if (nearestXPrevAlreadyArrangedData != null) {
      //visit x-prev already arranged nodes
      dln = xBasedColliderManager.dln(nearestXPrevAlreadyArrangedData);
      visitToGatherXBasedPossibleColliders(dln, dln, "prev", xBasedPossibleColliders);
    }

    if (nearestXNextAlreadyArrangedData != null) {
      //visit x-next already arranged nodes
      dln = xBasedColliderManager.dln(nearestXNextAlreadyArrangedData);
      visitToGatherXBasedPossibleColliders(dln, dln, "next", xBasedPossibleColliders);
    }

    //-->for metrics purpose
    totalPossibleColliders += xBasedPossibleColliders.length;
    if (xBasedPossibleColliders.length > maxPossibleColliders) {
      maxPossibleColliders = xBasedPossibleColliders.length;
    }
    //<--for metrics purpose
    return xBasedPossibleColliders;
  }

  function isAuthorizedPlacement(datum) {
    if (side === "symetric") {
      return true;
    } else if (side === "positive") {
      return datum.free>=0;
    } else {
      return datum.free<=0;
    }
  }

  function isBetterPlacement(datum, bestYPosition) {
    return Math.abs(datum.free) < Math.abs(bestYPosition);
  }

  function yPosRelativeToXbpc(xbpc, d) {
    // handle Float approximation with +1E-6
    return Math.sqrt(minSquareDistanceBetweenCircles-Math.pow(d.fixed-xbpc.fixed,2))+1E-6;
  }

  function placeBelow(d, aad, relativeYPos) {
    d.free = aad.free - relativeYPos;
  }

  function placeAbove(d, aad, relativeYPos) {
    d.free = aad.free + relativeYPos;
  }

  function areCirclesColliding(d0, d1) {
    visitedColliderCount++; //for metrics prupose

    return (Math.pow(d1.free-d0.free, 2) + Math.pow(d1.fixed-d0.fixed, 2)) < minSquareDistanceBetweenCircles;
  }

  function visitToDetectCollisionWithOther(datum, visitedDln, direction, visitCount) {
    if (visitedDln === null) { // special case: y_max reached, no collision detected
      return false;
    } else if ((direction==="prev") ?
               datum.free - visitedDln.datum.free > minDistanceBetweenCircles :
               visitedDln.datum.free - datum.free > minDistanceBetweenCircles
              ) {
      // stop visit, no collision detected, remaining data are too far away
      return false;
    } else if (areCirclesColliding(datum, visitedDln.datum)) {
      return true;
    } else {
      // continue visit
      return visitToDetectCollisionWithOther(datum, visitedDln[direction], direction, visitCount++);
    }
  }

  function collidesWithOther (datum, visitedDln) {
    var visitCount = 0;
    //visit prev dlns for collision check
    // if (visitToDetectCollisionWithOther(datum, visitedDln.prev, "prev", visitCount++)) {
    if (visitToDetectCollisionWithOther(datum, visitedDln, "prev", visitCount++)) {
      return true;
    } else {
      //visit next dlns for collision check
      // return visitToDetectCollisionWithOther(datum, visitedDln.next, "next", visitCount++);
      return visitToDetectCollisionWithOther(datum, visitedDln, "next", visitCount++);
    }
  }

  ///////////////////////
  //////// Data /////////
  ////// Strucutre //////
  ///////////////////////

  // each data MUST have a 'value' property (for sorting)
  // each data MUST have a 'id' property (for direct-access)

  // data in SortedDirectAccessDoublyLinkedList are sorted by 'value', from min to max, in a doubly-linked list
  // each node in the doubly-linked list is of the form {datum: , value: , prev: , next: }
  // 'datum' refers to the original datum; 'value' is retrieved from data, 'prev'/'next' refer to previous/next value-based nodes

  function SortedDirectAccessDoublyLinkedList () {
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

  return _beeswarm;
};
