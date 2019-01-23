
// General utility functions.

/**
 * Returns  a  promise for the JSON located at the
 * given path.
 * @param {string} path
 * @param {object} options
 */
const getJSON = (path, options) =>
	fetch(path, options)
		.then(res => res.json())
		.catch(err => console.warn(err));

/**
 * Returns the ordinal number corresponding to the
 * given cardinal number.
 * @param {number} num - A positive number.
 */
function ordString(num) {
	switch (num % 10) {
		case 1:  return `${num}st`;
		case 2:  return `${num}nd`;
		case 3:  return `${num}rd`;
		default: return `${num}th`;
	}
}

/**
 * Returns a random element of the given array, or
 * undefined if the array is empty.
 * @param {any[]} array
 */
function chooseRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns  a  point  on the straight line segment
 * between the two given points.
 * @param {Vector} p1 - The first point.
 * @param {Vector} p2 - The second point.
 * @param {number} t - A number between 0 and 1.
 */
function straightLinePoint(p1, p2, t) {
	// P = (1 - t) P1 + t P2
	return new Vector((1 - t) * p1.x + t * p2.x,
	                  (1 - t) * p1.y + t * p2.y);
}

/**
 * Returns  a  point on the quadratic bezier curve
 * defined by the three given points.
 * @param {Vector} p1 - The first point.
 * @param {Vector} p2 - The second point.
 * @param {Vector} p3 - The third point.
 * @param {number} t - A number between 0 and 1.
 */
function quadraticBezierCurvePoint(p1, p2, p3, t) {
	// P = (1 - t)^2 P1 + 2(1 - t)t P2 + t^2 P3
	return new Vector(
		(1 - t) * (1 - t) * p1.x +
			2 * (1 - t) * t * p2.x +
			t * t * p3.x,
		(1 - t) * (1 - t) * p1.y +
			2 * (1 - t) * t * p2.y +
			t * t * p3.y,
	);
}

/**
 * Returns  a  point  on  the  cubic  bezier curve
 * defined by the four given points.
 * @param {Vector} p1 - The first point
 * @param {Vector} p2 - The second point.
 * @param {Vector} p3 - The third point.
 * @param {Vector} p4 - The fourth point.
 * @param {number} t - A number between 0 and 1.
 */
function cubicBezierCurvePoint(p1, p2, p3, p4, t) {
	// bezierPoint() is a p5 method
	return new Vector(
		bezierPoint(p1.x, p2.x, p3.x, p4.x, t),
		bezierPoint(p1.y, p2.y, p3.y, p4.y, t),
	);
}

/**
 * Returns  a point on a piecewise line defined by
 * multiple straight-line segments.
 * @param {Vector[]} ps - An array of endpoints.
 * @param {number} t - A number between 0 and 1.
 */
function piecewiseStraightLinesPoint(ps, t) {
	const n = ps.length - 1;
	const s = 1.0 / n;
	const i = Math.floor(t / s);
	if (i >= n) {
		return ps[ps.length - 1];
	}
	return straightLinePoint(ps[i], ps[i + 1],
		                     t / s - i);
}

/**
 * Draws  a quadrilateral using the current canvas
 * settings.
 */
function drawQuad(x0, y0, x1, y1, x2, y2, x3, y3) {
	beginShape();
	vertex(x0, y0);
	vertex(x1, y1);
	vertex(x2, y2);
	vertex(x3, y3);
	endShape(CLOSE);
}
