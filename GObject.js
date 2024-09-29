import {drawSprite} from "./index.js"

export class GObject {
    constructor(prop) {
        this.x = prop.x;
        this.y = prop.y;
        this.w = prop.w;
        this.h = prop.h;
        this.sprite = prop.sprite;
        this.world = prop.world;
        this.anime_table = prop.anime_table;
        this.state = prop.state;
        this.move_count = 0;
        this.flip = false;
        this.anime_count = 0;
        this.anime_index = 0;
    }

    change_state(state) {
        this.state = state;
        this.move_count = this.anime_table[this.state].move_count;
    }

    count_move(dx, dy) {
        this.move_count--;
        if (this.move_count < 0) {
            return {finished: true};
        }
        this.x += dx;
        this.y += dy;
        return {finished: false};
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y, this.flip);
    }

}
