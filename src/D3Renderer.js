(function () {
	function D3Renderer(graph, options) {
        if (!(graph instanceof sg.Graph)) {
            throw "the graph param is not sg.Graph";
        }

        if (options &&
            Object.prototype.toString.call(options) !== "[object Object]") {
            throw "the options parameter should be an object.";
        }

        if (options && options.width && typeof options.width !== "number") {
            throw "width should be a number";
        }

        if (options && options.height && typeof options.height !== "number") {
            throw "height should be a number";
        }

        if (options && options.markerSize && typeof options.markerSize !== "number") {
            throw "markerSize should be a number";
        }

        options = options || {};

        this.width      = options.width      || 500;
        this.height     = options.height     || 500;
        this.markerSize = options.markerSize || 10;

        this.graph  = graph;
        this._calculateEdgePositions();

        this.svg    = d3.select("body")
                        .append("svg")
                        .attr({
                            width:  options.width  || 500,
                            height: options.height || 500
                        });

        this.svg.append("svg:defs")
                .append("svg:marker")
                .attr({
                    id: "arrow",
                    viewBox: "0 0 10 10",
                    refX: 10,
                    refY: 5,
                    markerWidth: options.markerSize || 10,
                    markerHeight: options.markerSize || 10,
                    markerUnits: "userSpaceOnUse",
                    orient: "auto"
                })
                .append("svg:path")
                .attr("d", "M 10 0 L 0 5 L 10 10 z");

        this.edges = this.svg.append("g").attr("id", "edges");
        this.nodes = this.svg.append("g").attr("id", "nodes");
    }

    D3Renderer.prototype = new sg.Renderer.AbstractRenderer();
    
    D3Renderer.prototype._calculateEdgePositions = function() {
        this.graph.edges.forEach(function(edge) {
            var source = edge.getSource();
            var target = edge.getTarget();
            var x = 0;
            var y = 0;

            if (edge.directed()) {
                var sx = source.options.pos.x;
                var sy = source.options.pos.y;
                var tx = target.options.pos.x;
                var ty = target.options.pos.y;

                x = tx - sx;
                y = ty - sy;

                var ratio = (this.markerSize+target.options.radius)/Math.sqrt(x*x + y*y);
                
                x = x * ratio;
                y = y * ratio;
            }

            edge.options.x1 = target.options.pos.x - x;
            edge.options.y1 = target.options.pos.y - y;
            edge.options.x2 = source.options.pos.x;
            edge.options.y2 = source.options.pos.y;
        }.bind(this));
    };

    D3Renderer.prototype.refresh = function() {
        this.edges.selectAll("path")
                .attr("d", function(edge) {
                    return ["M ",
                            edge.options.x1,
                            " ",
                            edge.options.y1,
                            " L ",
                            edge.options.x2,
                            " ",
                            edge.options.y2,
                            " z"].join("");
                })
                .attr("marker-start", function(edge) {
                    return edge.directed() ? "url(#arrow)" : "none";
                });

        this.nodes.selectAll("circle")
                .attr("cx", function(node) {
                    return node.options.pos.x;
                })
                .attr("cy", function(node) {
                    return node.options.pos.y;
                })
                .attr("r", function(node) {
                    var stroke = Math.ceil(window.parseInt(d3.select(this).style("stroke-width"))/2);
                    return node.options.radius-stroke;
                });
    };

    D3Renderer.prototype.draw = function() {
        var renderer = this;
        var selected = null;

        this.edges.selectAll("path")
                .data(this.graph.edges.toArray())
                .enter()
                .append("svg:path")
                .on("mousedown", function(edge) {
                    if (selected !== null) {
                        selected.attr("class", "");
                    }

                    selected = d3.select(this).attr("class", "selected");
                })
                .on("dragstart", function() {
                    d3.event.preventDefault();
                });

        var mousedown = false;
        var deltaX = 0;
        var deltaY = 0;
        this.svg.on("mouseup", function() {
                    mousedown = false;
                    startX = startY = 0;
                })
                .on("mousemove", function() {
                    if (mousedown === false || selected === null) { return; }
                    var node = selected.data()[0];
                    d3.event.preventDefault();
                    if (!(node instanceof sg.Node)) { return; }

                    var rect = renderer.svg.node().getBoundingClientRect();
                    node.options.pos.x = (d3.event.clientX - rect.left) + deltaX;
                    node.options.pos.y = (d3.event.clientY - rect.top)  + deltaY;

                    renderer._calculateEdgePositions();

                    window.requestAnimationFrame(renderer.refresh.bind(renderer));
                });

        this.nodes.selectAll("circle")
                .data(this.graph.nodes.values())
                .enter()
                .append("svg:circle")
                .on("mousedown", function(node) {
                    if (selected) {
                        selected.attr("class", "");
                    }

                    selected = d3.select(this).attr("class", "selected");

                    mousedown = true;

                    var rect = renderer.svg.node().getBoundingClientRect();
                    deltaX = node.options.pos.x - (d3.event.clientX - rect.left);
                    deltaY = node.options.pos.y - (d3.event.clientY - rect.top);
                })
                .on("dragstart", function() {
                    d3.event.preventDefault();
                });

        this.refresh();
    };

    window.sg.Renderer.D3Renderer = D3Renderer;
}());
