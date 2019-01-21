
/**
 * A class representing a graphical player.
 */
class GraphicalPlayer {
	constructor(color, offset) {
		this.color = color;
		this.offset = offset;
		this.x = -1;
		this.y = -1;

		this.fullSize = 20;
		this.sizeRatio = 1;
	}

	/**
	 * Draws the player onto the canvas as a circle.
	 */
	draw() {
		if (this.x < 0 || this.y < 0) return;

		push();
		fill(this.color.r, this.color.g, this.color.b);
		stroke(0);
		strokeWeight(1.5);
		ellipse(this.x + this.offset.x,
				this.y + this.offset.y,
				this.fullSize * this.sizeRatio);
		pop();
	}

	/**
	 * Sets the position of the player on the canvas.
	 * @param {Vector} position - The new position.
	 */
	setPosition(position) {
		this.x = position.x;
		this.y = position.y;
	}

	/**
	 * Sets the size ratio of the player.
	 * @param {number} size - The new size ratio.
	 */
	setSize(size) {
		this.sizeRatio = size;
	}

	/**
	 * Resets the player.
	 */
	reset() {
		this.sizeRatio = 1;
	}
}
