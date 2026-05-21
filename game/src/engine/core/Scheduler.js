// src/engine/core/Scheduler.js

export class Scheduler {
    constructor() {
        this.tasks = [];
    }

    update(time) {
        const dt = time.deltaTime;

        if (dt === 0) return; // pausa automática

        for (let i = this.tasks.length - 1; i >= 0; i--) {
            const task = this.tasks[i];

            task.time -= dt;

            if (task.time <= 0) {
                task.callback();

                if (task.repeat) {
                    task.time += task.interval;
                } else {
                    this.tasks.splice(i, 1);
                }
            }
        }
    }

    after(seconds, callback) {
        this.tasks.push({
            time: seconds,
            callback,
            repeat: false
        });
    }

    every(seconds, callback) {
        this.tasks.push({
            time: seconds,
            interval: seconds,
            callback,
            repeat: true
        });
    }

    clear() {
        this.tasks.length = 0;
    }
}