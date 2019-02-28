
/**
 * A class that controls the presentation of game information.
 */
class View {
	constructor() {
		this.history = undefined;
		this.turn = 0;
		this.animationsOn = true;
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

	toggleAnimations() {
		this.animationsOn = !this.animationsOn;
		if (this.animationsOn) {
			$('#animation-setting-desc').text('Animations are on.');
			$('#toggle-animations-button').text('Turn off animations');
		} else {
			$('#animation-setting-desc').text('Animations are off.');
			$('#toggle-animations-button').text('Turn on animations');
		}
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
	 * Causes  the  game  state  at the very beginning of the game to be
	 * shown.
	 */
	jumpToStart() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();

		this.showGameStartState();
	}

	/**
	 * Causes  the  game  state  at the start of the previous turn to be
	 * shown.
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
	 * Advances  the  game state to the next turn. If animations are on,
	 * then the current turn is animated before showing the next turn.
	 */
	goNextTurn() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();

		if (this.turn < this.history.getNumTurns()) {
			if (this.turn >= NUM_PLAYERS && this.animationsOn) {
				this.animateTurn(this.turn);
			} else {
				this.turn++;
				this.showState(this.turn);
			}
		} else {
			this.showGameEndState();
		}
	}

	/**
	 * Causes  the  game  state  at the end of the game (end of the last
	 * turn) to be shown.
	 */
	jumpToEnd() {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();

		this.showGameEndState();
	}

	/**
	 * Causes  the  game state at the beginning of the given round to be
	 * shown.
	 * @param {number} round - A round number.
	 */
	jumpToRound(round) {
		DISPLAY.clearAnimations();
		DISPLAY.resetPlayers();

		this.turn = round * 5;
		this.showState(this.turn);
	}
	
	////////////////////////////////////////////////////////////////////
	// Showing game state                                             //

	/**
	 * Causes  the game state at the very start of the game to be shown.
	 */
	showGameStartState() {
		this.turn = 0;
		this.showState(0);
	}

	/**
	 * Causes  the  game  state at the very end of the game to be shown.
	 */
	showGameEndState() {
		this.turn = this.history.getNumTurns();
		this.showState(this.turn);
	}

	/**
	 * Causes the game state corresponding to the given turn to be shown
	 * @param {number} turnNo - The turn number.
	 */
	showState(turn) {
		DISPLAY.resetPlayers();

		const numTurns = this.history.getNumTurns();
		$('#go-to-start-button').prop("disabled", turn === 0);
		$('#prev-turn-button'  ).prop("disabled", turn === 0);
		$('#next-turn-button'  ).prop("disabled", turn === numTurns);
		$('#go-to-end-button'  ).prop("disabled", turn === numTurns);

		if (turn !== numTurns) {
			this.showTurnStartState(turn);
		} else {
			this.showTurnEndState(turn - 1);
		}
	}
	
	/**
	 * Causes the game state at the start of the given turn to be shown.
	 * @param {number} turnNo - The turn number.
	 */
	showTurnStartState(turnNo) {
		$('#start-of-end-of').text("Start of:");
		$('#round-and-turn-no').text(`Round ${this.turnToRound(turnNo)}, ` +
		                             `Turn ${this.turnToPlayer(turnNo)}`);
		const turnData = this.history.getTurn(turnNo);
		$('#narration').text(turnData.getNarration());
		DISPLAY.updateState(turnData.getStartState());
	}

	/**
	 * Causes  the  game start at the end of the given turn to be shown.
	 * @param {number} turnNo - The turn number.
	 */
	showTurnEndState(turnNo) {
		$('#start-of-end-of').text("End of:");
		$('#round-and-turn-no').text(`Round ${this.turnToRound(turnNo)}, ` +
		                             `Turn ${this.turnToPlayer(turnNo)}`);
		const turnData = this.history.getTurn(turnNo);
		$('#narration').text(turnData.getNarration());
		DISPLAY.updateState(turnData.getEndState());
	}

	////////////////////////////////////////////////////////////////////
	// Animate Turn                                                   //

	/**
	 * Animate the movement on the given turn.
	 * @param {number} turn 
	 */
	animateTurn(turn) {
		this.showState(this.turn);

		const turnData = this.history.getTurn(turn);
		const player = turnData.getPlayer();
		const src = turnData.getStartLocation();
		const dest = turnData.getDestinationLocation();

		const callback = () => this.showState(this.turn);

		// Teleportation
		if (turnData.getMove() === LocationID.TELEPORT) {
			this.turn++;
			DISPLAY.animateTeleportation(player, callback);
			return;
		
		// If the player didn't move, no animation
		} else if (src === dest) {
			this.showState(++this.turn);
			return;
		}

		let locations;
		let transport;

		// Animate movement depending on what transport mode the player
		// used.  If  the player could have travelled by either road or
		// rail, they are shown travelling by road.
		if (GAME_MAP.isAdjacentByRoad(src, dest)) {
			locations = [src, dest];
			transport = TransportMode.ROAD;
		} else if (GAME_MAP.isAdjacentByBoat(src, dest)) {
			locations = [src, dest];
			transport = TransportMode.BOAT;
		} else {
			locations = GAME_MAP.getRailPath(src, dest);
			transport = TransportMode.RAIL;
		}

		this.turn++;
		DISPLAY.animatePlayerMovement(player, locations, transport,
			                          callback);
	}
}
