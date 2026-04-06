// Utility functions for the game engine

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

// DISTANCIAS

/**
 * Calcula la distancia al cuadrado entre dos puntos (x1, y1) y (x2, y2).
 * Usar la distancia al cuadrado es más eficiente al comparar distancias, ya que evita la operación de raíz cuadrada.
 * @param {number} x1 - La coordenada x del primer punto.
 * @param {number} y1 - La coordenada y del primer punto.
 * @param {number} x2 - La coordenada x del segundo punto.
 * @param {number} y2 - La coordenada y del segundo punto.
 * @return {number} La distancia al cuadrado entre los dos puntos.
 */
export function distanceSq(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calcula la distancia exacta entre dos puntos (x1, y1) y (x2, y2).
 * @param {number} x1 - La coordenada x del primer punto.
 * @param {number} y1 - La coordenada y del primer punto.
 * @param {number} x2 - La coordenada x del segundo punto.
 * @param {number} y2 - La coordenada y del segundo punto.
 * @return {number} La distancia entre los dos puntos.
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt(distanceSq(x1, y1, x2, y2));
}

/**
 * Normaliza un vector dado por sus componentes dx y dy, devolviendo un nuevo vector con la misma dirección pero con longitud 1.
 * Si el vector es de longitud cero, devuelve un vector nulo (0, 0).
 * @param {number} dx - La componente x del vector.
 * @param {number} dy - La componente y del vector.
 * @return {Object} Un objeto con propiedades x e y que representan el vector normalizado.
 */
export function normalize(dx, dy) {
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return { x: 0, y: 0 };

    const len = Math.sqrt(lenSq);

    return {
        x: dx / len,
        y: dy / len
    };
}

// COLISIONES

/**
 * Verifica si dos círculos colisionan.
 * @param {Object} circle1 - El primer círculo con propiedades x, y y radius.
 * @param {Object} circle2 - El segundo círculo con propiedades x, y y radius.
 * @return {boolean} true si los círculos colisionan, false de lo contrario.
 */
export function checkCircleCollision(circle1, circle2) {
    const radiusSum = circle1.radius + circle2.radius;
    const distSq = distanceSq(
        circle1.x, circle1.y,
        circle2.x, circle2.y
    );
    return distSq < radiusSum * radiusSum;
}

/**
 * Verifica si dos rectángulos colisionan.
 * @param {Object} rect1 - El primer rectángulo con propiedades x, y, width y height.
 * @param {Object} rect2 - El segundo rectángulo con propiedades x, y, width y height.
 * @return {boolean} true si los rectángulos colisionan, false de lo contrario.
 */
export function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// ANGULOS

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

// GEOMETRIA

/**
 * Verifica si un punto (px, py) está dentro de un rectángulo definido por rect (con propiedades x, y, width y height).
 * @param {number} px - La coordenada x del punto.
 * @param {number} py - La coordenada y del punto.
 * @param {Object} rect - El rectángulo con propiedades x, y, width y height.
 * @return {boolean} true si el punto está dentro del rectángulo, false de lo contrario.
 */
export function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width &&
        py >= rect.y && py <= rect.y + rect.height;
}

// UTIL

/**
 * Crea una función que se ejecutará después de que haya pasado un tiempo específico desde la última vez que se llamó.
 * Esto es útil para limitar la frecuencia de ejecución de una función, como en el caso de eventos de entrada o actualizaciones.
 * @param {Function} func - La función a ejecutar después del retraso.
 * @param {number} wait - El tiempo de espera en milisegundos.
 * @return {Function} Una función que, cuando se llama, reinicia el temporizador y ejecuta func después de wait milisegundos.
 */
export function debounce(func, wait) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}