/**
 * Plugin (base class)
 * 
 * Interfaz para plugins del engine.
 * Un plugin puede:
 * - Agregar systems
 * - Registrar servicios
 * - Agregar backends
 * - Escuchar eventos
 * - Inyectar funcionalidad
 */

export class Plugin {
    constructor(name, version = '1.0.0') {
        this.name = name;
        this.version = version;
        this.installed = false;
    }

    /**
     * Instalar el plugin en el engine
     * @param {Runtime} engine
     */
    async install(engine) {
        this.installed = true;
        console.log(`📦 Plugin "${this.name}" v${this.version} instalado`);
    }

    /**
     * Desinstalar el plugin del engine
     * @param {Runtime} engine
     */
    async uninstall(engine) {
        this.installed = false;
        console.log(`📦 Plugin "${this.name}" desinstalado`);
    }

    /**
     * Obtener nombre del plugin
     */
    getName() {
        return this.name;
    }

    /**
     * Obtener versión del plugin
     */
    getVersion() {
        return this.version;
    }
}
