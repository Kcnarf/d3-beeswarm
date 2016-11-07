var tape = require("tape"),
    SDADLL = require("../build/sortedDirectAccessDoublyLinkedList");



tape("SDADLL.add() should allow chaining", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1};
  test.ok(sdadll.add(datum0) === sdadll);
  test.end();
});

tape("SDADLL.add() should build doubly-linked nodes depending on valueAccessor", function(test) {
  var sdadll0 = new SDADLL(),
      sdadll1 = new SDADLL().valueAccessor(function(obj){ return 10*obj.value; }),
      datum0 = {id: 0, value: -1};
  sdadll0.add(datum0);
  test.ok(sdadll0.dln(datum0).value === -1);
  sdadll1.add(datum0);
  test.ok(sdadll1.dln(datum0).value === -10);
  test.end();
});

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
  test.ok(sdadll.min().datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll.min().datum === datum0);
  sdadll.add(datum2);
  test.ok(sdadll.min().datum === datum2);
  test.end();
});

tape("SDADLL.add() should maintain max", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1},
      datum1 = {id: 1, value: -2},
      datum2 = {id: 2, value: 2};
  sdadll.add(datum0);
  test.ok(sdadll.max().datum === datum0);
  sdadll.add(datum1);
  test.ok(sdadll.max().datum === datum0);
  sdadll.add(datum2);
  test.ok(sdadll.max().datum === datum2);
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


tape("SDADLL.addMany() should allow chaining", function(test) {
  var sdadll = new SDADLL();
  test.ok(sdadll.addMany([]) === sdadll);
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


tape("SDADLL.dln() should depends on idAccessor", function(test) {
  var sdadll0 = new SDADLL(),
      sdadll1 = new SDADLL().idAccessor(function(obj){ return "id_"+obj.id; }),
      datum0 = {id: 0, value: -1};
  sdadll0.add(datum0);
  test.ok(sdadll0.dln(datum0).datum === datum0);
  sdadll1.add(datum0);
  test.ok(sdadll1.dln(datum0).datum === datum0);
  test.end();
});


tape("SDADLL.empty() should allow chaining", function(test) {
  var sdadll = new SDADLL();
  test.ok(sdadll.empty() === sdadll);
  test.end();
});

tape("SDADLL.empty() should empty doubly-linked nodes", function(test) {
  var sdadll = new SDADLL();
  sdadll.addMany([{id: 0, value: 0}, {id: 1, value: 1}]);
  test.ok(sdadll.size === 2);
  sdadll.empty();
  test.ok(sdadll.size === 0);
  test.ok(sdadll.min() === null);
  test.ok(sdadll.max() === null);
  test.ok(sdadll._closestTo0 === null);
  test.looseEqual(sdadll._idToNode, {});
  test.end();
});

tape("SDADLL.empty() should maintain valueAccessor", function(test) {
  var sdadll = new SDADLL(),
      va = sdadll.valueAccessor();
  test.ok(sdadll.empty().valueAccessor() === va);
  test.end();
});

tape("SDADLL.empty() should maintain idAccessor", function(test) {
  var sdadll = new SDADLL(),
      ia = sdadll.idAccessor();
  test.ok(sdadll.empty().idAccessor() === ia);
  test.end();
});


tape("SDADLL.remove() should allow chaining", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1};
  test.ok(sdadll.add(datum0).remove(datum0) === sdadll);
  test.end();
});

tape("SDADLL.remove() should maintain size", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 0},
      datum1 = {id: 1, value: 1};
  sdadll.addMany([datum0, datum1]);
  sdadll.remove(datum0);
  test.ok(sdadll.size === 1);
  sdadll.remove(datum1);
  test.ok(sdadll.size === 0);
  test.end();
});

tape("SDADLL.add() should maintain closestTo0", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.addMany([datum0, datum1, datum2, datum3]);
  sdadll.remove(datum3);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.remove(datum2);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.remove(datum1);
  test.ok(sdadll.closestTo0().datum === datum0);
  sdadll.remove(datum0);
  test.ok(sdadll.closestTo0() === null);
  test.end();
});

tape("SDADLL.add() should maintain min", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.addMany([datum0, datum1, datum2, datum3]);
  sdadll.remove(datum3);
  test.ok(sdadll.min().datum === datum2);
  sdadll.remove(datum2);
  test.ok(sdadll.min().datum === datum0);
  sdadll.remove(datum1);
  test.ok(sdadll.min().datum === datum0);
  sdadll.remove(datum0);
  test.ok(sdadll.min() === null);
  test.end();
});

tape("SDADLL.add() should maintain max", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.addMany([datum0, datum1, datum2, datum3]);
  sdadll.remove(datum3);
  test.ok(sdadll.max().datum === datum1);
  sdadll.remove(datum2);
  test.ok(sdadll.max().datum === datum1);
  sdadll.remove(datum1);
  test.ok(sdadll.max().datum === datum0);
  sdadll.remove(datum0);
  test.ok(sdadll.max() === null);
  test.end();
});

tape("SDADLL.remove() should maintain direct accesses", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: -1},
      datum1 = {id: 1, value: -2},
      datum2 = {id: 2, value: -3};
  sdadll.addMany([datum0, datum1, datum2]);
  sdadll.remove(datum2);
  test.ok(sdadll.dln(datum0).datum === datum0 &&
          sdadll.dln(datum1).datum === datum1);
  sdadll.remove(datum1);
  test.ok(sdadll.dln(datum0).datum === datum0);
  test.end();
});

tape("SDADLL.remove() should maintain sort", function(test) {
  var sdadll = new SDADLL(),
      datum0 = {id: 0, value: 1},
      datum1 = {id: 1, value: 2},
      datum2 = {id: 2, value: -2},
      datum3 = {id: 3, value: 0};
  sdadll.addMany([datum0, datum1, datum2, datum3]);
  sdadll.remove(datum3);
  test.ok(sdadll.dln(datum0).prev === sdadll.dln(datum2) &&
          sdadll.dln(datum2).next === sdadll.dln(datum0));
  sdadll.remove(datum2);
  test.ok(sdadll.dln(datum0).prev === null);
  sdadll.remove(datum1);
  test.ok(sdadll.dln(datum0).next === null);
  test.end();
});
