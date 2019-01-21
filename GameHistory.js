
class GameHistory {
	constructor() {
		this.history = [];
	}

	/**
	 * Adds data about a turn to the game history.
	 * @param {TurnData} turnData
	 */
	addTurnData(turnData) {
		this.history.push(turnData);
	}

	/**
	 * Gets the number of turns that are stored in
	 * the game history.
	 */
	getNumTurns() {
		return this.history.length;
	}

	/**
	 * Gets  the data associated with a particular
	 * turn (0-based).
	 * @param {number} turn - A turn number.
	 * @returns {TurnData}
	 */
	getTurn(turn) {
		return this.history[turn];
	}

	/**
	 * Gets  the last round number in the game (0-
	 * based).
	 */
	getLastRoundNo() {
		return Math.floor((this.getNumTurns() - 1) / 5);
	}
}
