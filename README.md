# d3.layout.swarmX
D3 plugin which computes a 'swarmX' arrangement

#### Introduction
Beeswarm is a one-dimensional scatter plot with closely-packed, non-overlapping points. Beeswarm plot usually uses force layout, but the force layout simulation naturally tries to reach its equilibrium by rearranging data points in the 2D space, which can be disruptive to the ordering of the data.

A _swarmX_ arrangement is contraint in _x_ and free in _y_. This means that data are arranged along the x-axis, and that the position of each data reflects its precise _x_ value. _y_ position doesn't reflect any data-related value, and only serves the non-overlapping constraint.


#### Example
This <a href='http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8'>block</a> uses this __d3.layout.swarmX__ plugin.


#### Usages
```javascript
var swarm = d3.layout.swarmX()
  .data(data)                                 // set the data to arrange
  .radius(4)                                  // set the radius for overlapping detection
  .x(function(d){                             // set the 'x' value accessor
       return xScale(d.trend);                //   evaluated once on each element of data
   })                                         //   when starting the arrangement
  .arrange();                                 // launch arrangement computation;
                                              //   return an array of {datum: , x: , y: }
                                              //   where datum refers to an element of data
                                              //   each element of data remains unchanged
```

#### Check list
Even if this plugin works, this is an on-going work:

* [done] standalone js (embed data structure for collision detection optimisation)
* [todo, must\_have] remove metrics informations for faster computation
* [todo, must\_have] make gihtub project more professionnal:
  * code review/rework,
  * unit tests (internal data strucutre, API),
  * minify,
  * ...
* [todo, nice\_to\_have] option to arrange data above/below/arround x-axis
* [todo, nice\_to\_have] add a maximum size, and provide strategies if exceeded (automatic stretching with overlapping like d3.layout.force, automatic radius reduction, omit exceeding data, ...)
* [todo, nice\_to\_have] detect if data is already sorted, for computation optimization (x-based possible colliders are easier to detect, cf. <a href='http://bl.ocks.org/Kcnarf/921b2f038327dd0ca55213e4ce8bcdb1'>this block</a>)
