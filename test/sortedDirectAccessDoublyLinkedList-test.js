var tape = require("tape"),
    SDADLL = require("../build/sortedDirectAccessDoublyLinkedList");


tape("SDADLL.add() should maintain size", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 0},
      datum1 = {id: 1, value: 1};
  sdadll.add(datum0);
  test.ok(sdadll.size === 1);
  sdadll.add(datum1);
  test.ok(sdadll.size === 2);
  test.end();
});

tape("SDADLL.add() should maintain closestTo0", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.add(datum0);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.add(datum2);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.add(datum3);
  test.ok(sdadll.closestTo0().datum === datum3);
  test.end();
});

tape("SDADLL.add() should maintain min", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2};
  sdadll.add(datum0);
  test.ok(sdadll._min.datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll._min.datum === datum0);
  sdadll.add(datum2);
  test.ok(sdadll._min.datum === datum2);
  test.end();
});

tape("SDADLL.add() should maintain max", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1},
      datum1 = {id: 1, value: -2},
      datum2 = {id: 2, value: 2};
  sdadll.add(datum0);
  test.ok(sdadll._max.datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll._max.datum === datum0);
  sdadll.add(datum2);
  test.ok(sdadll._max.datum === datum2);
  test.end();
});

tape("SDADLL.add() should maintain direct accesses", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1},
      datum1 = {id: 1, value: -2};
  sdadll.add(datum0);
  test.ok(sdadll.dln(datum0).datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll.dln(datum0).datum === datum0 &&
          sdadll.dln(datum1).datum === datum1);
  test.end();
});

tape("SDADLL.add() should maintain sort", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.add(datum0);
  sdadll.add(datum1);
  test.ok(sdadll.dln(datum0).next === sdadll.dln(datum1) &&
          sdadll.dln(datum1).prev === sdadll.dln(datum0));
  sdadll.add(datum2);
  test.ok(sdadll.dln(datum0).prev === sdadll.dln(datum2) &&
          sdadll.dln(datum2).next === sdadll.dln(datum0));
  sdadll.add(datum3);
  test.ok(sdadll.dln(datum0).prev === sdadll.dln(datum3) &&
          sdadll.dln(datum3).next === sdadll.dln(datum0) &&
          sdadll.dln(datum2).next === sdadll.dln(datum3) &&
          sdadll.dln(datum3).prev === sdadll.dln(datum2));
  test.end();
});

tape("SDADLL.add() should allow chaining", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1};
  test.ok(sdadll.add(datum0) === sdadll);
  test.end();
});

tape("SDADLL.addMany() should add() each datum", function(test) {
  var sdadll = new SDADLL(),
      data0 = [{id: 0, value: 0}, {id: 1, value: 1}],
      data1 = [{id: 2, value: 2}],
      data2 = [];
  sdadll.addMany(data0);
  test.ok(sdadll.size === 2);
  sdadll.addMany(data1);
  test.ok(sdadll.size === 3);
  sdadll.addMany(data2);
  test.ok(sdadll.size === 3);
  test.end();
});

tape("SDADLL.addMany() should allow chaining", function(test) {
  var sdadll = new SDADLL();
  test.ok(sdadll.addMany([]) === sdadll);
  test.end();
});
