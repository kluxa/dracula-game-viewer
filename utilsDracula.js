
// Utility functions for the Fury of Dracula.

/**
 * Returns  the  name of the player with the given
 * player ID.
 * @param {number} playerId - A player ID.
 */
function playerIdToName(playerId) {
	let names = [
		"Lord Godalming",
		"Dr. Seward",
		"Van Helsing",
		"Mina Harker",
		"Dracula"
	];
	return names[playerId % 5];
}

/**
 * Returns  the ID of the player with the given 1-
 * letter  abbreviation,  or  -1 if no such player
 * exists.
 * @param {string} char - A single-letter string.
 * @returns {number} A player ID.
 */
function playerChartoId(char) {
	switch (char) {
		case 'G': return PlayerID.LORD_GODALMING;
		case 'S': return PlayerID.DR_SEWARD;
		case 'H': return PlayerID.VAN_HELSING;
		case 'M': return PlayerID.MINA_HARKER;
		case 'D': return PlayerID.DRACULA;
		default:  return -1;
	}
}

/**
 * Returns  the  color  associated  with the given
 * player.
 * @param {number} playerId - A player ID.
 * @returns {Color}
 */
function playerIdToColor(playerId) {
	const colors = [
		new Color(  0, 255,   0),
		new Color(255, 255,   0),
		new Color(  0, 255, 255),
		new Color(255,   0, 255),
		new Color(255,   0,   0),
	];
	return colors[playerId % 5];
}

/**
 * Returns  the ID of the move with the given two-
 * letter  abbreviation,  or LocationID.NOWHERE if
 * no such move exists.
 * @param {string} abbrev - A move abbreviation.
 * @returns {number} A move ID.
 */
function moveAbbrevToId(abbrev) {
	let location = LOCATIONS.find(x => x.abbrev === abbrev);
	if (location !== undefined) {
		return location.id;
	}

	switch (abbrev) {
		case "C?": return LocationID.CITY_UNKNOWN;
		case "S?": return LocationID.SEA_UNKNOWN;
		case "HI": return LocationID.HIDE;
		case "D1": return LocationID.DOUBLE_BACK_1;
		case "D2": return LocationID.DOUBLE_BACK_2;
		case "D3": return LocationID.DOUBLE_BACK_3;
		case "D4": return LocationID.DOUBLE_BACK_4;
		case "D5": return LocationID.DOUBLE_BACK_5;
		case "TP": return LocationID.TELEPORT;
	}

	return LocationID.NOWHERE;
}

/**
 * Returns  the  ID of the location with the given
 * two-letter  abbreviation, or LocationID.NOWHERE
 * if no such location exists.
 * @param {string} abbrev - A  two-letter location
 *                          abbreviation.
 * @returns {number} A location ID.
 */
function locationAbbrevToId(abbrev) {
	return moveAbbrevToId(abbrev);
}

/**
 * Returns the name of the move with the given ID,
 * or "Nowhere" if no such move exists.
 * @param {number} moveId - A move ID.
 */
function moveIdToName(moveId) {
	if (isRealLocation(moveId)) {
		return LOCATIONS[moveId].name;
	}

	switch (moveId) {
		case LocationID.CITY_UNKNOWN:  return "City Unknown";
		case LocationID.SEA_UNKNOWN:   return "Sea Unknown";
		case LocationID.HIDE:          return "Hide";
		case LocationID.DOUBLE_BACK_1: return "Double Back 1";
		case LocationID.DOUBLE_BACK_2: return "Double Back 2";
		case LocationID.DOUBLE_BACK_3: return "Double Back 3";
		case LocationID.DOUBLE_BACK_4: return "Double Back 4";
		case LocationID.DOUBLE_BACK_5: return "Double Back 5";
		case LocationID.TELEPORT:      return "Teleport";
	}

	return "Nowhere";
}

/**
 * Returns the name of the location with the given
 * ID.
 * @param {number} locationId - A location ID. 
 */
function locationIdToName(locationId) {
	return moveIdToName(locationId);
}

/**
 * Determines  whether  the given move corresponds
 * to  a real location, returning true or false as
 * appropriate.
 * @param {number} moveId - A move ID.
 */
function isRealLocation(moveId) {
	return (moveId >= 0 &&
			moveId <= LocationID.LAST_LOCATION);
}

/**
 * Determines whether the given location is a sea,
 * returning true or false as appropriate.
 * @param {number} locationId - A location ID.
 */
function isSea(locationId) {
	return LOCATIONS[locationId].type === LocationType.SEA;
}

/**
 * Determines  whether the given move is exclusive
 * to  Dracula  (i.e.,  only  Dracula can use it),
 * returning true or false as appropriate.
 * @param {number} moveId - A move ID. 
 */
function isDraculaExclusiveMove(moveId) {
	return (moveId === LocationID.TELEPORT ||
			moveId === LocationID.HIDE ||
			isDoubleBack(moveId));
}

/**
 * Determines  whether  the given move is a double
 * back, returning true or false as appropriate.
 * @param {number} moveId - A move ID.
 */
function isDoubleBack(moveId) {
	return (moveId === LocationID.DOUBLE_BACK_1 ||
			moveId === LocationID.DOUBLE_BACK_2 ||
			moveId === LocationID.DOUBLE_BACK_3 ||
			moveId === LocationID.DOUBLE_BACK_4 ||
			moveId === LocationID.DOUBLE_BACK_5);
}

/**
 * Gets  the double back move corresponding to the
 * given number.
 * @param {number} num - A number between 1 and 5.
 */
function numToDoubleBack(num) {
	switch (num) {
		case 1:  return LocationID.DOUBLE_BACK_1;
		case 2:  return LocationID.DOUBLE_BACK_2;
		case 3:  return LocationID.DOUBLE_BACK_3;
		case 4:  return LocationID.DOUBLE_BACK_4;
		case 5:  return LocationID.DOUBLE_BACK_5;
		default: return LocationID.NOWHERE;
	}
}

/**
 * Returns  the  number corresponding to the given
 * double back move.
 * @param {number} moveId - A double back move ID. 
 */
function doubleBackToNum(moveId) {
	switch (moveId) {
		case LocationID.DOUBLE_BACK_1: return  1;
		case LocationID.DOUBLE_BACK_2: return  2;
		case LocationID.DOUBLE_BACK_3: return  3;
		case LocationID.DOUBLE_BACK_4: return  4;
		case LocationID.DOUBLE_BACK_5: return  5;
		default:                       return -1;
	}
}

/**
 * Determines  whether  the given array contains a
 * double  back  move,  returning true or false as
 * appropriate.
 * @param {number[]} array - An array of moves. 
 */
function containsDoubleBack(array) {
	return array.some(x => isDoubleBack(x));
}

/**
 * Returns  "he" or "she", depending on the gender
 * of the given player.
 * @param {number} playerId - A player ID. 
 */
function heOrShe(playerId) {
	return (playerId === PlayerID.MINA_HARKER ?
		    "she" : "he");
}

/**
 * Returns the earliest round that Dracula can use
 * the given move.
 * @param {number} moveId - A move ID.
 */
function earliestRoundForMove(moveId) {
	switch (moveId) {
		case LocationID.HIDE:          return 1;
		case LocationID.DOUBLE_BACK_1: return 1;
		case LocationID.DOUBLE_BACK_2: return 2;
		case LocationID.DOUBLE_BACK_3: return 3;
		case LocationID.DOUBLE_BACK_4: return 4;
		case LocationID.DOUBLE_BACK_5: return 5;
		case LocationID.TELEPORT:      return 1;
		default:                       return 0;
	}
}
