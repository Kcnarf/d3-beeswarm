# d3.layout.beeswarm
This d3 plugin produces a _beeswarm_ arrangement, thanks to a dedicated algorithm and without the use a the d3.force layout.

Currently available only for __d3 v3.x__

## Context
Beeswarm is a one-dimensional scatter plot with closely-packed, non-overlapping points. The beeswarm plot is a useful technique when we wish to see not only the measured values of interest for each data point, but also the distribution of these values

Some beeswarm-like plot implementation uses force layout, but the force layout simulation has some drawbacks:

* it naturally tries to reach its equilibrium by rearranging data points in the 2D space, which can be disruptive to the ordering of the data
* it requires several iterations to reach its equilibrium

This _beeswarm_ plugin uses a dedicated one pass algorithm. The final arrangement is contraint in _x_ and free in _y_. This means that data are arranged along the x-axis, and that the position of each data reflects its precise _x_ value. _y_ position doesn't reflect any data-related value, and only serves the non-overlapping constraint.


## Examples
* This [block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8) uses this __d3.layout.beeswarm__ plugin.
* This [post](http://poly-graph.co/vocabulary.html) uses a beeswarm plot (but not this plugin).

## Usages
In your HTML file, load the plugin after loading D3. The result may look like:
```html
<script src="https://d3js.org/d3.v3.min.js"></script>
<script src="https://rawgit.com/Kcnarf/d3.layout.beeswarm/master/beeswarm.js"></script>
```

Later, in your javascript, in order to define the arrangement:
```javascript
var swarm = d3.layout.beeswarm()
  .data(data)                                 // set the data to arrange
  .distributeOn(function(d){                  // set the value accessor to distribute on
       return xScale(d.foo);                    // evaluated once on each element of data
  })                                           // when starting the arrangement
  .radius(4)                                  // set the radius for overlapping detection
  .orientation("horizontal")                  // set the orientation of the arrangement
                                                // could also be 'vertical'
  .side("symetric")                           // set the side(s) available for accumulation
                                                // could also be 'positive' or 'negative'
  .arrange();                                 // launch arrangement computation;
                                                // return an array of {datum: , x: , y: }
                                                // where datum refers to an element of data
                                                // each element of data remains unchanged
```

Finally, in your javascript, in order to draw the swarm:
```javascript
d3.selectAll("circle")
  .data(swarm)
  .enter()
    .append("circle")
      .attr("cx", function(bee) { return bee.x; })
      .attr("cy", function(bee) { return bee.y; })
      .style("fill", function(bee) { return fillScale(bee.datum.bar); })
```
In the last line, ```bee.datum``` refers to the original datum.

## Reference
* R package: <a href=http://www.cbs.dtu.dk/~eklund/beeswarm/'>http://www.cbs.dtu.dk/~eklund/beeswarm/</a>


## How To

* issue [option to arrange from minToMax, maxToMin, extremeToCenter, shuffled](https://github.com/Kcnarf/d3.layout.beeswarm/issues/7) explains how to arrange in a particular order. It can be tested in [this block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8).
* issue [add a maximum size, and provide strategies if exceeded](https://github.com/Kcnarf/d3.layout.beeswarm/issues/2) explains how to handle too large viz due to extreme accumulations. It can be tested in [this block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8).
