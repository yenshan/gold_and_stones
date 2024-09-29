import {drawSprite} from "./index.js"
import { Rock } from "./Rock.js"
import { Chara } from "./Chara.js"

const MAP_ELEM_SIZE = 8;

const Elem = {
    NONE: 0,
    BLOCK: 1,
    SOIL: 2,
    ROCK: 3,
    VINE: 4,
    GOLD: 5,
    HOLE: 6,
    GOAL: 7,
    PLAYER: 9,
}

const ENone = {
    can_go_through: true,
    can_up: false,
    can_stand_on: false,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.NONE,
}

const ESoil = {
    can_go_through: true,
    can_up: false,
    can_stand_on: true,
    can_pick_up: false,
    can_dig: true,
    sprite_no: Elem.SOIL,
}

const EBlock = {
    can_go_through: false,
    can_up: false,
    can_stand_on: true,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.BLOCK,
}

const ERock = {
    can_go_through: false,
    can_up: false,
    can_stand_on: true,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.ROCK,
}

const EVine = {
    can_go_through: true,
    can_up: true,
    can_stand_on: true,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.VINE,
}

const EGold = {
    can_go_through: true,
    can_up: false,
    can_stand_on: true,
    can_pick_up: true,
    can_dig: true,
    sprite_no: Elem.GOLD,
}

const EHole = {
    can_go_through: true,
    can_up: false,
    can_stand_on: false,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.HOLE,
}

const EGoal = {
    can_go_through: true,
    can_up: true,
    can_stand_on: true,
    can_pick_up: false,
    can_dig: false,
    sprite_no: Elem.GOAL,
}

function map_pos(prop) {
    return {
        x: Math.floor(prop.x/MAP_ELEM_SIZE),
        y: Math.floor(prop.y/MAP_ELEM_SIZE)
    }
}
function is_same_pos(o1, o2) {
    return o1.x == o2.x && o1.y == o2.y;
}

function createElem(id) {
    switch(id) {
    case Elem.NONE: return ENone;
    case Elem.SOIL: return ESoil;
    case Elem.BLOCK: return EBlock;
    case Elem.VINE: return EVine;
    case Elem.GOLD: return EGold;
    case Elem.HOLE: return EHole;
    case Elem.GOAL: return EGoal;
    case Elem.PLAYER: return ENone;
    default: return EHole;
    }
}

function createMap(m) {
    let dat = [];
    for (let i = 0; i < m.length; i++) {
        dat[i] = createElem(m[i]);
    }
    return dat;
}

function count_golds(m) {
    let cnt = 0;
    for (let o of m) {
        if (o == Elem.GOLD)
            cnt++;
    }
    return cnt;
}

export class World {
    constructor(w,h, data) {
        this.w = w;
        this.h = h;
        this.map = createMap(data);
        this.player = this.createPlayer(w,h,data);
        this.rock_list = this.createRock(w,h,data);
        this.num_of_golds = count_golds(data);
    }

    createPlayer(w, h, data) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (data[x + y*w] == Elem.PLAYER)
                    return Chara.create(x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE, this);
            }
        }
    }
    createRock(w,h,data) {
        let list = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (data[x + y*w] == Elem.ROCK)
                    list.push(Rock.create(x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE, this));
            }
        }
        return list;
    }

    get_obj(x,y) {
        const p = map_pos({x,y});
        return this.map[p.x + p.y*this.w];
    }

    canGoThrough(x,y) {
        if (x < 0 || x > this.w*MAP_ELEM_SIZE)
            return false;
        if (this.isHitRock(x,y))
            return false;
        return this.get_obj(x,y).can_go_through;
    }

    canStandOn(x,y) {
        if (this.isHitRock(x,y))
            return true;
        if (this.isHitPlayer(x,y))
            return true;
        return this.get_obj(x,y).can_stand_on;
    }

    isHitRock(x,y) {
        let so = map_pos({x,y});
        for (let r of this.rock_list) {
            let to = map_pos({x: r.x, y: r.y+r.h/2});
            if (is_same_pos(so,to))
                return true;
        }
        return false;
    }

    isHitPlayer(x,y) {
        return is_same_pos(map_pos({x,y}), map_pos(this.player));
    }

    canUp(x,y) {
        return this.get_obj(x,y).can_up;
    }

    canDig(x,y) {
        return this.get_obj(x,y).can_dig;
    }

    isGold(x,y) {
        return this.get_obj(x,y).sprite_no == Elem.GOLD;
    }

    isGameClear() {
        let is_on_goal = this.get_obj(this.player.x, this.player.y).sprite_no == Elem.GOAL;
        return is_on_goal && this.player.hold_golds == this.num_of_golds
    }

    dig(x,y) {
        const p = map_pos({x,y});
        this.map[p.x + p.y*this.w] = EHole;
    }

    update() {
        this.player.update();
        this.rock_list.map(o => o.update());
    }

    draw_map() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
               let sno = this.map[x+y*this.w].sprite_no;
               drawSprite(sno, x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE);
            }
        }
    }

    draw() {
        this.draw_map();
        this.player.draw();
        this.rock_list.map(o => o.draw());
    }
}

