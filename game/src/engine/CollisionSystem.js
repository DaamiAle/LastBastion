

export class CollisionSystem {


    constructor(scene) {
        this.scene = scene;

    }


    resolveCollisions() {
        const entities = this.scene.entities;

        for (let i = 0; i < entities.length; i++) {
            const a = entities[i];
            if (!a.collider) continue;

            for (let j = i + 1; j < entities.length; j++) {
                const b = entities[j];
                if (!b.collider) continue;

                this.solvePair(a, b);
            }
        }
    }

    solvePair(a, b) {
        if (!this.shouldCollide(a, b)) return;

        // circle vs circle
        if (a.collider.type == "circle" && b.collider.type == "circle") {
            this.solveCircleCircle(a, b);
            return;
        }

        // circle vs AABB
        if (a.collider.type == "circle" && b.collider.type == "aabb") {
            this.solveCircleAABB(a, b);
            return;
        }

        if (a.collider.type == "aabb" && b.collider.type == "circle") {
            this.solveCircleAABB(b, a);
            return;
        }
    }

    solveCircleCircle(a, b) {
        const ax = a.container.x;
        const ay = a.container.y;

        const bx = b.container.x;
        const by = b.container.y;

        const dx = bx - ax;
        const dy = by - ay;

        const distSq = dx * dx + dy * dy;
        if (distSq === 0) return;

        const dist = Math.sqrt(distSq);

        const minDist = a.collider.radius + b.collider.radius;

        if (dist < minDist) {
            const overlap = minDist - dist;

            const nx = dx / dist;
            const ny = dy / dist;

            // separación mitad y mitad
            a.container.x -= nx * overlap * 0.5;
            a.container.y -= ny * overlap * 0.5;

            b.container.x += nx * overlap * 0.5;
            b.container.y += ny * overlap * 0.5;
        }
    }

    solveCircleAABB(circleEntity, boxEntity) {
        const cx = circleEntity.container.x;
        const cy = circleEntity.container.y;

        const bx = boxEntity.container.x;
        const by = boxEntity.container.y;

        const hw = boxEntity.collider.halfWidth;
        const hh = boxEntity.collider.halfHeight;

        // punto más cercano del rect al círculo
        const closestX = Math.max(bx - hw, Math.min(cx, bx + hw));
        const closestY = Math.max(by - hh, Math.min(cy, by + hh));

        const dx = cx - closestX;
        const dy = cy - closestY;

        const distSq = dx * dx + dy * dy;
        const r = circleEntity.collider.radius;

        if (distSq < r * r) {
            const dist = Math.sqrt(distSq) || 0.0001;
            const overlap = r - dist;

            const nx = dx / dist;
            const ny = dy / dist;

            // empujar SOLO al círculo (la fortress es estática)
            circleEntity.container.x += nx * overlap;
            circleEntity.container.y += ny * overlap;
        }
    }


    shouldCollide(a, b) {
        // zombies vs fortress ✔
        if (a.type == "zombie" && b.type == "fortress") return true;
        if (a.type == "fortress" && b.type == "zombie") return true;

        // zombies vs player ✔
        if (a.type == "zombie" && b.type == "player") return true;
        if (a.type == "player" && b.type == "zombie") return true;

        // zombies entre sí ✔
        if (a.type == "zombie" && b.type == "zombie") return true;

        // player vs fortress ❌ (permitido)
        return false;
    }

    isColliding(a, b) {
        // circle vs circle
        if (a.collider.type == "circle" && b.collider.type == "circle") {
            const dx = b.container.x - a.container.x;
            const dy = b.container.y - a.container.y;

            const distSq = dx * dx + dy * dy;
            const minDist = a.collider.radius + b.collider.radius;

            return distSq < minDist * minDist;
        }

        // circle vs AABB
        if (a.collider.type == "circle" && b.collider.type == "aabb") {
            return this.circleAABBOverlap(a, b);
        }

        if (a.collider.type == "aabb" && b.collider.type == "circle") {
            return this.circleAABBOverlap(b, a);
        }

        return false;
    }

    processContacts() {
        const entities = this.scene.entities;

        for (let i = 0; i < entities.length; i++) {
            const a = entities[i];
            if (!a.collider) continue;

            for (let j = i + 1; j < entities.length; j++) {
                const b = entities[j];
                if (!b.collider) continue;

                if (!this.shouldCollide(a, b)) continue;

                if (this.isColliding(a, b)) {
                    this.handleContact(a, b);
                }
            }
        }
    }
}