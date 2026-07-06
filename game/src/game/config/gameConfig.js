export const GAME_CONFIG = {
    // Configuración general de la aplicación PixiJS
    app: {
        width: 1280, // Ancho de la ventana/canvas de juego
        height: 720, // Alto de la ventana/canvas de juego
        backgroundColor: 0x050816 // Color de fondo base (espacio/vacío)
    },
    // Configuración del mundo y el mapa de juego
    world: {
        radiusInFortressWidths: 20, // Define el tamaño del mundo jugable basado en anchos de la base
        extraViewportPadding: 720, // Relleno extra para renderizar y calcular fuera de cámara
        gridSize: 120, // Tamaño de las celdas del SpatialHashGrid (optimización de colisiones espaciales)
        gridColor: 0x1f2937, // Color de la cuadrícula de fondo
        backgroundColor: 0x111827, // Color principal del suelo/terreno
        dangerRingRadius: 420, // Radio visual de la zona de peligro alrededor de la base
        dangerRingColor: 0x7c2d12, // Color de la línea que marca la zona de peligro
        padding: 40, // Margen de seguridad para límites del mundo físico
        spawnMargin: 220, // Distancia extra fuera de pantalla para que spawneen enemigos sin ser vistos
        ambientSpawnRadiusMin: 920, // Radio mínimo donde aparecen zombies ambientales (vagando)
        ambientSpawnRadiusMax: 1780, // Radio máximo donde aparecen zombies ambientales
        waveSpawnRadiusMin: 760, // Radio mínimo de aparición masiva durante una oleada
        waveSpawnRadiusMax: 1480 // Radio máximo de aparición masiva durante una oleada
    },
    // Economía y recompensas
    economy: {
        startingResources: 120, // Recursos (monedas) iniciales del jugador
        killReward: 6, // Monedas que suelta un zombie al morir
        waveStartRewardBase: 20, // Recompensa base por iniciar una oleada
        waveStartRewardPerWave: 5, // Incremento de recompensa al iniciar oleadas posteriores
        waveClearRewardBase: 18, // Recompensa base al sobrevivir una oleada completa
        waveClearRewardPerWave: 2, // Incremento de recompensa al sobrevivir oleadas posteriores
        sellRefundRatio: 0.65 // Porcentaje de monedas que recuperás al vender una torreta (65%)
    },
    // Configuración del sistema de oleadas
    waves: {
        initialWave: 1, // Número de la primera oleada
        initialDelayMs: 20000, // Tiempo de paz inicial antes de que arranque la oleada 1
        delayBetweenWavesMs: 30000, // Tiempo de descanso entre oleada y oleada
        spawnIntervalMs: 1000 / 60, // Intervalo de spawn de enemigos (60 veces por segundo aprox)
        firstSpawnDelayMs: 100, // Demora inicial para el primer spawn
        fibonacciMultiplier: 100 // Multiplicador de dificultad/cantidad de enemigos basado en secuencia de Fibonacci
    },
    // Sistema global de ruido (para atraer zombies)
    noise: {
        defaultRadius: 280, // Radio de audición de los zombies por defecto
        defaultTtlMs: 900, // Tiempo de vida (en milisegundos) de un ruido en el mundo
        defaultStrength: 1 // Fuerza de atracción de un ruido genérico
    },
    // Configuración de la cámara
    camera: {
        lerp: 0.1 // Factor de suavizado (interpolación) al seguir al jugador (menor valor = más suave)
    },
    // Atributos del personaje Jugador
    player: {
        radius: 20, // Radio de colisión física del jugador
        maxHealth: 140, // Vida máxima del jugador
        speed: 560, // Velocidad de movimiento del jugador
        acceleration: 20, // Aceleración para un movimiento suave
        deceleration: 4, // Desaceleración (fricción) al soltar las teclas
        buildRange: 150, // Rango máximo al que puede construir interactuando con los slots
        attackRange: 480, // Rango máximo del disparo del arma principal del jugador
        fireCooldownMs: 130, // Tiempo de espera (milisegundos) entre disparos (cadencia)
        respawnOffsetY: 170, // Distancia en Y respecto al centro al respawnear tras morir
        spriteScale: 0.36, // Escala visual del sprite del jugador
        aimRotationOffset: -1.5707963267948966, // Ajuste de rotación (-90 grados) para que el sprite apunte hacia el mouse
        animationSpeed: 0.45, // Velocidad a la que se reproducen los frames de la animación de caminar
        collisionPadding: 60, // Margen extra de colisión para suavizar rebotes contra objetos
        // Balas del arma del jugador
        projectile: {
            damage: 25, // Daño infligido por cada bala
            color: 0xf8fafc, // Color de la partícula de la bala
            speed: 600, // Velocidad a la que viaja la bala
            size: 5, // Tamaño visual del proyectil
            maxDistanceOffset: 40 // Distancia adicional que recorre antes de desaparecer si no golpea nada
        },
        // Ruido generado por el jugador al disparar/moverse
        noise: {
            radius: 320, // Radio al que los zombies pueden escuchar al jugador disparar
            ttlMs: 1000, // Duración del foco de ruido
            strength: 1.35 // Fuerza de atracción de este ruido hacia los zombies
        }
    },
    // Configuración de trampas/explosivos colocables (Superviviente)
    explosives: {
        c4: {
            damage: 1000,
            radius: 320, // Área de efecto de la explosión
            cooldownMs: 20000 // Tiempo de enfriamiento para volver a poder usar la habilidad
        },
        landmine: {
            damage: 1000,
            radius: 160, // Área de explosión de la mina
            cooldownMs: 20000, // Enfriamiento de la habilidad
            triggerRadius: 40 // Distancia a la que un zombie la detona si se acerca
        },
        timebomb: {
            damage: 1000,
            radius: 240, // Área masiva de explosión
            cooldownMs: 20000, // Enfriamiento de la habilidad
            fuseMs: 7000 // Tiempo (7s) antes de que la bomba de tiempo explote automáticamente
        }
    },
    // Configuración de la base principal (Bastión / Núcleo)
    fortress: {
        footprint: 144, // Espacio físico cuadrado que ocupa como obstáculo
        radius: 132, // Radio lógico de interacción
        maxHealth: 1200, // Salud del bastión (Si llega a 0, Game Over)
        regenRate: 2, // Cantidad de vida regenerada pasivamente
        attackRange: 480, // Rango de ataque de la torreta que trae incorporada el bastión
        fireRateMs: 250, // Cadencia de tiro inicial del bastión
        minFireRateMs: 120, // Cadencia máxima alcanzable mediante mejoras
        fireRateScalePerLevel: 0.08, // Mejora de cadencia por nivel de actualización
        damage: 25, // Daño base de la bala del bastión
        damageScalePerLevel: 0.3, // Mejora porcentual del daño por nivel
        rangeScalePerLevel: 0.08, // Mejora porcentual del rango por nivel
        cadenceScalePerLevel: 0.08, // Factor de escalado extra de la cadencia
        scale: 0.6, // Escala visual del sprite del bastión
        upgradeBaseCost: 90, // Costo de la primera mejora del bastión
        upgradeCostPerLevel: 70, // Aumento del costo por cada nivel extra comprado
        turretVisualScale: 2, // Escala visual exclusiva del cañón del bastión
        noise: {
            radius: 320, // Radio de sonido de sus disparos
            ttlMs: 1500, // Duración del ruido
            strength: 1.6 // Fuerte factor de atracción a los zombies
        },
        projectile: {
            color: 0x7dd3fc, // Color de la bala
            speed: 640, // Velocidad de la bala
            size: 6, // Tamaño visual
            maxDistanceOffset: 32 // Margen extra de vuelo máximo
        }
    },
    // Ranuras (Slots) de construcción para torretas
    slots: {
        distanceFromCenter: 220, // Distancia desde el núcleo de la base en la que se ubican
        radius: 34 // Radio de la zona interactuable del slot
    },
    // Comportamiento, físicas y atributos de los enemigos (Zombies)
    zombies: {
        maxAliveCount: 10000, // Límite máximo global (hard-cap) de zombies para no matar la performance
        radius: 14, // Radio físico de colisión
        minSpeed: 58, // Velocidad mínima base (el valor final por zombie es aleatorio)
        maxSpeed: 76, // Velocidad máxima base
        detectionRadius: 640, // Distancia visual/auditiva para detectar directamente al jugador o base
        attackRange: 26, // Distancia súper cercana necesaria para meter el mordisco
        attackCooldownMs: 700, // Tiempo entre ataque y ataque de un mismo zombie
        damage: 7, // Daño infligido por mordisco
        maxHealth: 100, // Vida de cada zombie base
        spriteScale: 0.84, // Escala visual para el sprite
        aimRotationOffset: 1.5707963267948966, // Desfase angular (90 grados) para alinear las patas/boca hacia el frente
        // Parámetros de Bandada (Boids Flocking)
        flockRadius: 96, // Radio en el que perciben a otros zombies vecinos
        separationWeight: 1.7, // Qué tan fuerte intentan repelerse para no apilarse todos juntos (muy fuerte)
        alignmentWeight: 0.45, // Qué tanto intentan marchar paralelos (moderado)
        cohesionWeight: 0.28, // Qué tanto buscan el centro del grupo para hacer manada (bajo)
        seekWeight: 1, // Fuerza directa hacia su presa objetivo (jugador/base)
        // Multiplicadores de estado
        noiseSpeedMultiplier: 1.12, // Aumento de velocidad al perseguir un ruido sospechoso (más rápidos)
        wanderSpeedMultiplier: 0.75, // Reducción de velocidad cuando no tienen objetivo y vagan (más lentos)
        attackExitRangeMultiplier: 1.4, // Tolerancia extra para seguir golpeando antes de cancelar la persecución de ataque
        wanderRetargetMinMs: 1200, // Tiempo mínimo que vagan en línea antes de girar
        wanderRetargetMaxMs: 2400, // Tiempo máximo de caminata errática antes de cambiar el rumbo
        wanderAngleJitter: 0.95, // Desviación en radianes al buscar nuevos rumbos de deambulación
        wanderDistanceMin: 70, // Distancia mínima a caminar hacia el punto
        wanderDistanceMax: 160, // Distancia máxima
        wanderArrivalRadius: 38, // Radio de tolerancia para asumir que llegaron a su destino de deambulación
        collisionPadding: 30 // Margen extra lógico en las celdas para empujones (push-back)
    },
    // Atributos y balance de Torretas construibles
    turrets: {
        baseRadius: 18, // Radio físico que bloquea movimiento
        baseHealth: 300, // Vida base de las torretas (1/4 de la vida del bastión)
        healthPerLevel: 35, // Incremento de vida máxima por cada mejora adquirida
        minFireRateMs: 90, // Límite inferior absoluto de tiempo entre disparos
        rangeScalePerLevel: 0.1, // Aumento del % de rango por nivel
        damageScalePerLevel: 0.2, // Aumento del % de daño por nivel
        fireRateScalePerLevel: 0.35, // Aumento del % de cadencia por nivel
        upgradeCostBase: 1, // Multiplicador base de la fórmula de mejora
        upgradeCostPerLevel: 0.15, // Factor encarecedor por cada mejora previa comprada
        noiseRadiusScalePerLevel: 0.06, // Expansión del área de ruido por nivel
        //scalePerLevel: 0.06, // Aumento del tamaño del sprite al mejorarse
        // Tipos de Torreta
        types: {
            sniper: {
                label: 'Sniper', // Etiqueta en UI
                color: 0x7dd3fc, // Color del proyectil (celeste)
                range: 640, // Tiene muchísimo rango visual
                damage: 150, // Daño letal masivo
                fireRateMs: 3000, // Tiempo muy largo entre tiros (3s)
                projectileSpeed: 780, // Bala muy rápida
                cost: 150, // Incrementado: alto costo por tener daño letal asegurado (one-shot kill)
                maxHealth: 300, // Vida parametrizada (1/4 del bastión)
                splashRadius: 0, // Arma de objetivo único
                noiseRadius: 480, // Hace mucho ruido al disparar
                noiseTtlMs: 1500, // El ruido dura
                noiseStrength: 2.2 // El sonido atrae bastante
            },
            machinegun: {
                label: 'Ametralladora',
                color: 0x34d399, // Color del proyectil (verde)
                range: 320, // Rango medio normal
                damage: 15, // Poco daño individual
                fireRateMs: 150, // Metralleta muy veloz
                projectileSpeed: 860, // Bala muy veloz
                cost: 80, // Costo normal
                maxHealth: 500, // Vida parametrizada (1/4 del bastión)
                splashRadius: 0, // Objetivo único
                noiseRadius: 320, // Ruido moderado
                noiseTtlMs: 1000, // Disipación rápida
                noiseStrength: 1.15 // Atracción normal
            },
            cannon: {
                label: 'Cañón',
                color: 0xfb923c, // Color del proyectil (naranja)
                range: 160, // Rango muy cortito
                damage: 50, // Daño de impacto muy duro
                fireRateMs: 1000, // 1 tiro por segundo
                projectileSpeed: 620, // Bala lenta y pesada
                cost: 120, // Muy costosa
                maxHealth: 800, // Vida parametrizada (1/4 del bastión)
                splashRadius: 160, // Genera DAÑO DE ÁREA alrededor del impacto
                noiseRadius: 640, // Explota fortísimo
                noiseTtlMs: 1800, // Ruido súper duradero
                noiseStrength: 4.5 // Atrae manadas enteras de zombies de inmediato
            }
        }
    },
    // Parámetros de Interfaz de Usuario y Gráficos UI
    ui: {
        defaultSelectedTurretType: 'machinegun', // Opción predeterminada al abrir menú de construcción
        messageDurationMs: 2400, // Tiempo que flotan los cartelitos de mensajes (ej. "¡No tienes monedas!")
        waveBannerDurationMs: 1800, // Tiempo que se queda el cartel enorme superior anunciando la oleada
        hudBottomHeight: 106, // Altura en píxeles del panel inferior de botones para limitar los clicks en el mundo
        interactionLabelDistance: 210 // Distancia para mostrar labels de ayuda "E para interactuar"
    },
    // Manejo de partidas guardadas locales
    saves: {
        slot: 'campaign' // Clave usada en LocalStorage para el archivo persistente
    },
    // Modo Debug o configuraciones de testeo rápidas
    presets: {
        quickMode: {
            wave: 3, // Saltar directamente a x oleada
            resources: 240 // Sumar recursos iniciales para probar comprar rápido
        }
    }
};
