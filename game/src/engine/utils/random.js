// src/engine/utils/random.js
/**
 * Genera un número entero aleatorio entre min y max (inclusive).
 * @param {number} min - El valor mínimo (inclusive).
 * @param {number} max - El valor máximo (inclusive).
 * @return {number} Un número entero aleatorio entre min y max.
 */
export function randomInt(min, max) {
    return Math.floor(randomFloat(min, max + 1));
}

/**
 * Genera un número flotante aleatorio entre min (inclusive) y max (exclusive).
 * @param {number} min - El valor mínimo (inclusive).
 * @param {number} max - El valor máximo (exclusive).
 * @return {number} Un número flotante aleatorio entre min y max.
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
