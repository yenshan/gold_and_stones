import {GObject} from "./GObject.js"
import {drawSprite, input} from "./index.js"

const State = {
    STOP: 'STOP',
    MOVE_LEFT : 'MOVE_LEFT',
    MOVE_RIGHT: 'MOVE_RIGHT',
    MOVE_UP : 'MOVE_UP',
    MOVE_DOWN : 'MOVE_DOWN',
    FALL: 'FALL',
}

const anime_table =  {
    STOP: {move_count: 0, frames: [16], frame_interval: 60},
    MOVE_LEFT: {move_count: 8, frames: [16,17], frame_interval: 2},
    MOVE_RIGHT: { move_count: 8, frames: [16,17], frame_interval: 2},
    MOVE_UP: {move_count: 8, frames: [18,19], frame_interval: 2},
    MOVE_DOWN: {move_count: 8, frames: [20,21], frame_interval: 2},
    FALL: {move_count: 8, frames: [16,17], frame_interval: 2},
};

export class Chara extends GObject {
    constructor(prop) {
        super(prop);
        this.hold_golds = 0;
    }

    static create(x, y, world) {
        return new Chara({
            x: x,
            y: y,
            w: 8,
            h: 8,
            world: world,
            anime_table: anime_table,
            state: State.STOP,
        });
    }

    update() {
        const action_func = `action_${this.state.toLowerCase()}`;

        if (this[action_func]().finished) {
            if (this.world.isGold(this.x, this.y)) {
                this.hold_golds++;
                this.world.dig(this.x, this.y);
            }
            if (this.world.canDig(this.x, this.y)) {
                this.world.dig(this.x, this.y);
            }
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                this.check_stop();
                if (input.left) {
                    this.check_move_left();
                }
                if (input.right) {
                    this.check_move_right();
                }
                if (input.up) {
                    this.check_move_up();
                }
                if (input.down) {
                    this.check_move_down();
                }
            }
        }

        this.anime_update();
    }

    can_fall() {
        if (this.world.canStandOn(this.x, this.y+this.h+1))
            return false;
        if (this.world.canUp(this.x, this.y))
            return false;
        return true;
    }

    check_stop() {
        this.change_state(State.STOP);
    }

    check_move_right() {
        if (!this.world.canGoThrough(this.x+this.w+1, this.y))
            return;
        this.change_state(State.MOVE_RIGHT);
        this.flip = false;
    }

    check_move_left() {
        if (!this.world.canGoThrough(this.x-1, this.y))
            return;
        this.change_state(State.MOVE_LEFT);
        this.flip = true;
    }

    check_move_up() {
        if (!this.world.canUp(this.x, this.y)) 
            return;
        if (!this.world.canGoThrough(this.x, this.y-1)) 
            return;
        this.change_state(State.MOVE_UP);
    }

    check_move_down() {
        if (!this.world.canGoThrough(this.x, this.y+this.h+1))
            return;
        this.change_state(State.MOVE_DOWN);
    }

    action_fall() {
        return this.count_move(0, 1);
    }

    action_stop() {
        return this.count_move(0,0);
    }

    action_move_left() {
        return this.count_move(-1, 0);
    }

    action_move_right() {
        return this.count_move(1, 0);
    }
    action_move_up() {
        return this.count_move(0, -1);
    }

    action_move_down() {
        return this.count_move(0, 1);
    }

    anime_update() {
        let frames = this.anime_table[this.state].frames;
        let frame_interval = this.anime_table[this.state].frame_interval;

        if (this.anime_count >= frame_interval) {
            this.anime_index++;
            this.anime_count = 0;
        }

        if (this.anime_index >= frames.length)
            this.anime_index = 0;

        this.sprite = frames[this.anime_index];
        this.anime_count++;
    }
}

