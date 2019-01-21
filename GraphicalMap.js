
const LineType = {
	STRAIGHT_LINE:            0,
	QUADRATIC_BEZIER_CURVE:   1,
	CUBIC_BEZIER_CURVE:       2,
	PIECEWISE_STRAIGHT_LINES: 3,
};

/**
 * A class representing a location on the canvas.
 */
class GraphicalLocation {
	/**
	 * Create a new graphical location.
	 * @param {number} id - The location's unique identifier.
	 * @param {string} abbrev - The abbreviation of the location's name.
	 * @param {number} type - The location's type.
	 * @param {Vector} coords - The coordinates of the location.
	 * @param {Vector} labelOffset - The offset of the location's label.
	 */
	constructor(id, abbrev, type, coords, labelOffset) {
		this.id = id;
		this.abbrev = abbrev;
		this.type = type;
		this.x = coords.x;
		this.y = coords.y;
		this.labelX = this.x + labelOffset.x;
		this.labelY = this.y + labelOffset.y;
	}

	/**
	 * Draws the location on the canvas.
	 * All locations are drawn as a circle with a black border.
	 * The fill color is determined by the location type:
	 * - Inland City => Brown
	 * - Port City => Light Sky Blue
	 * - Sea => Navy
	 */
	draw() {
		push();
		switch (this.type) {
			case LocationType.INLAND_CITY: fill(165,  42,  42); break;
			case LocationType.PORT_CITY:   fill(135, 206, 250); break;
			case LocationType.SEA:         fill(  0,   0, 128); break;
			default: console.warn("GraphicalLocation.draw: " +
			                      "Invalid location type!");
		}
		stroke(0);
		strokeWeight(1.5);
		ellipse(this.x, this.y, 22);

		fill(0);
		noStroke();
		textSize(14);
		text(this.abbrev, this.labelX, this.labelY);
		pop();
	}
}

/**
 * A class representing a connection between locations on the canvas.
 */
class GraphicalConnection {
	/**
	 * Create a new connection between two locations on the map.
	 * @param {Number[2]} locations - An  array  containing the location
	 *                                IDs of the two endpoints.
	 * @param {Vector[2]} endPoints- An array containing the coordinates
	 *                               of the two endpoints.
	 * @param {Number} type - The type of connection.
	 * @param {Number} style - The  style  of  the  line between the two
	 *                         locations.
	 * @param {Vector[]} controlPoints - An  array of control points for
	 *                                   the  line. Defaults to an empty
	 *                                   array.
	 */
	constructor(locations, endPoints, type, style, controlPoints = []) {
		this.locations = locations.slice();
		this.endPoints = endPoints.slice();
		this.type = type;
		this.style = style;
		this.controlPoints = controlPoints.slice();
	}

	/**
	 * Draws the connection on the canvas.
	 */
	draw() {
		push();

		noFill();
		switch (this.type) {
			case TransportMode.ROAD:
				stroke(  0,   0,   0);
				strokeWeight(1.5);
				break;
			case TransportMode.RAIL:
				stroke(  0,   0,   0);
				strokeWeight(3.0);
				dash([4, 8]);
				break;
			case TransportMode.BOAT:
				stroke( 65, 105, 225);
				strokeWeight(1.5);
				dash([25, 8]);
				break;
		}

		switch (this.style) {
			case LineType.STRAIGHT_LINE:
				this.drawStraightConnection();
				break;
			case LineType.PIECEWISE_STRAIGHT_LINES:
				this.drawPiecewiseStraightConnection();
				break;
			case LineType.QUADRATIC_BEZIER_CURVE:
				this.drawQuadraticBezierConnection();
				break;
			case LineType.CUBIC_BEZIER_CURVE:
				this.drawCubicBezierConnection();
				break;
		}

		pop();
	}

	drawStraightConnection() {
		line(this.endPoints[0].x, this.endPoints[0].y,
			 this.endPoints[1].x, this.endPoints[1].y);
	}

	drawQuadraticBezierConnection() {
		beginShape();
		vertex(this.endPoints[0].x, this.endPoints[0].y);
		quadraticVertex(this.controlPoints[0].x, this.controlPoints[0].y,
						this.endPoints[1].x, this.endPoints[1].y);
		endShape();
	}

	drawCubicBezierConnection() {
		bezier(this.endPoints[0].x, this.endPoints[0].y,
		   	   this.controlPoints[0].x, this.controlPoints[0].y,
			   this.controlPoints[1].x, this.controlPoints[1].y,
			   this.endPoints[1].x, this.endPoints[1].y);
	}

	drawPiecewiseStraightConnection() {
		const points = [this.endPoints[0], ...this.controlPoints, this.endPoints[1]];
		for (let i = 0; i < points.length - 1; i++) {
			line(points[i].x, points[i].y,
				 points[i + 1].x, points[i + 1].y);
		}
	}

