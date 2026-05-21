/**
 * EventTypes
 * 
 * Catálogo de eventos que emite el engine.
 * Documentación central de la API de eventos.
 */

/**
 * Eventos de colisión
 */
export const CollisionEvents = {
    // collision.enter
    // Emitido cuando dos entidades COMIENZAN a colisionar
    // Payload: { entityA: Entity, entityB: Entity }
    ENTER: 'collision.enter',

    // collision.stay
    // Emitido mientras dos entidades CONTINÚAN colisionando
    // Payload: { entityA: Entity, entityB: Entity }
    STAY: 'collision.stay',

    // collision.exit
    // Emitido cuando dos entidades DEJAN de colisionar
    // Payload: { entityA: Entity, entityB: Entity }
    EXIT: 'collision.exit'
};

/**
 * Eventos de animación
 */
export const AnimationEvents = {
    // animation.started
    // Emitido cuando una animación COMIENZA
    // Payload: { entity: Entity, animationName: string }
    STARTED: 'animation.started',

    // animation.finished
    // Emitido cuando una animación TERMINA (no loop)
    // Payload: { entity: Entity, animationName: string }
    FINISHED: 'animation.finished',

    // animation.looped
    // Emitido cuando una animación COMPLETA un ciclo
    // Payload: { entity: Entity, animationName: string, loopCount: number }
    LOOPED: 'animation.looped'
};

/**
 * Eventos de entidad
 */
export const EntityEvents = {
    // entity.created
    // Emitido cuando una entidad es CREADA
    // Payload: { entity: Entity }
    CREATED: 'entity.created',

    // entity.destroyed
    // Emitido cuando una entidad es DESTRUIDA
    // Payload: { entity: Entity }
    DESTROYED: 'entity.destroyed',

    // entity.activated
    // Emitido cuando una entidad se ACTIVA
    // Payload: { entity: Entity }
    ACTIVATED: 'entity.activated',

    // entity.deactivated
    // Emitido cuando una entidad se DESACTIVA
    // Payload: { entity: Entity }
    DEACTIVATED: 'entity.deactivated'
};

/**
 * Eventos de input
 */
export const InputEvents = {
    // input.action_pressed
    // Emitido cuando se presiona una acción
    // Payload: { action: string, entity: Entity }
    ACTION_PRESSED: 'input.action_pressed',

    // input.action_released
    // Emitido cuando se suelta una acción
    // Payload: { action: string, entity: Entity }
    ACTION_RELEASED: 'input.action_released',

    // input.axis_changed
    // Emitido cuando un eje de input cambia
    // Payload: { axis: string, value: Vector2, entity: Entity }
    AXIS_CHANGED: 'input.axis_changed'
};

/**
 * Eventos de gameplay (se definen en gameplay layer)
 */
export const GameplayEvents = {
    // gameplay.damage_taken
    // Emitido cuando una entidad recibe daño
    // Payload: { target: Entity, source: Entity, amount: number }
    DAMAGE_TAKEN: 'gameplay.damage_taken',

    // gameplay.death
    // Emitido cuando una entidad muere
    // Payload: { entity: Entity, killer: Entity }
    DEATH: 'gameplay.death',

    // gameplay.ability_used
    // Emitido cuando se usa una habilidad
    // Payload: { entity: Entity, ability: string }
    ABILITY_USED: 'gameplay.ability_used'
};
