export const GAME_CONFIG = {
    app: {
        width: 1280,
        height: 720,
        backgroundColor: 0x050816
    },
    world: {
        radiusInFortressWidths: 20,
        extraViewportPadding: 720,
        gridSize: 120,
        gridColor: 0x1f2937,
        backgroundColor: 0x111827,
        dangerRingRadius: 420,
        dangerRingColor: 0x7c2d12,
        padding: 40,
        spawnMargin: 220,
        ambientSpawnRadiusMin: 920,
        ambientSpawnRadiusMax: 1780,
        waveSpawnRadiusMin: 760,
        waveSpawnRadiusMax: 1480
    },
    economy: {
        startingResources: 120,
        killReward: 6,
        waveStartRewardBase: 20,
        waveStartRewardPerWave: 5,
        waveClearRewardBase: 18,
        waveClearRewardPerWave: 2,
        sellRefundRatio: 0.65
    },
    waves: {
        initialWave: 1,
        initialDelayMs: 20000,
        delayBetweenWavesMs: 30000,
        spawnIntervalMs: 1000 / 60,
        firstSpawnDelayMs: 100,
        fibonacciMultiplier: 100
    },
    noise: {
        defaultRadius: 280,
        defaultTtlMs: 900,
        defaultStrength: 1
    },
    camera: {
        lerp: 0.1
    },
    player: {
        radius: 20,
        maxHealth: 140,
        speed: 560,
        buildRange: 150,
        attackRange: 480,
        fireCooldownMs: 130,
        respawnOffsetY: 170,
        spriteScale: 0.36,
        aimRotationOffset: -1.5707963267948966,
        animationSpeed: 0.198,
        collisionPadding: 60,
        projectile: {
            damage: 24,
            color: 0xf8fafc,
            speed: 920,
            size: 4,
            maxDistanceOffset: 40
        },
        noise: {
            radius: 320,
            ttlMs: 1000,
            strength: 1.35
        }
    },
    explosives: {
        c4: {
            radius: 180,
            cooldownMs: 20000
        },
        landmine: {
            radius: 120,
            cooldownMs: 20000,
            triggerRadius: 40
        },
        timebomb: {
            radius: 250,
            cooldownMs: 20000,
            fuseMs: 5000
        }
    },
    fortress: {
        footprint: 144,
        radius: 132,
        maxHealth: 1200,
        regenRate: 2,
        attackRange: 480,
        fireRateMs: 250,
        minFireRateMs: 120,
        fireRateScalePerLevel: 0.08,
        damage: 25,
        damageScalePerLevel: 0.3,
        rangeScalePerLevel: 0.08,
        cadenceScalePerLevel: 0.08,
        scale: 0.6,
        upgradeBaseCost: 90,
        upgradeCostPerLevel: 70,
        turretVisualScale: 2,
        noise: {
            radius: 320,
            ttlMs: 1500,
            strength: 1.6
        },
        projectile: {
            color: 0x7dd3fc,
            speed: 760,
            size: 4,
            maxDistanceOffset: 32
        }
    },
    slots: {
        distanceFromCenter: 220,
        radius: 34
    },
    zombies: {
        maxAliveCount: 10000,
        radius: 14,
        minSpeed: 58,
        maxSpeed: 76,
        detectionRadius: 640,
        attackRange: 26,
        attackCooldownMs: 700,
        damage: 7,
        maxHealth: 100,
        spriteScale: 0.84,
        aimRotationOffset: 1.5707963267948966,
        flockRadius: 96,
        separationWeight: 1.7,
        alignmentWeight: 0.45,
        cohesionWeight: 0.28,
        seekWeight: 1,
        noiseSpeedMultiplier: 1.12,
        wanderSpeedMultiplier: 0.75,
        attackExitRangeMultiplier: 1.4,
        wanderRetargetMinMs: 1200,
        wanderRetargetMaxMs: 2400,
        wanderAngleJitter: 0.95,
        wanderDistanceMin: 70,
        wanderDistanceMax: 160,
        wanderArrivalRadius: 38,
        collisionPadding: 30
    },
    turrets: {
        baseRadius: 18,
        baseHealth: 120,
        healthPerLevel: 35,
        minFireRateMs: 90,
        rangeScalePerLevel: 0.08,
        damageScalePerLevel: 0.35,
        fireRateScalePerLevel: 0.05,
        upgradeCostBase: 0.75,
        upgradeCostPerLevel: 0.45,
        noiseRadiusScalePerLevel: 0.06,
        scalePerLevel: 0.06,
        types: {
            sniper: {
                label: 'Sniper',
                color: 0x7dd3fc,
                range: 640,
                damage: 150,
                fireRateMs: 3000,
                projectileSpeed: 780,
                cost: 50,
                maxHealth: 150,
                splashRadius: 0,
                noiseRadius: 480,
                noiseTtlMs: 1500,
                noiseStrength: 2.2
            },
            machinegun: {
                label: 'Ametralladora',
                color: 0x34d399,
                range: 320,
                damage: 15,
                fireRateMs: 150,
                projectileSpeed: 860,
                cost: 80,
                maxHealth: 200,
                splashRadius: 0,
                noiseRadius: 320,
                noiseTtlMs: 1000,
                noiseStrength: 1.15
            },
            cannon: {
                label: 'Cañón',
                color: 0xfb923c,
                range: 160,
                damage: 50,
                fireRateMs: 1000,
                projectileSpeed: 620,
                cost: 120,
                maxHealth: 250,
                splashRadius: 120,
                noiseRadius: 640,
                noiseTtlMs: 1800,
                noiseStrength: 4.5
            }
        }
    },
    ui: {
        defaultSelectedTurretType: 'machinegun',
        messageDurationMs: 2400,
        waveBannerDurationMs: 1800,
        hudBottomHeight: 106,
        interactionLabelDistance: 210
    },
    saves: {
        slot: 'campaign'
    },
    presets: {
        quickMode: {
            wave: 3,
            resources: 240
        }
    }
};
