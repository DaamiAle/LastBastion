// engine/system/collision/CollisionDispatcher.js

import * as C from '../../utils/collision.js';

const DISPATCH = {
    'circle:circle': C.areCirclesColliding,
    'box:box': C.areBoxesColliding,
    'circle:box': C.areCircleAndBoxColliding
};

function key(a, b) {
    return `${a}:${b}`;
}

function getFn(typeA, typeB) {
    let fn = DISPATCH[key(typeA, typeB)];
    if (fn) return { fn, swap: false };

    fn = DISPATCH[key(typeB, typeA)];
    if (fn) return { fn, swap: true };

    return null;
}

function buildShape(collider, transform) {
    const x = transform.position.x;
    const y = transform.position.y;

    if (collider.type === 'circle') {
        return { x, y, radius: collider.radius };
    }

    if (collider.type === 'box') {
        return {
            x,
            y,
            width: collider.width,
            height: collider.height
        };
    }
}

export function areCollidersColliding(ca, ta, cb, tb) {
    const entry = getFn(ca.type, cb.type);
    if (!entry) return false;

    const a = buildShape(ca, ta);
    const b = buildShape(cb, tb);

    return entry.swap
        ? entry.fn(b, a)
        : entry.fn(a, b);
}