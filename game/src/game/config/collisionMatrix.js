// src/game/config/collisionMatrix.js
export const collisionMatrix = {
    player: {
        enemy: { collide: true, resolve: true }
    },
    enemy: {
        player: { collide: true, resolve: true },
        enemy: { collide: true, resolve: true }
    }
};