/**
 * SceneFactory
 * 
 * Factory pattern para crear escenas con sus sistemas registrados.
 * Separa la lógica de creación de escena de su configuración.
 */

export class SceneFactory {
    /**
     * Crear una escena con sus sistemas registrados
     * 
     * @param {class} GameConfigClass - Clase que contiene método estático registerSystems
     * @param {Runtime} runtime - Runtime del engine
     * @param {class} SceneClass - Clase de la escena a crear
     * @returns {Scene} Escena configurada
     */
    static async createScene(GameConfigClass, runtime, SceneClass) {
        // Instanciar la escena
        const scene = new SceneClass();

        // Registrar sistemas usando la configuración del juego
        GameConfigClass.registerSystems(scene, runtime);

        return scene;
    }
}
