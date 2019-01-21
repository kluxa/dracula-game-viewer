
/**
 * A class that controls presentation logic.
 */
class View {
	constructor() {
		this.history = undefined;
		this.turn = 0;
	}

	////////////////////////////////////////////////////////////////////
	// Getters                                                        //
	/**
	 * Gets the last round number in the game.
	 */
	getLastRoundNo() {
		return this.history.getLastRoundNo();
	}

	////////////////////////////////////////////////////////////////////
	// Setters                                                        //

	/**
	 * Sets a new game history to be displayed / navigated.
	 * @param {GameHistory} history
	 */
	setHistory(history) {
		this.history = history;
		this.turn = 0;
		this.showState(0);
	}

	////////////////////////////////////////////////////////////////////
	// Helpers                                                        //

	/**
	 * Gets the round during which the given turn occurred.
	 * @param {number} turn - A turn number (0-based).
	 */
	turnToRound(turn) {
		return Math.floor(turn / 5);
	}

	/**
	 * Gets the ID of the player who played the given turn.
	 * @param {number} turn - A turn number (0-based).
	 */
	turnToPlayer(turn) {
		return turn % 5;
	}

	////////////////////////////////////////////////////////////////////
	// Changing turns                                                 //

	/**
	 * Animates  the movement in the current turn, and then
	 * causes  the game state at the start of the next turn
	 * to be shown.
	 */
	goNextTurn() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();
		if (this.turn < this.history.getNumTurns()) {
			this.animateTurn(this.turn);
		}
	}

	/**
	 * Causes  the  game state at the start of the previous
	 * turn to be shown.
	 */
	goPrevTurn() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();
		if (this.turn > 0) {
			this.turn--;
			this.showState(this.turn);
		}
	}

	/**
	 * Causes  the game state at the beginning of the given
	 * round to be shown.
	 * @param {number} round - A round number.
	 */
	jumpToRound(round) {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();
		this.turn = round * 5;
		this.showState(this.turn);
	}

	/**
	 * Causes the game state at the end of the game (end of
	 * the last turn) to be shown.
	 */
	jumpToEnd() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();
		this.turn = this.history.getNumTurns();
		this.showState(this.turn);
	}

	////////////////////////////////////////////////////////////////////
	// Showing game state                                             //

	/**
	 * Shows the game state at the start of the given turn.
	 */
	showState(turn) {
		DISPLAY.resetPlayers();
		if (turn === this.history.getNumTurns()) {
			this.showEndState();
			return;
		}

		$('#start-of-end-of').text("Start of:");
		$('#round-and-turn-no').text(`Round ${this.turnToRound(turn)}, ` +
		                             `Turn ${this.turnToPlayer(turn)}`);
		const turnData = this.history.getTurn(turn);
		DISPLAY.updatePlayerLocations(turnData.getStartState().locations);
		DISPLAY.updatePlayerHealths(turnData.getStartState().healths);
		DISPLAY.updateGameScore(turnData.getStartState().score);
		$('#narration').text(turnData.getNarration());
	}
	
	/**
	 * Shows  the game state at the end of the game (end of
	 * the last turn).
	 */
	showEndState() {
		$('#start-of-end-of').text("End of:");
		let turn = this.history.getNumTurns() - 1;
		$('#round-and-turn-no').text(`Round ${this.turnToRound(turn)}, ` +
		                             `Turn ${this.turnToPlayer(turn)}`);
		const turnData = this.history.getTurn(turn);
		DISPLAY.updatePlayerLocations(turnData.getEndState().locations);
		DISPLAY.updatePlayerHealths(turnData.getEndState().healths);
		DISPLAY.updateGameScore(turnData.getEndState().score);
		$('#narration').text(turnData.getNarration());
	}


	////////////////////////////////////////////////////////////////////
	// Animate Turn                                                   //

	/**
	 * Animate the movement on the given turn.
	 * @param {number} turn 
	 */
	animateTurn(turn) {
		this.showState(this.turn);

		// Don't animate first round.
		if (turn < 5) {
			this.turn++;
			this.showState(this.turn);
			return;
		}

		const turnData = this.history.getTurn(turn);
		const player = turnData.getPlayer();
		const src = turnData.getStartState().locations[player];
		const dest = turnData.getLocation();

		if (turnData.move === LocationID.TELEPORT) {
			DISPLAY.animateTeleportation(player);
		} else if (src === dest) {
			this.turn++;
			this.showState(this.turn);
			return;
		} else if (GAME_MAP.isAdjacentByRoad(src, dest)) {
			DISPLAY.animatePlayerMovement(player, [src, dest], TransportMode.ROAD);
		} else if (GAME_MAP.isAdjacentByBoat(src, dest)) {
			DISPLAY.animatePlayerMovement(player, [src, dest], TransportMode.BOAT);
		} else {
			DISPLAY.animatePlayerMovement(player, GAME_MAP.getRailPath(src, dest),
			                              TransportMode.RAIL);
		}

		this.turn++;
		setTimeout(() => this.showState(this.turn), 900);
	}
}
