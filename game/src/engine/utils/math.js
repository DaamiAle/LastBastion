// src/engine/utils/math.js
/**
 * Limita un valor entre un mínimo y un máximo.
 * @param {number} value - El valor a limitar.
 * @param {number} min - El valor mínimo permitido.
 * @param {number} max - El valor máximo permitido.
 * @return {number} El valor limitado entre min y max.
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Realiza una interpolación lineal entre dos valores.
 * @param {number} start - El valor de inicio.
 * @param {number} end - El valor de fin.
 * @param {number} t - El factor de interpolación (entre 0 y 1).
 * @return {number} El valor interpolado entre start y end.
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Convierte grados a radianes.
 * @param {number} degrees - El ángulo en grados.
 * @return {number} El ángulo convertido a radianes.
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convierte radianes a grados.
 * @param {number} radians - El ángulo en radianes.
 * @return {number} El ángulo convertido a grados.
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Normaliza un ángulo en radianes para que esté entre 0 y 2π.
 * @param {number} angle - El ángulo en radianes a normalizar.
 * @return {number} El ángulo normalizado entre 0 y 2π.
 */
export function normalizeAngle(angle) {
    const TWO_PI = Math.PI * 2;

    angle = angle % TWO_PI;
    if (angle < 0) angle += TWO_PI;

    return angle;
}