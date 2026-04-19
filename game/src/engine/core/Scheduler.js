export class Scheduler {
    constructor() {
        this.tasks = [];
    }

    update(deltaTime) {
        for (let i = this.tasks.length - 1; i >= 0; i--) {
            const task = this.tasks[i];

            task.time -= deltaTime;
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