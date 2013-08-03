Simple Graph Renderer
=====================

This is a SVG visualizer for [SimpleGraph](https://github.com/nvlbg/SimpleGraph) graphs using [D3](http://d3js.org/). 
For now it supports undirected, directed and mixed graphs. Multigraph and selfloops support coming soon.

How to use
----------

You can see how to use it in the examples/ directory.
Basically, supposing that you have sg.Graph in a variable *g*:

```
var renderer = new sg.Renderer.D3Renderer(graph);
renderer.draw();
```

***Note:*** for now you have to have a position and radius in each node's options.

TODO
----

- [ ] Multigraph and selfloops support
- [ ] Automatic calculation of each node's position
- [ ] Add more flexability for drawing (e.g. support for user defined callback functions)
- [ ] Host demo somewhere
- [ ] Add screenshots
