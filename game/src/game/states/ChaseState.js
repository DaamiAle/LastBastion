import { State } from '../../engine/State.js';
import { clamp, distanceSq } from '../../engine/Utils.js';
import { AttackState } from './AttackState.js';

export class ChaseState extends State {
    update(delta) {
        const zombie = this.owner;
        const scene = zombie.scene;
        const config = scene.game.config.zombies;
        const stimulus = scene.findZombieStimulus(zombie);

        zombie.target = stimulus.entity ?? null;
        zombie.targetPoint = stimulus.point ?? null;
        zombie.lastHeardNoiseId = stimulus.noiseId ?? null;

        if (zombie.target) {
            const targetRadius = zombie.target.radius ?? 0;
            const engageRange = zombie.attackRange + targetRadius;
            const distSq = distanceSq(
                zombie.container.x,
                zombie.container.y,
                zombie.target.container.x,
                zombie.target.container.y
            );

            if (distSq <= engageRange * engageRange) {
                zombie.fsm.change(new AttackState(zombie));
                return;
            }
        }

        const targetX = zombie.target ? zombie.target.container.x : zombie.targetPoint.x;
        const targetY = zombie.target ? zombie.target.container.y : zombie.targetPoint.y;

        const zx = zombie.container.x;
        const zy = zombie.container.y;
        const dx = targetX - zx;
        const dy = targetY - zy;
        const dist = Math.hypot(dx, dy) || 1;

        let seekX = dx / dist;
        let seekY = dy / dist;

        if (stimulus.kind === 'wander') {
            seekX *= 0.55;
            seekY *= 0.55;
        }

        let separationX = 0;
        let separationY = 0;
        let alignmentX = 0;
        let alignmentY = 0;
        let cohesionX = 0;
        let cohesionY = 0;
        let count = 0;

        const neighbors = scene.grid.queryRadius(zx, zy, zombie.flockRadius);
        for (const neighbor of neighbors) {
            if (neighbor === zombie || neighbor.type !== 'zombie') continue;

            const ndx = zx - neighbor.container.x;
            const ndy = zy - neighbor.container.y;
            const neighborDistSq = ndx * ndx + ndy * ndy;

            if (neighborDistSq <= 0.0001 || neighborDistSq > zombie.flockRadius * zombie.flockRadius) continue;

            separationX += ndx / neighborDistSq;
            separationY += ndy / neighborDistSq;
            alignmentX += neighbor.velocityX ?? 0;
            alignmentY += neighbor.velocityY ?? 0;
            cohesionX += neighbor.container.x;
            cohesionY += neighbor.container.y;
            count++;
        }

        let steerX = seekX * zombie.seekWeight;
        let steerY = seekY * zombie.seekWeight;

        if (count > 0) {
            separationX /= count;
            separationY /= count;
            alignmentX /= count;
            alignmentY /= count;
            cohesionX = (cohesionX / count) - zx;
            cohesionY = (cohesionY / count) - zy;

            steerX += separationX * zombie.separationWeight;
            steerY += separationY * zombie.separationWeight;
            steerX += alignmentX * zombie.alignmentWeight;
            steerY += alignmentY * zombie.alignmentWeight;
            steerX += cohesionX * 0.01 * zombie.cohesionWeight;
            steerY += cohesionY * 0.01 * zombie.cohesionWeight;
        }

        const steerLen = Math.hypot(steerX, steerY) || 1;
        zombie.velocityX = steerX / steerLen;
        zombie.velocityY = steerY / steerLen;

        const speedScale = stimulus.kind === 'noise'
            ? config.noiseSpeedMultiplier
            : (stimulus.kind === 'wander' ? config.wanderSpeedMultiplier : 1);
        const speed = zombie.speed * speedScale * (delta.deltaMS / 1000);

        zombie.container.x += zombie.velocityX * speed;
        zombie.container.y += zombie.velocityY * speed;
        scene.keepEntityOutsideFortress(zombie, 6);
        zombie.container.x = clamp(zombie.container.x, config.collisionPadding, scene.worldWidth - config.collisionPadding);
        zombie.container.y = clamp(zombie.container.y, config.collisionPadding, scene.worldHeight - config.collisionPadding);
    }
}
