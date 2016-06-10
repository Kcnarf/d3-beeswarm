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
<script src="https://rawgit.com/Kcnarf/d3.layout.swarmX/master/swarm-x.js"></script>
```

Then, in your javascript:
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

#### Reference
* R package: <a href=http://www.cbs.dtu.dk/~eklund/beeswarm/'>http://www.cbs.dtu.dk/~eklund/beeswarm/</a>

#### Check list
Even if this plugin works, this is an on-going work:

* [done] standalone js (embed data structure for collision detection optimisation)
* [done] option to arrange data above/below/arround axis (cf. _beeswarm.side()_)
* [todo, must\_have] remove metrics informations for faster computation
* [todo, must\_have] make gihtub project more professionnal:
  * code review/rework,
  * unit tests (internal data strucutre, API),
  * minify,
  * ...
* [todo, nice\_to\_have] option to arrange along x-axis or y-axis
* [todo, nice\_to\_have] add a maximum size, and provide strategies if exceeded (automatic stretching with overlapping like d3.layout.force, automatic radius reduction, omit exceeding data, ...)
* [todo, nice\_to\_have] detect if data is already sorted, for computation optimization (x-based possible colliders are easier to detect, cf. <a href='http://bl.ocks.org/Kcnarf/921b2f038327dd0ca55213e4ce8bcdb1'>this block</a>)
* [todo, nice\_to\_have] consider algorithm presented in <a href='http://yaikhom.com/2013/04/05/implementing-a-beeswarm-plot.html'>http://yaikhom.com/2013/04/05/implementing-a-beeswarm-plot.html</a>, which seems to have a lower complexity
