
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