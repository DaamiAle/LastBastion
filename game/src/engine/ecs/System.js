/**
 * Clase base para todos los Sistemas ECS.
 * Los sistemas implementan la lógica que procesa entidades que contienen componentes específicos.
 */
export class System {
    /**
     * @param {Object} world Referencia al Mundo (World) ECS que administra este sistema
     */
    constructor(world) {
        /** @type {Object} El Mundo ECS */
        this.world = world;
    }

    /**
     * Llamado en cada fotograma para procesar entidades.
     * Debe ser implementado por las subclases.
     * @param {Object} delta Objeto que contiene información de tiempo delta
     */
    update(delta) {}
}
