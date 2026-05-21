// src/game/config/collisionMatrix.js
export const collisionMatrix = {
    player: {
        enemy: { collide: true }
    },
    enemy: {
        player: { collide: true }
    }
};