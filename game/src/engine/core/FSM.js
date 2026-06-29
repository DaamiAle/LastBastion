export class FSM {
    constructor(owner) {
        this.owner = owner;
        this.current = null;
    }

    change(state) {
        if (this.current) {
            this.current.exit();
        }

        this.current = state;

        if (this.current) {
            this.current.enter();
        }
    }

    update(delta) {
        if (this.current) {
            this.current.update(delta);
        }
    }
}