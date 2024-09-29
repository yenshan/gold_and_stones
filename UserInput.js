
const keyMap = {
    'j': 'left',
    'l': 'right',
    'i': 'up',
    'm': 'down',
    'c': 'A',
    'x': 'Y',
    'r': 'reset',
    's': 'start',
}

const btnMap = {
    0: 'B',
    1: 'A',
    2: 'Y',
    3: 'X',
    8: 'reset',
    9: 'start',
    12: 'up',
    13: 'down',
    14: 'left',
    15: 'right',
}

class GamePad {
    constructor(no) {
        this.no = no;
        this.prev_pressed = [];
        this.listener_list = { 'pressed': [], 'released': [] }

        this.updateGamepadStatus = this.updateGamepadStatus.bind(this);
        requestAnimationFrame(this.updateGamepadStatus);
    }

    addEventListener(type, listener) {
        this.listener_list[type].push(listener);
    }

    notify_event(type, e) {
        let listeners = this.listener_list[type];
        for (let func of listeners) {
            func(e);
        }
    }

    updateGamepadStatus() {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.no];

        if (gamepad) {
            // ボタンの状態をチェック
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    if(!this.prev_pressed[index]) {
                        this.notify_event("pressed", { index: index });
                        this.prev_pressed[index] = true;
                    }
                } else {
                    if(this.prev_pressed[index]) {
                        this.notify_event("released", { index: index });
                        this.prev_pressed[index] = false;
                    }
                }
            });
        }

        // 次のフレームでまたポーリングを実行
        requestAnimationFrame(this.updateGamepadStatus);
    }
}

let gamepad = new GamePad(0);

export class UserInput {
    constructor(doc) {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.A = false;
        this.B = false;
        this.reset = false;
        this.start = false;
        this.prev_pressed = null;
        this.available_inputs = Object.values(keyMap);

        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.btnDownHandler = this.btnDownHandler.bind(this);
        this.btnUpHandler = this.btnUpHandler.bind(this);

        doc.addEventListener('keydown', this.keyDownHandler, false);
        doc.addEventListener('keyup', this.keyUpHandler, false);

        gamepad.addEventListener("pressed", this.btnDownHandler);
        gamepad.addEventListener("released", this.btnUpHandler);
    }

    clearInputs() {
        for (let prop of Object.values(keyMap)) {
            this[prop] = false;
        }
    }

    set_key_input(key, val) {
        const prop = keyMap[key];
        if (this.available_inputs.includes(prop)) {
            this[prop] = val;
        }
    }

    set_btn_input(index, val) {
        const prop = btnMap[index];
        if (this.available_inputs.includes(prop)) {
            this[prop] = val;
        }
    }

    setInputFilter(list) {
        if (list==null)
            list = Object.values(keyMap);
        this.available_inputs = list;
    }

    keyDownHandler(event) {
        this.set_key_input(event.key, true);
    }

    keyUpHandler(event) {
        this.set_key_input(event.key, false);
    }

    btnDownHandler(event) {
        this.set_btn_input(event.index, true);
    }

    btnUpHandler(event) {
        this.set_btn_input(event.index, false);
    }

}
