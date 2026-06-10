/**
 * Boid Component
 * 
 * Almacena la configuración de comportamiento de grupo (flocking y steering)
 * para entidades en la capa de gameplay.
 */
export class Boid {
    constructor(config = {}) {
        // Velocidad y fuerza máxima de giro
        this.maxSpeed = config.maxSpeed ?? 120;
        this.maxForce = config.maxForce ?? 150; // Capacidad de giro
        
        // Radios de percepción para el vecindario
        this.perceptionRadius = config.perceptionRadius ?? 80;
        
        // Pesos para cada fuerza de Craig Reynolds
        this.separationWeight = config.separationWeight ?? 2.5; // Evitar solaparse
        this.alignmentWeight = config.alignmentWeight ?? 0.8;    // Seguir misma dirección
        this.cohesionWeight = config.cohesionWeight ?? 0.8;     // Mantenerse agrupados
        this.seekWeight = config.seekWeight ?? 1.8;             // Cazar al objetivo
        
        // Objetivo a perseguir (referencia o ID de entidad)
        this.targetEntity = config.targetEntity ?? null;
    }
}
