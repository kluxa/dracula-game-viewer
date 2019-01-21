
/**
 * Class representing an edge of a particular type to another vertex.
 */
class Edge {
	/**
	 * Create an edge to a vertex.
	 * @param {number} vertex - The vertex's ID.
	 * @param {number} type - The edge type.
	 */
	constructor(vertex, type) {
		this.vertex = vertex;
		this.type = type;
	}
}

/**
 * A  class representing a generic undirected graph where edges can have
 * different types.
 */
class Graph {
	/**
	 * Create an empty graph.
	 */
	constructor() {
		this.edges = new Map();
		this.edgeTypes = new Set();
	}

	/**
	 * Adds a vertex to the graph.
	 * @param {number} v - The vertex ID.
	 * @returns {boolean} True  if the vertex was successfully added, or
	 *                    false otherwise.
	 */
	addVertex(v) {
		if (!this.containsVertex(v)) {
			this.edges.set(v, []);
			return true;
		}
		return false;
	}

	/**
	 * Determines  if  the graph contains a given vertex, returning true
	 * or false as appropriate.
	 * @param {number} v - The vertex ID.
	 */
	containsVertex(v) {
		return this.edges.has(v);
	}

	/**
	 * Adds an edge of a particular type between two vertices.
	 * @param {number} v - The first vertex's ID.
	 * @param {number} w - The second vertex's ID.
	 * @param {number} type - The type of the edge.
	 * @returns {boolean} True  if  the  edge was successfully added, or
	 *                    false otherwise.
	 */
	addEdge(v, w, type) {
		if (this.containsVertex(v) && this.containsVertex(w)) {
			if (!this.isAdjacent(v, w, [type])) {
				this.edges.get(v).push(new Edge(w, type));
				this.edges.get(w).push(new Edge(v, type));
				this.edgeTypes.add(type);
				return true;
			}
		}
		return false;
	}

	/**
	 * Determines  if  two  vertices are adjacent by at least one of the
	 * given edge types, returning true or false as appropriate.
	 * @param {number} v - The first vertex's ID.
	 * @param {number} w - The second vertex's ID.
	 * @param {number[]} types - An array of usable edge types. Defaults
	 *                           to  an  array of all edge types used in
	 *                           the graph.
	 */
	isAdjacent(v, w, types = [...this.edgeTypes]) {
		if (this.containsVertex(v) && this.containsVertex(w)) {
			for (let edge of this.edges.get(v)) {
				if (edge.vertex === w && types.includes(edge.type)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Returns  an array containing IDs of vertices that are adjacent to
	 * the given vertex by at least one of the given edge types.
	 * @param {number} v - The source vertex's ID.
	 * @param {number[]} types - An array of usable edge types. Defaults
	 *                           to  an  array of all edge types used in
	 *                           the graph.
	 * @returns {number[]} An array of IDs of vertices that are adjacent
	 *                     to  the  given  vertex by at least one of the
	 *                     given  edge  types, or undefined if the given
	 *                     vertex is not contained in the graph.
	 */
	getNeighbours(v, types = [...this.edgeTypes]) {
		if (!this.containsVertex(v)) return undefined;
		
		let neighbours = [];
		for (let edge of this.edges.get(v)) {
			if (types.includes(edge.type) &&
					!neighbours.includes(edge.vertex)) {
				neighbours.push(edge.vertex);
			}
		}
		return neighbours;
	}

	/**
	 * Gets the shortest distance between two vertices.
	 * @param {number} s - The source vertex ID.
	 * @param {number} t - The destination vertex ID.
	 * @param {number[]} types - An array of usable edge types. Defaults
	 *                           to  an  array of all edge types used in
	 *                           the graph.
	 * @returns {number} The length of the shortest path between s and t
	 *                   using only the given edge types, or Infinity if
	 *                   there is no such path from s to t.
	 */
	getDist(s, t, types = [...this.edgeTypes]) {
		const path = this.getPath(s, t, types);
		if (path === undefined) {
			return Infinity;
		}
		return path.length - 1;
	}

	/**
	 * Gets  the  shortest  path between two vertices that uses only the
	 * given edge types.
	 * @param {number} s - The source vertex ID.
	 * @param {number} t - The destination vertex ID.
	 * @param {number[]} types - An array of usable edge types. Defaults
	 *                           to  an  array of all edge types used in
	 *                           the graph.
	 * @returns {number[]} An  array of IDs of vertices on the path from
	 *                     s  to  t (including s), or undefined if there
	 *                     is no path from s to t.
	 */
	getPath(s, t, types = [...this.edgeTypes]) {
		const st = this.bfs(s, types);
		if (!st.has(t)) {
			return undefined;
		}

		const path = [];
		let curr = t;
		while (curr !== s) {
			path.unshift(curr);
			curr = st.get(curr);
		}
		path.unshift(s);
		return path;
	}

	/**
	 * Performs  a BFS starting at the given starting vertex, using only
	 * the given edge types.
	 * @param {number} s - The source vertex ID.
	 * @param {number[]} types - An array of usable edge types. Defaults
	 *                           to  an  array of all edge types used in
	 *                           the graph.
	 * @return {Map<number, number>} A  vertex  to precessor mapping for
	 *                               all reachable vertices.
	 */
	bfs(s, types = [...this.edgeTypes]) {
		const queue = [s];
		const st = new Map();
		st.set(s, s);
		while (queue.length > 0) {
			const v = queue.shift();
			for (let edge of this.edges.get(v)) {
				if (types.includes(edge.type)) {
					const w = edge.vertex;
					if (!st.has(w)) {
						st.set(w, v);
						queue.push(w);
					}
				}
			}
		}
		return st;
	}
}
