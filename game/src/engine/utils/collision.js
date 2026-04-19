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