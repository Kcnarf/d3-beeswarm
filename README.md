# d3.layout.beeswarm
This d3 plugin produces a _beeswarm_ arrangement, thanks to a dedicated algorithm and without the use a the d3.force layout.

#### Context
Beeswarm is a one-dimensional scatter plot with closely-packed, non-overlapping points. The beeswarm plot is a useful technique when we wish to see not only the measured values of interest for each data point, but also the distribution of these values

Some beeswarm-like plot implementation uses force layout, but the force layout simulation has some drawbacks:

* it naturally tries to reach its equilibrium by rearranging data points in the 2D space, which can be disruptive to the ordering of the data
* it requires several iterations to reach its equilibrium

This _beeswarm_ plugin uses a dedicated one pass algorithm. The final arrangement is contraint in _x_ and free in _y_. This means that data are arranged along the x-axis, and that the position of each data reflects its precise _x_ value. _y_ position doesn't reflect any data-related value, and only serves the non-overlapping constraint.


#### Examples
* This <a href='http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8'>block</a> uses this __d3.layout.beeswarm__ plugin.
* This <a href='http://poly-graph.co/vocabulary.html'>post</a> uses a beeswarm plot (but not this plugin).

#### Usages
In your HTML file, load the plugin after loading D3. The result may look like:
```html
<script src="https://d3js.org/d3.v3.min.js"></script>
<script src="https://rawgit.com/Kcnarf/d3.layout.beeswarm/master/beeswarm.js"></script>
```

Later, in your javascript, in order to define the arrangement:
```javascript
var swarm = d3.layout.beeswarm()
  .data(data)                                 // set the data to arrange
  .radius(4)                                  // set the radius for overlapping detection
  .side("symetric")                           // set the side(s) available for accumulation
                                                // could be only 'positive' or 'negative' side
  .x(function(d){                             // set the 'x' value accessor
       return xScale(d.trend);                  // evaluated once on each element of data
   })                                           // when starting the arrangement
  .arrange();                                 // launch arrangement computation;
                                                // return an array of {datum: , x: , y: }
                                                // where datum refers to an element of data
                                                // each element of data remains unchanged
```

Finnaly, in your javascript, in order to draw the swarm:
```javascript
d3.selectAll("circle")
  .data(swarm)
  .enter()
    .append("circle")
      .attr("cx", function(bee) { return bee.x; })
      .attr("cy", function(bee) { return bee.y; })
      .style("fill", function(bee) { return fill(bee.datum.rank); })
```
In the last line, ```bee.datum``` refers to the original datum.

#### Reference
* R package: <a href=http://www.cbs.dtu.dk/~eklund/beeswarm/'>http://www.cbs.dtu.dk/~eklund/beeswarm/</a>
