# d3.layout.beeswarm
This d3 plugin produces a _beeswarm_ arrangement, thanks to a dedicated algorithm and without the use a the d3.force layout.

Currently available only for __d3 v3.x__

## Context
Beeswarm is a one-dimensional scatter plot with closely-packed, non-overlapping points. The beeswarm plot is a useful technique when we wish to see not only the measured values of interest for each data point, but also the distribution of these values

Some beeswarm-like plot implementation uses force layout, but the force layout simulation has some drawbacks:

* it naturally tries to reach its equilibrium by rearranging data points in the 2D space, which can be disruptive to the ordering of the data
* it requires several iterations to reach its equilibrium

This _beeswarm_ plugin uses a dedicated one pass algorithm. By default, this plugin arranges data in an horizontal way, ie. along the x-axis. In this case, the final arrangement is constraint in _x_ and free in _y_. This means that the position of each data reflects its precise _x_ value, while _y_ position doesn't reflect any data-related value (and only serves the non-overlapping constraint). This plugin can also arrange data in a vertical way.


## Examples
* This [block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8) uses this __d3.layout.beeswarm__ plugin.
* This [post](http://poly-graph.co/vocabulary.html) uses a beeswarm plot (but not this plugin).

## Installing
In your HTML file, load the plugin after loading D3. The result may look like:
```html
<script src="https://d3js.org/d3.v3.min.js"></script>
<script src="https://rawgit.com/Kcnarf/d3.layout.beeswarm/master/beeswarm.js"></script>
```

## TL;DR;
In your javascript, in order to define the arrangement:
```javascript
var swarm = d3.layout.beeswarm()
  .data(data)                                 // set the data to arrange
  .distributeOn(function(d){                  // set the value accessor to distribute on
       return xScale(d.foo);                    // evaluated once on each element of data
  })                                            // when starting the arrangement
  .radius(4)                                  // set the radius for overlapping detection
  .orientation('horizontal')                  // set the orientation of the arrangement
                                                // could also be 'vertical'
  .side('symetric')                           // set the side(s) available for accumulation
                                                // could also be 'positive' or 'negative'
  .arrange();                                 // launch arrangement computation;
                                                // return an array of {datum: , x: , y: }
                                                // where datum refers to an element of data
                                                // each element of data remains unchanged
```

Then, in your javascript, in order to draw the swarm:
```javascript
d3.selectAll('circle')
  .data(swarm)
  .enter()
    .append('circle')
      .attr('cx', function(bee) { return bee.x; })
      .attr('cy', function(bee) { return bee.y; })
      .attr('r', 4)
      .style('fill', function(bee) { return fillScale(bee.datum.bar); })
```
In the last line, ```bee.datum``` refers to the original datum.

## Reference
* R package: <a href=http://www.cbs.dtu.dk/~eklund/beeswarm/'>http://www.cbs.dtu.dk/~eklund/beeswarm/</a>

## API

<a name="beeswarm" href="#beeswarm">#</a> d3.layout.<b>beeswarm</b>()

Creates a new beeswarm with the default settings:
```javascript
distributeOn = function(d) { return d.x; };
radius = 4;
orientation = 'horizontal';
side = 'symetric';
```

<a name="beeswarm_data" href="#beeswarm_data">#</a> <i>beeswarm.</i><b>data</b>data</b>([data])

If _data_ is specified, set the array of data to arrange and returns this beeswarm. If _data_ is not specified, returns the current array of data to arrange.

<a name="beeswarm_distributeOn" href="#beeswarm_distributeOn">#</a> <i>beeswarm.</i><b>distributeOn</b>([callback])

If _callback_ is specified, set the callback that evaluates the value to distribute on and returns this beeswarm. If _callback_ is specified, return the current callback, which defaults to ```function(d) { return d.x; }```.

The callback is evaluated once, on each element to arrange, at the beginning of the arrangement computation. The callback must return the final x-coordinate for an horizontal arrangement (or the final y-coordinate for a vertical arrangement). So if you use a d3.scale, your code should look like:

```javascript
var swarm = d3.layout.beeswarm()
  .data(data)
  .distributeOn(function(d){
       return xScale(d.foo);
  })  
```

<a name="beeswarm_radius" href="#beeswarm_radius">#</a> <i>beeswarm.</i><b>radius</b>([radius])

Without any argument, returns the current radius of the layout.
If _radius_ is specified, sets the radius of each datum to the specified number. If _radius_ is not specified, returns the current radius, which defaults to 4.

The arrangement uses this _radius_ as a constraint, and arranges each datum so that there is no overlapping. However, when its time to draw each datum, you can use another rendering radius:
* a lower rendering radius will add some padding between data
* a higher rendering radius will add some overlapping between data (making the final viz more compacted as if there wasn't any overlapping, but with the drawback to not meet the non-overlapping constraint of beeswarm arrangement)

<a name="beeswarm_orientation" href="#beeswarm_orientation">#</a> <i>beeswarm.</i><b>orientation</b>([orientation])

If _orientation_ is specified, set the orientation to the specified value (within ```'horizontal'``` or ```'vertical'```) and returns this beeswarm. If _orientation_ is not specified, returns the current orientation, which defaults to ```'horizontal'```.

A ```'horizontal'``` orientation will arrange data along the x-axis. A ```'vertical'``` arrangement will arrange data along the y-axis.

<a name="beeswarm_side" href="#beeswarm_side">#</a> <i>beeswarm.</i><b>side</b>([side])

If _side_ is specified, set the side to the specified value (within ```'symetric'```, ```'positive'``` or ```'negative'```) and returns this beeswarm. If _side_ is not specified, returns the current side, which defaults to ```'symetric'```.

A ```'symetric'``` side arranges data around the main axis, placing data above and below the axis. A ```'positive'```side arranges data only above the main axis. A ```'negative'```side arranges data only below the main axis.

<a name="beeswarm_arrange" href="#beeswarm_arrange">#</a> <i>beeswarm.</i><b>arrange</b>()

Launches the arrangement computation. Return an array of ```{x: , y: , datum: }```, where ```x``` and ```y``` are the computed coordinates, and ```datum``` refers to the original element of data.

## How To

* issue [option to arrange from minToMax, maxToMin, extremeToCenter, shuffled](https://github.com/Kcnarf/d3.layout.beeswarm/issues/7) explains how to arrange in a particular order. It can be tested in [this block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8).
* issue [add a maximum size, and provide strategies if exceeded](https://github.com/Kcnarf/d3.layout.beeswarm/issues/2) explains how to handle too large viz due to extreme accumulations. It can be tested in [this block](http://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8).
