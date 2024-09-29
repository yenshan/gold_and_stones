import { SpriteSheet } from "./SpriteSheet.js"
import { UserInput } from "./UserInput.js"
import { Chara } from "./Chara.js"
import { World } from "./World.js"

const GAME_UPDATE_INTERVAL_MSEC = 30;

// background canvas
const canvas_bg = document.getElementById('canvasBg');
const context_bg = canvas_bg.getContext('2d');
const SCREEN_W = canvas_bg.width / 8
const SCREEN_H = canvas_bg.height / 8

// display canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const State = {
    INIT_GAME: 'INIT',
    TITLE: 'TITLE',
    LEAVE_TITLE: 'LEAVE_TITLE',
    GAME: 'GAME',
    INIT_STAGE: 'INIT_STAGE',
    STAGE_CLEAR: 'STAGE_CLEAR',
}

const spsheet = new SpriteSheet(8, 8, "./assets/spritesheet.png");

export const input = new UserInput(document);

const titleImage = new Image();
titleImage.src = "./assets/title.png";

let state = State.INIT_GAME;
let stages = [];
let world;

// load stage data
const res = await fetch("./assets/stages.json");
if (res.ok) {
    const data = await res.json();
    stages = data.maps;
}

class Animation {
    constructor(frames, func) {
        this.num_of_frames = frames;
        this.frame = 0;
        this.func = func;
    }
    play(func) {
        this.frame++;
        if (this.frame > this.num_of_frames) {
            return {finished: true};
        }
        this.func(this.num_of_frames, this.frame);
        return {finished: false};
    }
}

export function drawSprite(sprite_no, x, y, flip) {
    spsheet.drawSprite(context_bg, sprite_no, x, y, flip);
}

function draw_title() {
    context.drawImage(titleImage,0,0,450,360, canvas.width*5/20, canvas.height/20, 450*4/5, 360*4/5);
}

let text_display = true;
function draw_text_center(text, col, row, blink=false) {
    if (wait_seconds(0.5)) {
        if (blink) {
            text_display = !text_display;
        }
    }
    if (!blink || text_display) {
        context.save();

        context.fillStyle = "#fff";
        context.font = 'bold 24px Consolas, "Courier New", monospace';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        let text_w = context.measureText(text).width;
        context.fillText(text, canvas.width/20*col, canvas.height/14*row);

        context.restore();
    }
}

let wait_count = 0;
function wait_seconds(seconds) {
    if (wait_count < seconds*(1000/GAME_UPDATE_INTERVAL_MSEC)) {
        wait_count++;
        return false;
    }
    wait_count = 0;
    return true;
}

function clear_background() {
    context_bg.clearRect(0, 0, canvas_bg.width, canvas_bg.height);
}

function enlarge_and_display(src_canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(src_canvas, 0, 0, src_canvas.width, src_canvas.height, 0, 0, canvas.width, canvas.height);
}

function clip_circle(radius) {
    context.save();

    context.beginPath();
    const cX = 320;
    const cY = 200;
    context.arc(cX, cY, radius, 0, Math.PI * 2);
    context.clip();

    context.drawImage(canvas_bg, 0, 0, canvas_bg.width, canvas_bg.height, 0, 0, canvas.width, canvas.height);

    context.restore();
}

function anim_clip_shurink(num_of_frames, frame) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    clip_circle(5 * (num_of_frames-frame));
}

function anim_clip_enlarge(num_of_frames, frame) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    clip_circle(5 * frame);
}

function game_update() {
    clear_background();
    world.update();
    world.draw();
    enlarge_and_display(canvas_bg);
    draw_text_center("[R] RESTART STAGE", 0, 13);
}


let trans_anim;

function update() {
    switch(state) {
    case State.INIT_GAME:
        world = new World(SCREEN_W, SCREEN_H, stages[0].data);
        state = State.TITLE;
        break;
    case State.TITLE:
        world.draw();
        enlarge_and_display(canvas_bg);
        draw_title();
        draw_text_center("Press 's' Key to Start.", 5, 11, true);
        if (input.start) {
            state = State.LEAVE_TITLE; 
            trans_anim = new Animation(70, anim_clip_shurink);
        }
        break;
    case State.LEAVE_TITLE:
        if (trans_anim.play().finished) {
            state = State.INIT_STAGE;
            trans_anim = new Animation(70, anim_clip_enlarge);
        }
        break;
    case State.INIT_STAGE:
        world = new World(SCREEN_W, SCREEN_H, stages[0].data);
        world.draw();
        if (trans_anim.play().finished) {
            state = State.GAME;
        }
        break;
    case State.GAME:
        game_update();
        if (world.isGameClear()) {
            state = State.STAGE_CLEAR;
            trans_anim = new Animation(70, anim_clip_shurink);
        }
        if (input.reset) {
            state = State.LEAVE_TITLE;
            trans_anim = new Animation(70, anim_clip_shurink);
        }
        break;
    case State.STAGE_CLEAR:
        if (trans_anim.play().finished) {
            state = State.INIT_GAME;
        }
        break;
    }
}

setInterval(update, GAME_UPDATE_INTERVAL_MSEC);

