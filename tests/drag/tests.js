QUnit.config.reorder = false;

var defaults = null, _divs = [], support, _jsPlumb;

/**
 * Tests for dragging
 * @param _jsPlumb
 */

var testSuite = function () {

    var _detachThisConnection = function(c) {
        var idx = c.endpoints[1].connections.indexOf(c);
        support.detachConnection(c.endpoints[1], idx);
    };

    module("Drag", {
        teardown: function () {
            support.cleanup();
        },
        setup: function () {
            _jsPlumb = jsPlumb.newInstance(({container:container}));
            support = jsPlumbTestSupport.getInstance(_jsPlumb);
            defaults = jsPlumb.extend({}, _jsPlumb.Defaults);

            var epElCount = document.querySelectorAll(".jtk-endpoint").length,
                connElCount = document.querySelectorAll(".jtk-connector").length;

            if (epElCount > 0) {
                throw "there are " + epElCount + " endpoints already in the dom!";
            }
            //
            if (connElCount > 0) {
                throw "there are " + connElCount + " connections already in the dom!";
            }
        }
    });

    // setup the container

    test("sanity", function() {
        equal(1,1);
    });


    /**
     * Tests endpoint mouse interaction via event triggering: the ability to drag a connection to another
     * endpoint, what happens when it is full, if it is disabled etc.
     * @method jsPlumb.Test.EndpointEventTriggering
     */
    test("connections via mouse between Endpoints configured with addEndpoint", function() {
        var d1 = support.addDiv("d1", null, null, 50, 50, 50, 50), d2 = support.addDiv("d2", null, null, 250, 250, 50, 50),
            e1 = _jsPlumb.addEndpoint(d1, {isSource:true, isTarget:true, anchor:"Top"}),
            e2 = _jsPlumb.addEndpoint(d2, {isSource:true, isTarget:true, anchor:"Top"});

        equal(_jsPlumb.select().length, 0, "zero connections before drag");
        support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 1, "one connection after drag");

        _jsPlumb.select().delete();
        equal(_jsPlumb.select().length, 0, "zero connections after detach");
        equal(e2.connections.length, 0, "zero connections on endpoint 2 after connection removed");

        // now disable e1 and try to drag a new connection: it should fail
        e1.setEnabled(false);
        support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 0, "zero connections after drag from disabled endpoint");

        e1.setEnabled(true);
        support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 1, "one connection after drag from enabled endpoint");

         ok(e1.isFull(), "endpoint 1 is full");

        /*

        // why does this fail spectacularly? in the draggable connections demo it doesnt fail at all - connections are detached,
        // no problem. in this test we see all sorts of js errors.

         support.dragConnection(e1, e2);
         equal(_jsPlumb.select().length, 1, "one connection after drag from endpoint that is full");

         */


        support.detachConnection(e1, 0);
        equal(_jsPlumb.select().length, 0, "zero connections after detach");
    });

    test("connections via mouse between elements configured with makeSource/makeTarget", function() {

        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource("d1");
        _jsPlumb.makeSource("d4");
        _jsPlumb.makeTarget("d2");
        _jsPlumb.makeTarget("d3");

        _jsPlumb.Defaults.maxConnections = -1;

        equal(_jsPlumb.select().length, 0, "zero connections before drag");
        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "one connection after drag from source to target");

        equal(document.querySelectorAll(".jtk-endpoint").length, 2, "two endpoints in the DOM (the drag one was cleared up)");

        var cd1d2 = _jsPlumb.select().get(0);
        equal(cd1d2.source.id, "d1", "source of first connection is correct");
        equal(cd1d2.target.id, "d2", "target of first connection is correct");

        // support.dragConnection(d1, d3);
        // equal(_jsPlumb.select().length, 2, "two connections after drag from source to target");
        // equal(document.querySelectorAll(".jtk-endpoint").length, 4, "four endpoints in the DOM (the second drag one was cleared up)");
        //
        // var cd1d3 = _jsPlumb.select().get(1);
        // equal(cd1d3.source.id, "d1", "source of second connection is correct");
        // equal(cd1d3.target.id, "d3", "target of second connection is correct");
        //
        // // now we will drag the connection from d1-d2 by its target endpoint and put it on d3.
        // support.relocateTarget(cd1d2, d3);
        // equal(cd1d2.target.id, "d3", "target of first connection has changed to d3");
        // equal(_jsPlumb.select().length, 2, "two connections after relocate");
        // equal(document.querySelectorAll(".jtk-endpoint").length, 4, "four endpoints in the DOM (the drag one for relocate was cleared up)");
        //
        // support.dragConnection(d3, d1);
        // equal(_jsPlumb.select().length, 2, "two connections after failed drag from target to source (d3 is a target and not a source)");
        // equal(document.querySelectorAll(".jtk-endpoint").length, 4, "still four endpoints in the DOM after connection we rejected");
        //
        // // move d3 off of d1, it's overlapping right now and that's messing up the test
        //
        // support.dragANodeAround(d3);
        //
        // // now drag the source of d1-d2 to be d4.
        // support.relocateSource(cd1d2, d4);
        // equal(cd1d2.source.id, "d4", "source of first connection has changed to d4");
        // equal(_jsPlumb.select().length, 2, "two connections after relocate");

    });


    // https://github.com/jsplumb/jsPlumb/issues/415
    test("issue 415: spurious endpoints after dragging", function() {

        

        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource([ "d1", "d2", "d3", "d4" ], {
            maxConnections:-1
        });
        _jsPlumb.makeTarget([ "d1", "d2", "d3", "d4" ], {
            maxConnections:-1
        });

        ok(_jsPlumb.isSource(d4), "d4 is a connection source");
        ok(_jsPlumb.isTarget(d4), "d4 is a connection target");

        var d1d2 = support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "one connection after drag");

        var d2d3 = support.dragConnection(d2, d3);
        equal(_jsPlumb.select().length, 2, "two connections after drag");

        equal(_jsPlumb.selectEndpoints().length, 4, "four endpoints before relocations");

        support.relocateTarget(d1d2, d4);
        equal(d1d2.target.id, "d4", "target of first connection has changed to d4");

        equal(_jsPlumb.select().length, 2, "two connections after relocations");
        equal(_jsPlumb.selectEndpoints().length, 4, "four endpoints after relocations");

        support.relocateSource(d2d3, d4);

        equal(d2d3.source.id, "d4", "source of second connection has changed to d4");
        equal(_jsPlumb.select().length, 2, "two connections after relocations");
        equal(_jsPlumb.selectEndpoints().length, 4, "four endpoints after relocations");

    });

    test("drag connection so it turns into a self-loop. ensure endpoints registered correctly. target not continuous anchor so not hidden (issue 419)", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource([ "d1", "d2", "d3", "d4" ], { maxConnections: -1 });
        _jsPlumb.makeTarget([ "d1", "d2", "d3", "d4" ], { maxConnections: -1 });

        

        ok(_jsPlumb.isSource(d1), "d1 is a connection source");
        ok(_jsPlumb.isTarget(d2), "d2 is a connection target");

        // as a test: connect d3 to itself. 2 endpoints?
        var d3d3 = support.dragConnection(d3, d3);
        equal(_jsPlumb.selectEndpoints().length, 2, "two endpoints");

        var d2d1 = support.dragConnection(d2, d1);
        equal(_jsPlumb.select().length, 2, "one connection after drag");

        support.relocateSource(d2d1, d1);
        equal(d2d1.endpoints[0].elementId, "d1", "source endpoint is on d1 now");
        equal(_jsPlumb.selectEndpoints().length, 4, "four endpoints after relocations");

        support.relocateSource(d2d1, d2);
        equal(d2d1.endpoints[0].elementId, "d2", "source endpoint is on d2 now");
        ok(support.getEndpointCanvas(d2d1.endpoints[1]).parentNode != null, "target canvas put back into DOM");
    });

    test("drag connection so it turns into a self-loop. ensure endpoints registered correctly. target is continuous anchor so is hidden. (issue 419)", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource([ "d1", "d2", "d3", "d4" ], { maxConnections: -1, anchor:"Continuous" });
        _jsPlumb.makeTarget([ "d1", "d2", "d3", "d4" ], { maxConnections: -1, anchor:"Continuous" });

        

        var d2d1 = support.dragConnection(d2, d1);
        equal(_jsPlumb.select().length, 1, "one connection after drag");

        support.relocateSource(d2d1, d1);
        equal(d2d1.endpoints[0].elementId, "d1", "source endpoint is on d1 now");
        // NOTE in this test we are not using Continuous anchors so we do not expect the target to have been
        // removed. the next test uses Continuous anchors and it checks the target has been removed.
        //ok(d2d1.endpoints[1].canvas.parentNode == null, "target canvas removed from DOM");

        support.relocateSource(d2d1, d2);
        equal(d2d1.endpoints[0].elementId, "d2", "source endpoint is on d2 now");
        ok(support.getEndpointCanvas(d2d1.endpoints[1]).parentNode != null, "target canvas put back into DOM");
    });


    test("endpoint:connectionsDetachable mouse interaction", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
            e1 = _jsPlumb.addEndpoint(d1, {
                isSource:true, isTarget:true,
                connectionsDetachable:false
            }),
            e2 = _jsPlumb.addEndpoint(d2, {isSource:true, isTarget:true});

        

        equal(_jsPlumb.select().length, 0, "zero connections before drag");
        support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 1, "one connection after drag");

        support.detachConnection(e1, 0);
        equal(_jsPlumb.select().length, 1, "one connection still after attempted detach");
    });

    test("connection:detachable false, mouse interaction", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
            e1 = _jsPlumb.addEndpoint(d1),
            e2 = _jsPlumb.addEndpoint(d2);

        

        equal(_jsPlumb.select().length, 0, "zero connections before connect");
        _jsPlumb.connect({source:e1, target:e2, detachable:false});
        equal(_jsPlumb.select().length, 1, "one connection after connect");
        support.detachConnection(e1, 0);
        equal(_jsPlumb.select().length, 1, "one connection still after attempted detach");
    });

    test("connection:detachable true by default, mouse interaction", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
            e1 = _jsPlumb.addEndpoint(d1),
            e2 = _jsPlumb.addEndpoint(d2);

        

        equal(_jsPlumb.select().length, 0, "zero connections before connect");
        _jsPlumb.connect({source:e1, target:e2});
        equal(_jsPlumb.select().length, 1, "one connection after connect");
        support.detachConnection(e1, 0);
        equal(_jsPlumb.select().length, 0, "zero connections after detach");
    });

    test("connectionDetached event is fired when no beforeDrop is active", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
        var e1 = _jsPlumb.addEndpoint(d1, {
            isTarget:true
        });
        var e2 = _jsPlumb.addEndpoint(d2, {isSource:true});
        var evt = false, originalEvent, evtCount = 0;
        _jsPlumb.bind('connectionDetached', function (info, oevt) {
            evt = true;
            originalEvent = oevt;
            evtCount++;
        });

        support.dragConnection(e2, e1);
        equal(e1.connections.length, 1, "one connection");

        support.detachConnection(e1, 0);

        equal(e1.connections.length, 0, "no connections");
        ok(evt == true, "event was fired");
        equal(evtCount, 1, "event was fired once only");
        ok(originalEvent != null, "original event was provided in event callback");
    });

    test("beforeDrop returning false prevents connectionDetached event", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
        var e1 = _jsPlumb.addEndpoint(d1, {
            beforeDrop:function() {
                return false;
            },
            isTarget:true
        });
        var e2 = _jsPlumb.addEndpoint(d2, {isSource:true});
        var evt = false, abortEvent = false;
        _jsPlumb.bind('connectionDetached', function (info) {
            evt = true;
        });
        _jsPlumb.bind('connectionAborted', function (info) {
            abortEvent = true;
        });

        

        support.dragConnection(e2, e1);
        ok(evt == false, "event was not fired");
        equal(e1.connections.length, 0, "no connections");
        ok(abortEvent == true, "connectionAborted event was fired");
    });

    test("connectionAborted event", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");

        var e2 = _jsPlumb.addEndpoint(d2, {isSource:true});
        var evt = false, abortEvent = false;
        _jsPlumb.bind('connectionDetached', function (info) {
            evt = true;
        });
        _jsPlumb.bind('connectionAborted', function (info) {
            abortEvent = true;
        });

        

        support.dragAndAbortConnection(e2);
        ok(evt == false, "connectionDetached event was not fired");
        equal(e2.connections.length, 0, "no connections");
        ok(abortEvent == true, "connectionAborted event was fired");
    });

    test("endpoint: suspendedElement set correctly", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"),
            e1 = _jsPlumb.addEndpoint(d1, { isSource:true, isTarget:true }),
            e2 = _jsPlumb.addEndpoint(d2, {isSource:true, isTarget:true}),
            e3 = _jsPlumb.addEndpoint(d3, {isSource:true, isTarget:true});

        equal(_jsPlumb.select().length, 0, "zero connections before drag");
        var c = support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 1, "one connection after drag");

        

        support.relocateTarget(c, e3, {
            beforeMouseUp:function() {
                equal(c.suspendedElement, d2, "suspended element is set");
                equal(c.suspendedEndpoint, e2, "suspended endpoint is set");
            },
            after :function() {
                equal(c.suspendedElement, null, "suspended element is cleared");
                equal(c.suspendedEndpoint, null, "suspended endpoint is cleared");
            }
        });
    });

    /*

     // future state.

     test("beforeDrop fired before onMaxConnections", function() {
     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
     var bd = false;
     var e1 = _jsPlumb.addEndpoint(d1, {
     beforeDrop:function() {
     bd = true;
     return true;
     },
     isTarget:true,
     onMaxConnections:function() {
     ok(bd === true, "beforeDrop was called before onMaxConnections");
     }
     });
     var e2 = _jsPlumb.addEndpoint(d2, {isSource:true, maxConnections:-1});
     support.dragConnection(e2, e1);
     equal(e1.connections.length, 1, "one connection");
     equal(bd, true, "beforeDrop was called");
     bd = false;
     support.dragConnection(e2, e1);
     equal(e1.connections.length, 1, "one connection");
     });
     */

    test("drag connection between two endpoints", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
        var e1 = _jsPlumb.addEndpoint(d1, { isTarget:true, maxConnections:-1 });
        var e2 = _jsPlumb.addEndpoint(d2, {isSource:true, maxConnections:-1 });

        

        var c1 = _jsPlumb.connect({source:e2, target:e1});
        equal(e1.connections.length, 1, "one conn now");

        var c2 = support.dragConnection(e2, e1);
        equal(e1.connections.length, 2, "two conns now");
    });

    test("drag connection between two endpoints but endpoints are full", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
            d3 = support.addDiv("d3");

        

        var e1 = _jsPlumb.addEndpoint(d1, { isTarget:true });
        var e2 = _jsPlumb.addEndpoint(d2, { isSource:true });
        var e3 = _jsPlumb.addEndpoint(d3, { isSource:true });

        var c1 = _jsPlumb.connect({source:e2, target:e1});
        equal(e1.connections.length, 1, "one conn now");

        var c2 = support.dragConnection(e3, e1);
        equal(e1.connections.length, 1, "one conn now");
    });

    /*
     test("endpoint:connectionSourceDetachable false, mouse interaction", function() {
     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
     e1 = _jsPlumb.addEndpoint(d1, {connectionSourceDetachable:false, maxConnections:-1}),
     e2 = _jsPlumb.addEndpoint(d2, {maxConnections:-1});

     equal(_jsPlumb.select().length, 0, "zero connections before connect");
     _jsPlumb.connect({source:e1, target:e2});
     equal(_jsPlumb.select().length, 1, "one connection after connect");

     support.detachConnection(e1, 0);
     equal(_jsPlumb.select().length, 1, "one connection still after attempted detach of connection source");

     _jsPlumb.connect({source:e2, target:e1});
     equal(_jsPlumb.select().length, 2, "two connections after connect");
     support.detachConnection(e1, 1);
     equal(_jsPlumb.select().length, 1, "one connection after successful target detach");
     });*/

    test("endpoint:beforeDetach listener via mouse interaction", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), r = 0, s = 0, bd = 0,
            e1 = _jsPlumb.addEndpoint(d1, {
                isSource:true, isTarget:true

            }),
            e2 = _jsPlumb.addEndpoint(d2, {isSource:true, isTarget:true});

        

        _jsPlumb.bind("beforeDetach", function() {
            r = true;
            return true;
        });

        _jsPlumb.bind("beforeDrag", function() {
            bd++;
            return true;
        });

        _jsPlumb.bind("beforeStartDetach", function() {
            s = true;
            return true;
        });

        equal(_jsPlumb.select().length, 0, "zero connections before drag");
        support.dragConnection(e1, e2);
        equal(_jsPlumb.select().length, 1, "one connection after drag");


        support.detachConnection(e1, 0);
        equal(_jsPlumb.select().length, 0, "connection detached");

        equal(bd, 1, "beforeDrag called once");
        equal(r, 1, "beforeDetach interceptor called once");
        equal(s, 1, "beforeStartDetach interceptor called once");

    });

    test("connection dragging, simple drag and detach case", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        _detachThisConnection(c);
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse detach");
        equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse detach");
      //  equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
        equal(_jsPlumb.select().length, 0, "0 connections in jsplumb instance.");

    });

    /**
     * Tests the `extract` parameter on a `makeSource` call: extract provides a map of attribute names that you want to
     * read fom the source element when a drag starts, and whose values end up in the connection's data, keyed by the
     * value from the extract map. In this test we get the attribute `foo` and insert its value into the connection's
     * data, keyed as `fooAttribute`.
     */
    test("connection dragging, extractor atts defined on source", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        
        d1.setAttribute("foo", "the value of foo");
        _jsPlumb.makeSource([d1, d2, d3], {
            extract:{
                "foo":"fooAttribute"
            }
        });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var con = support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        equal(con.getData().fooAttribute, "the value of foo", "attribute values extracted properly");
    });

    test("connection dragging, simple drag and detach case, beforeDetach interceptor says no.", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        
        _jsPlumb.bind("beforeDetach", function() { return false; });
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        _detachThisConnection(c);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "still 1 connection registered for d1 after attempted mouse detach");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "still 1 connection registered for d2 after attempted mouse detach");
        //equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");

    });

    test("connection dragging, simple drag and detach case, reattach=true on connection prevents detach.", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);
        c.setReattach(true);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        _detachThisConnection(c);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "still 1 connection registered for d1 after attempted mouse detach");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "still 1 connection registered for d2 after attempted mouse detach");
        //equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");

    });

    test("connection dragging, simple move target case", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateTarget(c, d3);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 1, "1 connection registered for d3 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");

        //alert("ensure continuous anchor endpoint cleaned up in this case (simple target move)");
    });

    // DRAG SOURCE TO ANOTHER SOURCE
    test("connection dragging, simple move source case", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d3);
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 2, "two endpoints; there is one connection");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
        equal(_jsPlumb.select({source:"d3"}).length, 1, "1 connection registered for d3 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");

    });

    test("connection dragging, simple move source case, continuous anchors", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.importDefaults({anchor:"Continuous"});
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d3);
        equal(_jsPlumb.selectEndpoints().length, 2, "two endpoints; there is one connection");
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
        equal(_jsPlumb.select({source:"d3"}).length, 1, "1 connection registered for d3 after mouse move");
      //  equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");

    });

    test("connection dragging, simple move target case, beforeDetach aborts the move (and causes the connection to be reattached)", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.bind("beforeDetach", function() { return false; });
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateTarget(c, d3);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connections registered for d1 after aborted mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connections registered for d2 after aborted mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after aborted mouse move");
      //  equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    // test("connection dragging, simple move target case, beforeDetach aborts the move, yes reattach", function() {
    //     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
    //     _jsPlumb.bind("beforeDetach", function() { return false; });
    //     _jsPlumb.makeSource([d1, d2, d3], { reattachConnections:false });
    //     _jsPlumb.makeTarget([d1, d2, d3], { });
    //
    //     var c = _jsPlumb.connect({source: d1, target: d2});
    //     equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
    //     equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");
    //
    //     support.relocateTarget(c, d3);
    //     equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connections registered for d1 after aborted mouse move");
    //     equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connections registered for d2 after aborted mouse move");
    //     equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after aborted mouse move");
    //     equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    // });

    test("connection dragging, simple move source case, beforeDetach aborts the move", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.bind("beforeDetach", function() { return false; });
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d3);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after aborted mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after aborted mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after aborted mouse move");
    });

    test("connection dragging, simple move case, connection reattach=true aborts the move", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        c.setReattach(true);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        _detachThisConnection(c);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after aborted mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after aborted mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after aborted mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    // DRAG TARGET and redrop on original
    test("connection dragging, redrop on original target", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateTarget(c, d2);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    // DRAG SOURCE AND REDROP ON ORIGINAL
    test("connection dragging, redrop on original source", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d1);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse move");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });


    // DRAG SOURCE TO AN ELEMENT NOT CONFIGURED AS SOURCE (SHOULD DETACH)
    test("connection dragging, move source to element not configured as drag source", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3, d4], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d4);
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 0, "zero endpoints; there are no connections");
        equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    // DRAG SOURCE TO AN ELEMENT NO CONFIGURED AS SOURCE BUT DETACH DISABLED (SHOULDNT CARE)
    test("connection dragging, move source to element not configured as drag source, beforeDetach cancels connection", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.bind("beforeDetach", function() { return false; });
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3, d4], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d4);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 2, "2 endpoints; there is 1 connection");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
        equal(_jsPlumb.select({source:"d4"}).length, 0, "0 connection registered for d4 after mouse move");
    });

    // DRAG SOURCE TO ELEMENT NOT CONFIGURED AS SOURCE BUT BEFORE DROP SAYS NO SO ITS IRRELEVANT
    test("connection dragging, move source to element not configured as drag source, beforeDrop cancels connection", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.bind("beforedrop", function() { return false; });
        _jsPlumb.makeSource([d1, d2, d3], { });
        _jsPlumb.makeTarget([d1, d2, d3, d4], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateSource(c, d4);
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 0, "0 endpoints; there are no connections");
        equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse move");
        equal(_jsPlumb.select({source:"d4"}).length, 0, "0 connections registered for d4 after mouse move");
    });

    // DRAG TARGET TO ANOTHER SOURCE (BUT NOT A TARGET); SHOULD DETACH
    test("connection dragging, move target to element not configured as drag target", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.makeSource([d1, d2, d3, d4], { });
        _jsPlumb.makeTarget([d1, d2, d3], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        equal(_jsPlumb.selectEndpoints().length, 2, "two endpoints found after connection established");

        support.relocateTarget(c, d4);
        equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 in anchor manager after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 0, "zero endpoints found");
        equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse move");
        equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after mouse move");
       // equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });


    // DRAG TARGET TO ANOTHER SOURCE (BUT NOT A TARGET), BUT DETACH DISABLED. SHOULDNT CARE.
    test("connection dragging, move source to element not configured as drag source, beforeDetach cancels connection", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
        _jsPlumb.bind("beforeDetach", function() { return false; });
        _jsPlumb.makeSource([ d1, d2, d3, d4 ], { });
        _jsPlumb.makeTarget([ d1, d2, d3 ], { });

        var c = _jsPlumb.connect({source: d1, target: d2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateTarget(c, d4);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse move");
        equal(_jsPlumb.selectEndpoints().length, 2, "2 endpoints; there is 1 connection");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse move");
        equal(_jsPlumb.select({target:"d4"}).length, 0, "0 connection registered for d4 after mouse move");
      //  equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    /**
     * Tests that `endpoint` and `anchor` in a makeSource definition are honoured. The next test uses a connection type
     * but has the makeSource override the anchor.
     */
    test("connection dragging, makeSource sets source endpoint and anchor", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3], { endpoint:"Rectangle", anchor:"Left"});
        _jsPlumb.makeTarget([d1, d2, d3]);

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);

        equal(c.endpoints[0].endpoint.getType(), "Rectangle", "source endpoint is Rectangle");
        equal(c.endpoints[0].anchor.x, 0, "x=0 in anchor");
        equal(c.endpoints[0].anchor.y, 0.5, "y=0.5 in anchor");
        equal(c.endpoints[1].endpoint.getType(), _jsPlumb.Defaults.endpoint, "target endpoint is the default");
    });

    /**
     * Tests that makeSource, when given `endpoint` and/or `anchor` values, will override any that were derived
     * from an applied type.
     */
    test("connection dragging, makeSource overrides source endpoint and anchor", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.registerConnectionType("basic", {
            endpoint:"Dot",
            anchor:"Right"
        });
        _jsPlumb.makeSource(d1, { connectionType:"basic", endpoint:"Rectangle", anchor:"Left"});
        _jsPlumb.makeSource(d2, { connectionType:"basic"});
        _jsPlumb.makeTarget([d1, d2, d3]);

        support.dragConnection(d1, d3);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);

        support.dragConnection(d2, d3);
        equal(_jsPlumb.select().length, 2, "2 connections in jsplumb instance.");
        var c2 = _jsPlumb.select().get(1);

        equal(c.endpoints[0].endpoint.getType(), "Rectangle", "source endpoint was overridden to be Rectangle");
        equal(c.endpoints[0].anchor.x, 0, "x=0 in overridden anchor");
        equal(c.endpoints[0].anchor.y, 0.5, "y=0.5 in overridden anchor");

        equal(c2.endpoints[0].endpoint.getType(), "Dot", "source endpoint is Blank in endpoint derived from type");
        equal(c2.endpoints[0].anchor.x, 1, "x=1 in anchor derived from type");
        equal(c2.endpoints[0].anchor.y, 0.5, "y=0.5 in anchor derived from type");

    });

    /**
     * Tests that makeSource, when given `endpoint` and/or `anchor` values, will override any that were derived
     * from an applied type.
     */
    test("connection dragging, makeTarget overrides source endpoint and anchor", function() {

        equal(_jsPlumb.select().length, 0, "0 connections in jsplumb instance.");

        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.registerConnectionType("basic", {
            endpoint:"Dot",
            anchor:"Right"
        });
        _jsPlumb.makeSource(d1, { connectionType:"basic"});
        _jsPlumb.makeTarget(d2);
        _jsPlumb.makeTarget(d3, { endpoint:"Rectangle", anchor:"Left" });

        support.dragConnection(d1, d3);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 2, "2 connections in jsplumb instance.");
        var c2 = _jsPlumb.select().get(1);

        equal(c.endpoints[1].endpoint.getType(), "Rectangle", "target endpoint was overridden to be Rectangle");
        equal(c.endpoints[1].anchor.x, 0, "x=0 in overridden anchor");
        equal(c.endpoints[1].anchor.y, 0.5, "y=0.5 in overridden anchor");

        equal(c2.endpoints[1].endpoint.getType(), "Dot", "target endpoint is Dot in endpoint derived from type");
        equal(c2.endpoints[1].anchor.x, 1, "x=1 in anchor derived from type");
        equal(c2.endpoints[1].anchor.y, 0.5, "y=0.5 in anchor derived from type");

    });

    test("connection dragging, makeTarget overrides endpoint and anchor", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1, d2, d3]);
        _jsPlumb.makeTarget([d1, d2, d3], { endpoint:"Rectangle", anchor:"Top" });

        support.dragConnection(d1, d2);
        equal(_jsPlumb.select().length, 1, "1 connection in jsplumb instance.");
        var c = _jsPlumb.select().get(0);

        equal(c.endpoints[0].endpoint.getType(), _jsPlumb.Defaults.endpoint, "source endpoint is the default");
        equal(c.endpoints[1].anchor.x, 0.5, "x=0.5 in anchor");
        equal(c.endpoints[1].anchor.y, 0, "y=0 in anchor");
        equal(c.endpoints[1].endpoint.getType(), "Rectangle", "target endpoint is Rectangle");

    });


    // DETACH CONNECTION VIA SOURCE, DETACH ENABLED, ALLOWED
    // DETACH CONNECTION VIA SOURCE, DETACH DISABLED, DISALLOWED



    test("connection dragging", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        _jsPlumb.makeSource([d1,d2,d3], {
        });
        _jsPlumb.makeTarget([d1,d2,d3], {

        });
        /*
         var c = _jsPlumb.connect({source:d1, target:d2});
         equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after programmatic connect");
         equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after programmatic connect");

         _jsPlumb.detach(c);
         equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after programmatic detach");
         equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after programmatic detach");

         c = _jsPlumb.connect({source:d1, target:d2});
         equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect" );
         equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

         _detachThisConnection(c);
         equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse detach");
         equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse detach");
         equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");

         // reconnect, check
         support.dragConnection(d1, d2);
         equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
         equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");
         c = _jsPlumb.select().get(0);

         // move the target to d3, check
         support.relocateTarget(c, d3);
         equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse relocate");
         equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse relocate");
         equal(_jsPlumb.select({target:"d3"}).length, 1, "1 connection registered for d3 after mouse relocate");

         // toss it away again, check
         _detachThisConnection(c);
         equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after mouse detach");
         equal(_jsPlumb.select({target:"d2"}).length, 0, "0 connections registered for d2 after mouse detach");
         equal(_jsPlumb.select({target:"d3"}).length, 0, "0 connections registered for d3 after mouse detach");
         equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
         */
        // reconnect, check
        support.dragConnection(d1, d2);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");
        var c = _jsPlumb.select().get(0);
      //  equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse connect");
        equal(1, _jsPlumb.select().length, "1 connection");

        //support.relocateSource(c, d3);
        //equal(_jsPlumb.select({source:"d1"}).length, 0, "0 connections registered for d1 after source relocate");
        //equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after source relocate");
        //equal(_jsPlumb.select({target:"d3"}).length, 1, "1 connection registered for d3 after source relocate");
        //equal(_jsPlumb.select({source:c.floatingId}).length, 0, "0 connections registered for temporary drag element after mouse detach");
    });

    // test(': draggable in nested element does not cause extra ids to be created', function () {
    //     var d = support.addDiv("d1");
    //     var d2 = document.createElement("div");
    //     d2.setAttribute("foo", "ff");
    //     d.appendChild(d2);
    //     var d3 = document.createElement("div");
    //     d2.appendChild(d3);
    //     ok(d2.getAttribute("id") == null, "no id on d2");
    //     _jsPlumb.draggable(d);
    //     _jsPlumb.addEndpoint(d3);
    //     ok(d2.getAttribute("id") == null, "no id on d2");
    //     ok(d3.getAttribute("id") != null, "id on d3");
    // });
    //
    // test(" : draggable, reference elements returned correctly", function () {
    //     var d = support.addDiv("d1");
    //     var d2 = document.createElement("div");
    //     d2.setAttribute("foo", "ff");
    //     d.appendChild(d2);
    //     var d3 = document.createElement("div");
    //     d3.setAttribute("id", "d3");
    //     d2.appendChild(d3);
    //     _jsPlumb.draggable(d);
    //     _jsPlumb.addEndpoint(d3);
    //     _jsPlumb.draggable(d3);
    //     // now check ref ids for element d1
    //     var els = _jsPlumb.dragManager.getElementsForDraggable("d1");
    //     ok(!jsPlumbUtil.isEmpty(els), "there is one sub-element for d1");
    //     ok(els["d3"] != null, "d3 registered");
    // });
    //
    //
    // test(" : draggable + setParent, reference elements returned correctly", function () {
    //     var d = support.addDiv("d1");
    //     var d2 = document.createElement("div");
    //     d2.setAttribute("foo", "ff");
    //     d.appendChild(d2);
    //     var d3 = document.createElement("div");
    //     d3.setAttribute("id", "d3");
    //     d2.appendChild(d3);
    //     _jsPlumb.draggable(d);
    //     _jsPlumb.addEndpoint(d3);
    //     _jsPlumb.draggable(d3);
    //     // create some other new parent
    //     var d12 = support.addDiv("d12");
    //     // and move d3
    //     _jsPlumb.setParent(d3, d12);
    //
    //     // now check ref ids for element d1
    //     var els = _jsPlumb.dragManager.getElementsForDraggable("d1");
    //     ok(jsPlumbUtil.isEmpty(els), "there are no sub-elements for d1");
    //     var els12 = _jsPlumb.dragManager.getElementsForDraggable("d12");
    //     ok(!jsPlumbUtil.isEmpty(els12), "there is one sub-element for d12");
    //     ok(els12["d3"] != null, "d3 registered");
    // });

    test("drag multiple elements and ensure their connections are painted correctly at the end", function() {

        var d1 = support.addDraggableDiv ('d1', null, null,50, 50, 100, 100);
        var d2 = support.addDraggableDiv ('d2', null, null,250, 250, 100, 100);
        var d3 = support.addDraggableDiv ('d3', null, null,500, 500, 100, 100);

        var e1 = _jsPlumb.addEndpoint(d1, {
            anchor:"TopLeft"
        });
        var e2 = _jsPlumb.addEndpoint(d2, {
            anchor:"TopLeft",
            maxConnections:-1
        });
        var e3 = _jsPlumb.addEndpoint(d3, {
            anchor:"TopLeft"
        });

        _jsPlumb.connect({source:e1, target:e2});
        _jsPlumb.connect({source:e2, target:e3});

        var e1canvas = support.getEndpointCanvas(e1),
            e2canvas = support.getEndpointCanvas(e2),
            e3canvas = support.getEndpointCanvas(e3);

        equal(e1canvas.offsetLeft, 50 - (e1canvas.offsetWidth/2), "endpoint 1 is at the right place");
        equal(e1canvas.offsetTop, 50 - (e1canvas.offsetHeight/2), "endpoint 1 is at the right place");
        equal(e2canvas.offsetLeft, 250 - (e2canvas.offsetWidth/2), "endpoint 2 is at the right place");
        equal(e2canvas.offsetTop, 250 - (e2canvas.offsetHeight/2), "endpoint 2 is at the right place");
        equal(e3canvas.offsetLeft, 500 - (e3canvas.offsetWidth/2), "endpoint 3 is at the right place");
        equal(e3canvas.offsetTop, 500 - (e3canvas.offsetHeight/2), "endpoint 3 is at the right place");

        _jsPlumb.addToDragSelection("d1");
        _jsPlumb.addToDragSelection("d3");

        // drag node 2 by 750,750. we expect its endpoint to have moved too

        support.dragNodeTo(d2, 1000, 1000);

        equal(d2.offsetLeft, 1000, "div 2 is at the right left position");
        equal(d2.offsetTop, 1000, "div 2 is at the right top position");

        // TODO - drag selection
        // divs 1 and 3 have moved too, because they are in the drag selection make sure they are in the right place
        equal(d1.offsetLeft, 800, "div 1 is at the right left position");
        equal(d1.offsetTop, 800, "div 1 is at the right top position");
        equal(d3.offsetLeft, 1250, "div 3 is at the right left position");
        equal(d3.offsetTop, 1250, "div 3 is at the right top position");

        // check the endpoints
        equal(e2canvas.offsetLeft, 1000 - (e2canvas.offsetWidth/2), "endpoint 2 is at the right place");
        equal(e2canvas.offsetTop, 1000 - (e2canvas.offsetHeight/2), "endpoint 2 is at the right place");

        // TODO - drag selection
        // equal(e1.canvas.offsetLeft, 750 - (e1.canvas.offsetWidth/2), "endpoint 1 is at the right place");
        // equal(e1.canvas.offsetTop, 750 - (e1.canvas.offsetHeight/2), "endpoint 1 is at the right place");
        //
        // equal(e3.canvas.offsetLeft, 1200 - (e3.canvas.offsetWidth/2), "endpoint 3 is at the right place");
        // equal(e3.canvas.offsetTop, 1200 - (e3.canvas.offsetHeight/2), "endpoint 3 is at the right place");

    });

    test("drag selection, add/remove", function() {

        var d1 = support.addDraggableDiv('d1', null, null, 50, 50, 100, 100);
        var d2 = support.addDraggableDiv('d2', null, null, 250, 250, 100, 100);
        var d3 = support.addDraggableDiv('d3', null, null, 500, 500, 100, 100);

        equal(_jsPlumb.getDragSelection().length, 0, "drag selection is empty");

        _jsPlumb.addToDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection has one element");
        _jsPlumb.addToDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection still has one element");

        _jsPlumb.removeFromDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 0, "drag selection is now empty");

        _jsPlumb.addToDragSelection(d1, d2, d3);
        equal(_jsPlumb.getDragSelection().length, 3, "drag selection has three elements");

        _jsPlumb.removeFromDragSelection(d1, d2);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection has one element");

        _jsPlumb.removeFromDragSelection(d3);
        equal(_jsPlumb.getDragSelection().length, 0, "drag selection has no elements");

        _jsPlumb.addToDragSelection(d1, d2, d3);
        equal(_jsPlumb.getDragSelection().length, 3, "drag selection has three elements");

        _jsPlumb.clearDragSelection();
        equal(_jsPlumb.getDragSelection().length, 0, "drag selection has no elements");
    });

    test("drag selection, css classes", function() {

        var d1 = support.addDraggableDiv('d1', null, null, 50, 50, 100, 100);
        var d2 = support.addDraggableDiv('d2', null, null, 250, 250, 100, 100);
        var d3 = support.addDraggableDiv('d3', null, null, 500, 500, 100, 100);

        equal(_jsPlumb.getDragSelection().length, 0, "drag selection is empty");

        _jsPlumb.addToDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection has one element");

        ok(_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class added to element");

        _jsPlumb.clearDragSelection();
        ok(!_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class removed from element");
    });

    test("drag selection, unmanage event removes from selection", function() {

        var d1 = support.addDraggableDiv('d1', null, null, 50, 50, 100, 100);
        var d2 = support.addDraggableDiv('d2', null, null, 250, 250, 100, 100);
        var d3 = support.addDraggableDiv('d3', null, null, 500, 500, 100, 100);

        equal(_jsPlumb.getDragSelection().length, 0, "drag selection is empty");

        _jsPlumb.addToDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection has one element");
        ok(_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class added to element");

        _jsPlumb.unmanage(d1);
        ok(_jsPlumb.getDragSelection().length === 0, "drag selection empty");
        ok(!_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class removed from element");
    });

    test("drag selection, instance destroy clears selection", function() {

        var d1 = support.addDraggableDiv('d1', null, null, 50, 50, 100, 100);
        var d2 = support.addDraggableDiv('d2', null, null, 250, 250, 100, 100);
        var d3 = support.addDraggableDiv('d3', null, null, 500, 500, 100, 100);

        equal(_jsPlumb.getDragSelection().length, 0, "drag selection is empty");

        _jsPlumb.addToDragSelection(d1);
        equal(_jsPlumb.getDragSelection().length, 1, "drag selection has one element");
        ok(_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class added to element");

        _jsPlumb.destroy();

        ok(_jsPlumb.getDragSelection().length === 0, "drag selection empty");
        ok(!_jsPlumb.hasClass(d1, "jtk-drag-selected"), "selected class removed from element");
    });

    //
    // 3.0.0 has stopped supporting individual node drag events. We could re-introduce a form of this, but for now it
    // is not supported. This test, and the one below, commented pending some long term decision.
    //
    // test("node drag events", function() {
    //
    //     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
    //     var started = false, dragged = false, stopped = false;
    //
    //     _jsPlumb.draggable(d1, {
    //         start:function() { started = true; },
    //         drag:function() { dragged = true; },
    //         stop:function() { stopped = true; }
    //     });
    //
    //     support.dragANodeAround(d1, function() {
    //         return _jsPlumb.isConnectionBeingDragged()  && _jsPlumb.isHoverSuspended();
    //     }, "isConnectionBeingDragged and isHoverSuspended return true while node is being dragged");
    //
    //     ok(started, "start event fired");
    //     ok(dragged, "drag event fired");
    //     ok(stopped, "stop event fired");
    //
    //     started = false; dragged = false; stopped = false;
    //     var started2 = false, dragged2 = false, stopped2 = false;
    //
    //     _jsPlumb.draggable(d1, {
    //         start:function() { started2 = true; },
    //         drag:function() { dragged2 = true; },
    //         stop:function() { stopped2 = true; },
    //         force:true
    //     });
    //
    //     support.dragANodeAround(d1);
    //
    //     ok(started, "start event fired");
    //     ok(dragged, "drag event fired");
    //     ok(stopped, "stop event fired");
    //     ok(started2, "2nd start event fired");
    //     ok(dragged2, "2nd drag event fired");
    //     ok(stopped2, "2nd stop event fired");
    // });
    //
    // test("node drag events, drag disabled", function() {
    //
    //     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2");
    //     var started = false, dragged = false, stopped = false;
    //
    //     _jsPlumb.draggable(d1, {
    //         start:function() { started = true; },
    //         drag:function() { dragged = true; },
    //         stop:function() { stopped = true; },
    //         canDrag:function() { return false; }
    //     });
    //
    //     support.dragANodeAround(d1, function() {
    //         return !_jsPlumb.isConnectionBeingDragged() && !_jsPlumb.isHoverSuspended();
    //     }, "isConnectionBeingDragged returns false because node cannot be dragged");
    //
    //     ok(!started, "start event fired");
    //     ok(!dragged, "drag event fired");
    //     ok(!stopped, "stop event fired");
    //
    //
    // });

    // test("recalculateOffsets", function() {
    //     var d1 = support.addDiv("d1");
    //
    //     var d2 = support.addDiv("d2", d1);
    //     d2.style.left = "250px";
    //     d2.style.top = "120px";
    //
    //     var d3 = support.addDiv("d3", d1);
    //     d3.style.left = "150px";
    //     d3.style.top = "220px";
    //
    //     _jsPlumb.connect({source:d2, target:d3});
    //     _jsPlumb.manage(d1);
    //
    //     var o = _jsPlumb.getDragManager().getElementsForDraggable("d1")[0];
    //     equal(250, o.offsetLeft, "d2 is at left=250");
    //
    //     d2.style.left = "1250px";
    //     var o = _jsPlumb.getDragManager().getElementsForDraggable("d1")[0];
    //     equal(1250, o.offsetLeft, "d2 is at left=1250");
    //
    // });

    // -----------------issue 383, setDraggable doesnt work with list-like arguments

    // test("setDraggable with array", function() {
    //     var d1 = support.addDiv("d1", null, "aTest");
    //     var d2 = support.addDiv("d2", null, "aTest");
    //
    //     ok(!_jsPlumb.isAlreadyDraggable(d1), "d1 is not draggable");
    //     ok(!_jsPlumb.isAlreadyDraggable(d2), "d2 is not draggable");
    //     var d = document.getElementsByClassName("aTest");
    //
    //     // first make them draggable
    //     if(typeof d === "function") {
    //         expect(2);
    //     }
    //     else
    //     {
    //         _jsPlumb.draggable(d);
    //         ok(_jsPlumb.isElementDraggable(d1), "d1 is now draggable");
    //         ok(_jsPlumb.isElementDraggable(d2), "d2 is now draggable");
    //
    //         // now disable
    //         _jsPlumb.setDraggable(d, false);
    //         ok(!_jsPlumb.isElementDraggable(d1), "d1 is not draggable");
    //         ok(!_jsPlumb.isElementDraggable(d2), "d2 is not draggable");
    //
    //         // and enable
    //         _jsPlumb.toggleDraggable(d);
    //         ok(_jsPlumb.isElementDraggable(d1), "d1 is draggable after toggle ");
    //         ok(_jsPlumb.isElementDraggable(d2), "d2 is draggable after toggle");
    //     }
    // });

    // ----------------------- draggables and posses ----------------------------------------------------

    test("dragging works", function() {
        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";
        d.style.width = "100px";
        d.style.height = "100px";

         // should not be necessary
        _jsPlumb.manage(d);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class no longer set on element");
            }
        });

        equal(parseInt(d.style.left, 10), 150);
        equal(parseInt(d.style.top, 10), 150);
    });

    test("dragging does not happen with `jtk-not-draggable` attribute set", function() {
        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";
        d.style.width = "100px";
        d.style.height = "100px";
        d.setAttribute("jtk-not-draggable", true);

         // should not be necessary
        _jsPlumb.manage(d);

        equal(parseInt(d.style.left, 10), 50);
        equal(parseInt(d.style.top, 10), 50);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class not set on element during drag attempt");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class not set on element after drag attempt");
            }
        });

        equal(parseInt(d.style.left, 10), 50);
        equal(parseInt(d.style.top, 10), 50);
    });

    test("dragging does happen with `jtk-not-draggable='false'` attribute set", function() {
        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";
        d.style.width = "100px";
        d.style.height = "100px";
        d.setAttribute("jtk-not-draggable", "false");

         // should not be necessary
        _jsPlumb.manage(d);

        equal(parseInt(d.style.left, 10), 50);
        equal(parseInt(d.style.top, 10), 50);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element during drag");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class not set on element after drag");
            }
        });

        equal(parseInt(d.style.left, 10), 150);
        equal(parseInt(d.style.top, 10), 150);
    });

    //*
    test("dragging a posse works, elements as argument", function() {

        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";

        var d2 = support.addDiv("d2");
        d2.style.position = "absolute";
        d2.style.left = "450px";
        d2.style.top = "450px";

         // should not be necessary
        _jsPlumb.manage(d);
        _jsPlumb.manage(d2);

        _jsPlumb.addToPosse("posse", d, d2);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class no longer set on element");
            }
        });

        equal(150, parseInt(d.style.left, 10), "d has moved left by 100");
        equal(150, parseInt(d.style.top, 10), "d has moved top by 100");

        equal(550, parseInt(d2.style.left, 10), "d2 has moved left by 100");
        equal(550, parseInt(d2.style.top, 10), "d2 has moved top by 100");

        _jsPlumb.removeFromPosse(d2, "posse");
        support.dragNodeBy(d, -100, -100);

        equal(50, parseInt(d.style.left, 10));
        equal(50, parseInt(d.style.top, 10));

        equal(550, parseInt(d2.style.left, 10));
        equal(550, parseInt(d2.style.top, 10));
    });

    test("dragging a posse works, then set element passive, dragging disabled.", function() {

        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";

        var d2 = support.addDiv("d2");
        d2.style.position = "absolute";
        d2.style.left = "450px";
        d2.style.top = "450px";

        // should not be necessary
        _jsPlumb.manage(d);
        _jsPlumb.manage(d2);

        _jsPlumb.addToPosse("posse", d, d2);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class no longer set on element");
            }
        });

        equal(150, parseInt(d.style.left, 10), "d has moved left by 100");
        equal(150, parseInt(d.style.top, 10), "d has moved top by 100");

        equal(550, parseInt(d2.style.left, 10), "d2 has moved left by 100");
        equal(550, parseInt(d2.style.top, 10), "d2 has moved top by 100");

        _jsPlumb.setPosseState(false, d);
        support.dragNodeBy(d, 100, 100);
        equal(250, parseInt(d.style.left, 10), "d has moved further left by 100");
        equal(250, parseInt(d.style.top, 10), "d has moved further top by 100");

        equal(550, parseInt(d2.style.left, 10), "d2 has not moved this time");
        equal(550, parseInt(d2.style.top, 10), "d2 has not moved this time");

    });


    test("dragging a posse works, elements as argument", function() {
        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";

        var d2 = support.addDiv("d2");
        d2.style.position = "absolute";
        d2.style.left = "450px";
        d2.style.top = "450px";

        _jsPlumb.manage(d,d2);
        _jsPlumb.addToPosse("posse", d1, d2);

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class no longer set on element");
            }
        });

        equal(150, parseInt(d.style.left, 10));
        equal(150, parseInt(d.style.top, 10));

        equal(550, parseInt(d2.style.left, 10));
        equal(550, parseInt(d2.style.top, 10));


        _jsPlumb.removeFromPosse(d2, "posse");
        support.dragNodeBy(d, -100, -100);

        equal(50, parseInt(d.style.left, 10));
        equal(50, parseInt(d.style.top, 10));

        equal(550, parseInt(d2.style.left, 10));
        equal(550, parseInt(d2.style.top, 10));
    });

    test("connection dragging, redrop on original target endpoint", function() {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");
        var e1 = _jsPlumb.addEndpoint(d1, { isSource:true });
        var e2 = _jsPlumb.addEndpoint(d2, { isTarget:true });

        var c = _jsPlumb.connect({source: e1, target: e2});
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

        support.relocateTarget(c, e2);
        equal(_jsPlumb.select({source:"d1"}).length, 1, "1 connection registered for d1 after mouse connect");
        equal(_jsPlumb.select({target:"d2"}).length, 1, "1 connection registered for d2 after mouse connect");

    });


    // test("draggable function, the various ways in which it can be called", function() {
    //     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
    //
    //     _jsPlumb.draggable(d1); // by element
    //     _jsPlumb.draggable(["d2", d3]);
    //     _jsPlumb.draggable(document.querySelectorAll("#d4"));
    //
    //     ok(jsPlumb.hasClass(d1, "jtk-draggable"), "element registered as Element ok");
    //     ok(jsPlumb.hasClass(d2, "jtk-draggable", "elements registered as id in array ok"));
    //     ok(jsPlumb.hasClass(d3, "jtk-draggable", "elements registered as Element in array ok"));
    //     ok(jsPlumb.hasClass(d4, "jtk-draggable", "querySelectorAll output ok as input"));
    // });


    // test("droppable function, the various ways in which it can be called", function() {
    //     var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3"), d4 = support.addDiv("d4");
    //
    //     _jsPlumb.droppable(d1); // by element
    //     _jsPlumb.droppable(["d2", d3]);
    //     _jsPlumb.droppable(document.querySelectorAll("#d4"));
    //
    //     ok(jsPlumb.hasClass(d1, "jtk-droppable"), "element registered as Element ok");
    //     ok(jsPlumb.hasClass(d2, "jtk-droppable", "elements registered as id in array ok"));
    //     ok(jsPlumb.hasClass(d3, "jtk-droppable", "elements registered as Element in array ok"));
    //     ok(jsPlumb.hasClass(d4, "jtk-droppable", "querySelectorAll output ok as input"));
    // });

    test(" makeSource connection type is honoured, mouse connect", function () {
        var d1 = support.addDiv("d1"), d2 = support.addDiv("d2"), d3 = support.addDiv("d3");

        _jsPlumb.Defaults.paintStyle = {stroke: "blue", strokeWidth: 34};

        _jsPlumb.registerConnectionTypes({
            "basic": {
                connector: "Flowchart",
                paintStyle: { stroke: "yellow", strokeWidth: 4 },
                hoverPaintStyle: { stroke: "blue" },
                overlays: [
                    "Arrow"
                ],
                endpoint:"Rectangle"
            }
        });

        _jsPlumb.makeSource(d1, {
            connectionType:"basic"
        });

        _jsPlumb.makeTarget(d2, {
            endpoint:"Blank"
        });

        var c = support.dragConnection(d1, d2);
        c = _jsPlumb.select().get(0);
        equal(c.getPaintStyle().stroke, "yellow", "connection has basic type's stroke style");
        equal(c.getPaintStyle().strokeWidth, 4, "connection has basic type's strokeWidth");
        equal(c.endpoints[0].endpoint.getType(), "Rectangle", "source endpoint is of type rectangle");
        equal(c.endpoints[1].endpoint.getType(), "Blank", "target endpoint is of type Blank - it was overriden from the type's endpoint.");
    });

    test("endpoint passes scope to connection, connection via mouse", function() {
        var sourceEndpoint = {
                isSource: true,
                scope: "blue"
            }, targetEndpoint = {
                isTarget:true,
                scope:"blue"
            },
            d1 = support.addDiv("d1"), d2 = support.addDiv("d2"),
            e1 = _jsPlumb.addEndpoint(d1, sourceEndpoint),
            e2 = _jsPlumb.addEndpoint(d2, targetEndpoint);

        var c = support.dragConnection(e1, e2);

        equal(c.scope, "blue", "connection scope is blue.");
    });

    /* ------------------ node/group drag events --------------------------------------------------*/

    test("drag events", function() {
        var d = support.addDiv("d1");
        d.style.position = "absolute";
        d.style.left = "50px";
        d.style.top = "50px";
        d.style.width = "100px";
        d.style.height = "100px";

         // should not be necessary
        _jsPlumb.manage(d);

        var nodeDragged = null, pos = null, evt = null, dragStarted = false, dragStopped = false;
        _jsPlumb.bind("drag:move", function(p) {
            nodeDragged = p.el;
            pos = p.pos;
            evt = p.e;
        });
        _jsPlumb.bind("drag:start", function() { dragStarted = true; });
        _jsPlumb.bind("drag:stop", function() { dragStopped = true; });

        support.dragNodeBy(d, 100, 100, {
            beforeMouseUp:function() {
                ok(d.classList.contains("jtk-drag"), "drag class set on element");
            },
            after:function() {
                ok(!d.classList.contains("jtk-drag"), "drag class no longer set on element");
            }
        });

        equal(parseInt(d.style.left, 10), 150);
        equal(parseInt(d.style.top, 10), 150);

        // test event fired
        equal(150, pos.left, "event x position correct");
        equal(150, pos.top, "event y position correct");
        equal(d, nodeDragged, "event el correct");
        ok(evt != null, "event original event was supplied");
        ok(dragStarted, "drag start event was fired");
        ok(dragStopped, "drag stop event was fired");
    });

};
