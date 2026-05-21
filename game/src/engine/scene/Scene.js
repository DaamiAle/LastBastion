/**
 * Scene
 * 
 * Capa de aplicación que maneja:
 * - Carga de assets
 * - Transiciones
 * - Bootstrap de gameplay
 * 
 * Delegación a World para:
 * - Lógica ECS
 * - Sistemas
 * - Eventos
 * - Queries
 */

import { World } from '../world/World.js';

export class Scene {
    constructor() {
        // World contiene la lógica ECS
        this.world = new World();
    }

    // Delegación de métodos a World
    get entities() {
        return this.world.entities;
    }

    get systems() {
        return this.world.systems;
    }

    get eventBus() {
        return this.world.eventBus;
    }

    get queryManager() {
        return this.world.queryManager;
    }

    get grid() {
        return this.world.grid;
    }

    query(componentTypes) {
        return this.world.query(componentTypes);
    }

    addEntity(entity) {
        return this.world.addEntity(entity);
    }

    removeEntity(entity) {
        return this.world.removeEntity(entity);
    }

    addSystem(system, priority = 0) {
        return this.world.addSystem(system, priority);
    }

    setAllEntitiesActive(active) {
        return this.world.setAllEntitiesActive(active);
    }

    update(delta) {
        return this.world.update(delta);
    }

    destroy() {
        return this.world.destroy();
    }

    // Hooks de ciclo de vida (para subclases)
    async onEnter(runtime) {
        // Sobrescribir en subclases
    }

    onExit() {
        // Sobrescribir en subclases
    }
}