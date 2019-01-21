
// Controls how health is displayed on the canvas.
class GraphicalHealthPanel {
	constructor() {
		this.healths = [-1, -1, -1, -1, -1];
	}

	updateHealths(healths) {
		this.healths = healths;
	}

	draw() {
		if (this.healths[0] < 0) {
			return;
		}

		this.drawBackground();
		for (let i = 0; i < 4; i++) {
			this.drawHunterHealth(i);
		}
		this.drawDraculaHealth();
	}

	drawBackground() {
		push();
		noStroke();
		fill(255, 255, 255, 200);
		rect(800, 20, 380, 260, 20);
		pop();
	}

	drawHunterHealth(playerId) {
		push();
		fill(0, 255);
		textSize(14);
		text(playerIdToName(playerId), 820, 55 + playerId * 45);

		textSize(20);
		textAlign(RIGHT);
		text(`${this.healths[playerId]}`, 1144, 55 + playerId * 45);
		
		let color = playerIdToColor(playerId);
		fill(color.r, color.g, color.b, 180);
		stroke(0);
		strokeJoin(ROUND);
		strokeWeight(1.5);

		for (let i = 0; i < 9; i++) {
			if (i >= this.healths[playerId]) {
				noFill();
			}
			beginShape();
			vertex(825 + i * 36, 65 + playerId * 45);
			vertex(855 + i * 36, 65 + playerId * 45);
			vertex(850 + i * 36, 71 + playerId * 45);
			vertex(820 + i * 36, 71 + playerId * 45);
			endShape(CLOSE);
		}
		pop();
	}

	drawDraculaHealth() {
		let playerId = 4;
		push();
		fill(0, 255);
		textSize(14);
		text(playerIdToName(playerId), 820, 55 + playerId * 45);
		
		textSize(20);
		textAlign(RIGHT);
		text(`${this.healths[playerId]}`, 1144, 55 + playerId * 45);

		let color = playerIdToColor(playerId);
		
		noStroke();
		strokeJoin(ROUND);
		strokeWeight(1.5);
		fill(color.r, color.g, color.b, 180);
		let health = this.healths[playerId];
		beginShape();
		vertex(825, 65 + playerId * 45);
		vertex(825 + 317 * (Math.min(1, health/40)), 65 + playerId * 45);
		vertex(820 + 317 * (Math.min(1, health/40)), 71 + playerId * 45);
		vertex(820, 71 + playerId * 45);
		endShape(CLOSE);

		stroke(0);
		noFill();
		beginShape();
		vertex(825, 65 + playerId * 45);
		vertex(825 + 317, 65 + playerId * 45);
		vertex(820 + 317, 71 + playerId * 45);
		vertex(820, 71 + playerId * 45);
		endShape(CLOSE);
		pop();
	}


}
