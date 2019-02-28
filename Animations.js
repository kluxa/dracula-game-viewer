
/**
 * A class representing a move animation.
 */
class MoveAnimation {
	/**
	 * Create a new move animation.
	 * @param {Object} entity - The  entity  to be animated. This entity
	 *                          must have a setPosition method.
	 * @param {function[]} fn - A function that computes the position of
	 *                          the  entity,  given  a progression value
	 *                          between 0 and 1.
	 * @param {number} duration - The total duration of the animation in
	 *                            seconds. (This does not work.)
	 * @param {function} callback - A  function  to  be  called when the
	 *                              animation is complete.
	 */
	constructor(entity, fn, duration, callback) {
		this.entity = entity;
		this.progress = 0;
		this.fn = fn;
		this.duration = duration;
		this.callback = callback;

		if (entity.setPosition === undefined) {
			console.warn("MoveAnimation: Entity does not have a " +
			             "setPosition method.");
		}
	}

	/**
	 * Updates the position of the entity.
	 */
	update() {
		if (this.progress < 1.0) {
			this.progress += 1.0 / (60 * this.duration);
			if (this.progress >= 1.0) {
				this.progress = 1.0;
				this.callback();
			} else {
				this.entity.setPosition(this.fn(this.progress));
			}
		}
	}

	/**
	 * Gets the progress of the animation.
	 * @returns {number} A  number  between  0 and 1, where 1 means that
	 *                   the animation has completed.
	 */
	getProgress() {
		return this.progress;
	}
}

/**
 * A class representing a size animation.
 */
class SizeAnimation {
	/**
	 * Create a new size animation.
	 * @param {Object} entity - The  entity  to be animated. This entity
	 *                          must have a setSize method.
	 * @param {function} fn - A  function  that computes the size of the
	 *                        entity given a progression value between 0
	 *                        and 1.
	 * @param {number} duration - The total duration of the animation in
	 *                            seconds. (This does not work.)
	 * @param {function} callback - A  function  to  be  called when the
	 *                              animation is complete.
	 */
	constructor(entity, fn, duration, callback) {
		this.entity = entity;
		this.progress = 0;
		this.fn = fn;
		this.duration = duration;
		this.callback = callback;

		if (entity.setSize === undefined) {
			console.warn("SizeAnimation: Entity does not have a " +
			             "setSize method.");
		}
	}

	/**
	 * Updates  the  size  of  the  entity. The entity can decide how to
	 * interpret/depict the new size.
	 */
	update() {
		if (this.progress < 1.0) {
			this.progress += 1.0 / (60 * this.duration);
			if (this.progress >= 1.0) {
				this.progress = 1.0;
				this.callback();
			} else {
				this.entity.setSize(this.fn(this.progress));
			}
		}
	}

	/**
	 * Gets the progress of the animation.
	 * @returns {number} A  number  between  0 and 1, where 1 means that
	 *                   the animation has completed.
	 */
	getProgress() {
		return this.progress;
	}
}
