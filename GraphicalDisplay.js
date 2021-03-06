
class GraphicalDisplay {
	constructor() {
		this.animations = [];
		this.map = new GraphicalMap();
		this.players = [
			new GraphicalPlayer(playerIdToColor(0), new Vector(-5, -5)),
			new GraphicalPlayer(playerIdToColor(1), new Vector( 5, -5)),
			new GraphicalPlayer(playerIdToColor(2), new Vector(-5,  5)),
			new GraphicalPlayer(playerIdToColor(3), new Vector( 5,  5)),
			new GraphicalPlayer(playerIdToColor(4), new Vector( 0,  0)),
		];
		this.statsPanel = new GraphicalStatsPanel();
		this.scorePanel = new GraphicalScorePanel();
	}

	////////////////////////////////////////////////////////////////////
	// Update and Draw                                                //
	
	update() {
		for (let i = this.animations.length - 1; i >= 0; i--) {
			this.animations[i].update();
			if (this.animations[i].getProgress() >= 1.0) {
				this.animations.splice(i, 1);
			}
		}
	}

	draw() {
		this.map.draw();
		this.players.forEach(p => p.draw());
		this.statsPanel.draw();
		this.scorePanel.draw();
	}

	////////////////////////////////////////////////////////////////////
	// Animations                                                     //

	/**
	 * Clears all animations.
	 */
	clearAnimations() {
		this.animations = [];
	}

	/**
	 * Specifies  an  animation  of  a player moving between a number of
	 * locations using a particular transport mode.
	 * @param {number} playerId - A player ID.
	 * @param {number[]} locationIds - An array of location IDs.
	 * @param {number} type - The transport mode.
	 * @param {Function} callback - A  function  to  be  called when the
	 *                              animation is complete.
	 */
	animatePlayerMovement(playerId, locationIds, type, callback) {
		const animation = new MoveAnimation(
			this.players[playerId],
			this.map.getAnimationFunction(locationIds, type),
			0.5, callback
		);
		this.animations.push(animation);
	}

	/**
	 * Specifies an animation of a player teleporting to Castle Dracula.
	 * (The player will always be Dracula.)
	 * @param {number} playerId - A player ID.
	 * @param {Function} callback - A  function  to  be  called when the
	 *                              animation is complete.
	 */
	animateTeleportation(playerId, callback) {
		const animation = new SizeAnimation(
			this.players[playerId],
			t => 1 - t,
			0.5, callback
		);
		this.animations.push(animation);
	}

	////////////////////////////////////////////////////////////////////
	// Showing State                                                  //

	/**
	 * Resets certain attributes of the players (currently, just size).
	 */
	resetPlayers() {
		this.players.forEach(x => x.reset());
	}

	/**
	 * Updates  the graphical display to show state information from the
	 * given game state.
	 * @param {GameState} state - A game state.
	 */
	updateState(state) {
		this.updateGameScore(state.getScore());
		this.updatePlayerHealths(state.getHealths());
		this.updatePlayerLocations(state.getLocations());
		this.updateDracTrail(state.getDracTrailLocations());
	}

	/**
	 * Updates the locations of the players.
	 * @param {number[5]} locationIds - Location IDs of the players.
	 */
	updatePlayerLocations(locationIds) {
		for (let i = 0; i < 5; i++) {
			if (locationIds[i] === LocationID.NOWHERE) {
				this.players[i].setPosition(new Vector(-1, -1));
			} else {
				const coords = this.map.getLocationCoords(locationIds[i]);
				this.players[i].setPosition(coords);
			}
		}

		this.statsPanel.updateLocations(locationIds);
	}

	/**
	 * Updates the health of the players.
	 * @param {number[5]} healths - Health values of the players.
	 */
	updatePlayerHealths(healths) {
		this.statsPanel.updateHealths(healths);
	}

	/**
	 * Updates the game score.
	 * @param {number} score - The game score. 
	 */
	updateGameScore(score) {
		this.scorePanel.updateScore(score);
	}

	updateDracTrail(trail) {
		this.map.setDracTrail(trail);
	}
}
