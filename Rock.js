import {drawSprite} from "./index.js"
import {GObject} from "./GObject.js"

const State = {
    STOP: 'STOP',
    FALL: 'FALL',
}
const anime_table = {
    STOP: { move_count: 8},
    FALL: { move_count: 8},
};

export class Rock extends GObject {
    constructor(prop) {
        super(prop);
        this.once_falled = false;
    }

    static create(x,y,world) {
        return new Rock({
            x: x,
            y: y,
            w: 8,
            h: 8,
            world: world,
            anime_table: anime_table,
            sprite: 3,
            state: State.STOP,
        });
    }

    update() {
        const action_func = `action_${this.state.toLowerCase()}`;

        if (this[action_func]().finished) {
            if (this.can_fall()) {
                this.change_state(State.FALL);
                this.once_falled = true;
            } else {
                this.change_state(State.STOP);
            }
        }
    }

    can_fall() {
        if (this.world.canStandOn(this.x, this.y+this.h+1))
            return false;
        return true;
    }

    action_stop() {
        return this.count_move(0,0);
    }

    action_fall() {
        return this.count_move(0, 1);
    }

    draw() {
        if (!this.once_falled) {
            drawSprite(2, this.x, this.y, this.flip);
        }
        drawSprite(this.sprite, this.x, this.y, this.flip);
    }

}
