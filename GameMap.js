
/**
 * A map specialised for the Fury of Dracula.
 */
class GameMap {
	constructor() {
		this.graph = new Graph();
		this.locations = new Map();
		this.populate();
	}

	/**
	 * Adds all locations and connections to the map.
	 */
	populate() {
		for (let location of LOCATIONS) {
			this.addLocation(location.id);
		}
		for (let connection of CONNECTIONS) {
			this.addConnection(connection.locations[0],
							   connection.locations[1],
							   connection.type);
		}
	}

	/**
	 * Adds a location to the map.
	 * @param {number} locationId - A location ID.
	 */
	addLocation(locationId) {
		this.graph.addVertex(locationId);
	}

	/**
	 * Adds a connection to the map.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 * @param {number} type - The type of the connection.
	 */
	addConnection(v, w, type) {
		this.graph.addEdge(v, w, type);
	}

	/**
	 * Determines  if two locations are adjacent by road, returning true
	 * or false as appropriate.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 * @returns {boolean}
	 */
	isAdjacentByRoad(v, w) {
		return this.graph.isAdjacent(v, w, [TransportMode.ROAD]);
	}

	/**
	 * Determines  if two locations are adjacent by rail, returning true
	 * or false as appropriate.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 * @returns {boolean}
	 */
	isAdjacentByRail(v, w) {
		return this.graph.isAdjacent(v, w, [TransportMode.RAIL]);
	}

	/**
	 * Determines  if two locations are adjacent by boat, returning true
	 * or false as appropriate.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 * @returns {boolean}
	 */
	isAdjacentByBoat(v, w) {
		return this.graph.isAdjacent(v, w, [TransportMode.BOAT]);
	}

	/**
	 * Returns  the  shortest distance by rail between two locations, or
	 * Infinity if the two locations are not connected by rail.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 * @returns {number}
	 */
	distanceByRail(v, w) {
		return this.graph.getDist(v, w, [TransportMode.RAIL]);
	}

	/**
	 * Returns  an array containing the IDs of locations on the shortest
	 * path by rail between two locations, including the start location,
	 * or undefined if no such path exists.
	 * @param {number} s - The ID of the source location.
	 * @param {number} t - The ID of the destination location.
	 * @returns {number[]}
	 */
	getRailPath(s, t) {
		return this.graph.getPath(s, t, [TransportMode.RAIL]);
	}

	/**
	 * Returns an array containing the IDs of locations that Dracula can
	 * reach in one turn from a given location.
	 * @param {number} v - A location ID.
	 * @returns {number[]}
	 */
	reachableByDracula(v) {
		let reachable = this.graph.getNeighbours(v,
				[TransportMode.ROAD, TransportMode.BOAT]);
		reachable.push(v);
		return reachable;
	}

	/**
	 * Determines  if  Dracula can move between two locations, returning
	 * true or false as appropriate.
	 * @param {number} v - The ID of the first location.
	 * @param {number} w - The ID of the second location.
	 */
	dracAdjacent(v, w) {
		return (v === w ||
				this.isAdjacentByRoad(v, w) ||
				this.isAdjacentByBoat(v, w));
	}
}
