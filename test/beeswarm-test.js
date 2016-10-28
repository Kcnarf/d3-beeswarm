var tape = require("tape"),
    beeswarm = require("../");

tape("beeswarm().arrange() should consider data", function(test) {
  var data0 = [{x:0}],
      data1 = [{x:0}, {x:10}];

  test.ok(beeswarm.beeswarm().data(data0).arrange().length === 1);
  test.ok(beeswarm.beeswarm().data(data1).arrange().length === 2);
  test.end();
});

tape("beeswarm().arrange() should consider radius", function(test) {
  var data = [{x:0}, {x:10}],
      layout = beeswarm.beeswarm().data(data),
      arrangement = layout.arrange();

  test.ok(arrangement[1].y === 0);

  arrangement = layout.radius(10).arrange();
  test.ok(arrangement[1].y!==0);
  test.end();
});

tape("beeswarm().arrange() should consider orientation", function(test) {
  var data = [{x:10}],
      layout = beeswarm.beeswarm().data(data),
      arrangement = layout.arrange();

  test.ok(arrangement[0].x === 10 && arrangement[0].y === 0);

  arrangement = layout.orientation("vertical").arrange();
  test.ok(arrangement[0].x === 0 && arrangement[0].y === 10);
  test.end();
});

tape("beeswarm().arrange() should consider side", function(test) {
  var data = [{x:0}, {x:0}, {x:0}],
      layout = beeswarm.beeswarm().data(data),
      arrangement = layout.arrange();

  test.ok(arrangement[1].y * arrangement[2].y < 0);

  arrangement = layout.side("positive").arrange();
  test.ok(arrangement[1].y > 0 && arrangement[2].y > 0);

  arrangement = layout.side("negative").arrange();
  test.ok(arrangement[1].y < 0 && arrangement[2].y < 0);
  test.end();
});

tape("beeswarm().arrange() should consider distributeOn", function(test) {
  var data = [{x:0, x1: 5}, {x:10, x1: 15}],
      layout = beeswarm.beeswarm().data(data),
      arrangement = layout.arrange();

  test.ok(arrangement[0].x === 0 && arrangement[1].x === 10);

  arrangement = layout.distributeOn(function(d){ return d.x1; }).arrange();
  test.ok(arrangement[0].x === 5 && arrangement[1].x === 15);
  test.end();
});
