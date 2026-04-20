

export function areCirclesColliding(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const r = a.radius + b.radius;

    return dx * dx + dy * dy < r * r;
}

export function areCircleAndBoxColliding(circle, box) {
    const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
    const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx * dx + dy * dy < circle.radius * circle.radius;
}

export function areBoxesColliding(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}