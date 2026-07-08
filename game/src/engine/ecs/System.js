/**
 * Base class for all ECS Systems.
 * Systems implement the logic that processes entities containing specific components.
 */
export class System {
    /**
     * @param {Object} world Reference to the ECS World managing this system
     */
    constructor(world) {
        /** @type {Object} The ECS World */
        this.world = world;
    }

    /**
     * Called every frame to process entities.
     * Must be implemented by subclasses.
     * @param {Object} delta Time delta object
     */
    update(delta) {}
}