	getLineFunction(reverse = false) {
		const s = (reverse ? this.endPoints[1] : this.endPoints[0]);
		const e = (reverse ? this.endPoints[0] : this.endPoints[1]);
		const controlPoints = (
			reverse ?
			this.controlPoints.slice().reverse() :
			this.controlPoints
		);

		switch (this.style) {
			case LineType.STRAIGHT_LINE:
				return t => straightLinePoint(s, ...controlPoints, e, t);
			case LineType.PIECEWISE_STRAIGHT_LINES:
				return t => piecewiseStraightLinesPoint([s, ...controlPoints, e], t);
			case LineType.QUADRATIC_BEZIER_CURVE:
				return t => quadraticBezierCurvePoint(s, ...controlPoints, e, t);
			case LineType.CUBIC_BEZIER_CURVE:
				return t => cubicBezierCurvePoint(s, ...controlPoints, e, t);
		}
	}
}

/**
 * A class representing a sea boundary on the canvas.
 */
class GraphicalBoundary {
	/**
	 * Create a new sea boundary on the map.
	 * @param {Vector[3]} points - An  array  of three points: the first
	 *                             endpoint,  a  control point, and then
	 *                             the second endpoint.
	 */
	constructor(points) {
		this.points = points;
	}

	/**
	 * Draws the sea boundary on the canvas
	 */
	draw() {
		push();
		noFill();
		stroke(150);
		strokeWeight(2.0);
		beginShape();
		vertex(this.points[0].x, this.points[0].y);
		quadraticVertex(this.points[1].x, this.points[1].y,
						this.points[2].x, this.points[2].y);
		endShape();
		pop();
	}
}

class GraphicalMap {
	constructor() {
		this.boundaries = [];
		this.locations = new Map();
		this.connections = [];
		this.populate();
	}

	populate() {
		this.addLocations();
		this.addConnections();
		this.addBoundaries();
	}

	addLocations() {
		LOCATION_COORDS_JSON.then(json => {
			const locationCoords = json.locationCoords;
			for (let i = 0; i < locationCoords.length; i++) {
				this.addLocation(new GraphicalLocation(
					i, LOCATIONS[i].abbrev, LOCATIONS[i].type,
					locationCoords[i].coords,
					locationCoords[i].labelOffset
				));
			}
		});
	}

	addLocation(graphicalLocation) {
		this.locations.set(graphicalLocation.id, graphicalLocation);
	}

	addConnections() {
		Promise.all([LOCATION_COORDS_JSON, CONNECTION_COORDS_JSON])
			.then(jsons => {
				const connections = CONNECTIONS;
				const connectionCoords = jsons[1].connectionCoords;
				for (let i = 0; i < connections.length; i++) {
					this.addConnection(new GraphicalConnection(
						connections[i].locations,
						[this.locations.get(connections[i].locations[0]),
						 this.locations.get(connections[i].locations[1])],
						connections[i].type,
						connectionCoords[i].style,
						connectionCoords[i].controlPoints
					));
				}
			});
	}

	addConnection(graphicalConnection) {
		this.connections.push(graphicalConnection);
	}

	addBoundaries() {
		BOUNDARY_COORDS_JSON.then(json => {
			const boundaries = json.boundaries;
			for (let boundary of boundaries) {
				this.boundaries.push(new GraphicalBoundary(boundary));
			}
		});
	}

	/**
	 * Draws the map onto the canvas.
	 */
	draw() {
		for (let boundary of this.boundaries) {
			boundary.draw();
		}
		for (let connection of this.connections) {
		 	connection.draw();
		}
		for (let location of this.locations.values()) {
			location.draw();
		}
	}

	/**
	 * Gets the coordinates of the location with the given ID.
	 * @param {number} locationId - A location ID.
	 */
	getLocationCoords(locationId) {
		let graphicalLocation = this.locations.get(locationId);
		return new Vector(graphicalLocation.x, graphicalLocation.y);
	}

	/**
	 * Returns a function that computes points along lines for animating
	 * movement between locations with the given IDs.
	 * @param {number[]} locationIds - IDs of locations along the path.
	 * @param {number} type - The transport mode used to move.
	 */
	getAnimationFunction(locationIds, type) {
		const fns = [];
		for (let i = 0; i < locationIds.length - 1; i++) {
			for (let conn of this.connections) {
				if (conn.locations[0] === locationIds[i] &&
						conn.locations[1] === locationIds[i + 1] &&
						conn.type === type) {
					fns.push(conn.getLineFunction());
					break;
				}
				if (conn.locations[0] === locationIds[i + 1] &&
						conn.locations[1] === locationIds[i] &&
						conn.type === type) {
					fns.push(conn.getLineFunction(true));
					break;
				}
			}
		}
		
		const fn = t => {
			let n = fns.length;
			let s = 1.0 / n;
			let i = Math.floor(t / s);
			if (i >= n) {
				return fns[fns.length - 1](1.0);
			}
			return fns[i](t / s - i);
		};
		return fn;
	}
}
