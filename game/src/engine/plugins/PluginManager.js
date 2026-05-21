/**
 * PluginManager
 * 
 * Gestor de plugins del engine.
 * Controla instalación, desinstalación y listado de plugins.
 */

export class PluginManager {
    constructor(engine) {
        this.engine = engine;
        this.plugins = new Map(); // Map<name, plugin>
        this.pluginOrder = []; // Orden de instalación
    }

    /**
     * Instalar un plugin
     * @param {Plugin} plugin
     */
    async use(plugin) {
        const name = plugin.getName();

        if (this.plugins.has(name)) {
            console.warn(`Plugin "${name}" ya está instalado`);
            return;
        }

        // Instalar el plugin
        await plugin.install(this.engine);

        // Registrar
        this.plugins.set(name, plugin);
        this.pluginOrder.push(name);
    }

    /**
     * Desinstalar un plugin
     * @param {string|Plugin} pluginOrName
     */
    async unuse(pluginOrName) {
        const name = typeof pluginOrName === 'string'
            ? pluginOrName
            : pluginOrName.getName();

        if (!this.plugins.has(name)) {
            console.warn(`Plugin "${name}" no está instalado`);
            return;
        }

        const plugin = this.plugins.get(name);

        // Desinstalar el plugin
        await plugin.uninstall(this.engine);

        // Desregistrar
        this.plugins.delete(name);
        const idx = this.pluginOrder.indexOf(name);
        if (idx >= 0) {
            this.pluginOrder.splice(idx, 1);
        }
    }

    /**
     * Obtener plugin por nombre
     * @param {string} name
     */
    get(name) {
        return this.plugins.get(name);
    }

    /**
     * Verificar si plugin está instalado
     * @param {string} name
     */
    has(name) {
        return this.plugins.has(name);
    }

    /**
     * Obtener listado de plugins instalados
     */
    list() {
        return this.pluginOrder.map(name => this.plugins.get(name));
    }

    /**
     * Obtener cantidad de plugins
     */
    get count() {
        return this.plugins.size;
    }

    /**
     * Desinstalar todos los plugins (en orden inverso)
     */
    async uninstallAll() {
        const pluginsToUninstall = [...this.pluginOrder].reverse();
        for (const name of pluginsToUninstall) {
            await this.unuse(name);
        }
    }

    /**
     * Limpiar manager
     */
    clear() {
        this.plugins.clear();
        this.pluginOrder = [];
    }
}
