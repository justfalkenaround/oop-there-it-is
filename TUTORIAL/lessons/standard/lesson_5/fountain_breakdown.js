'use strict';

let code_speed = 500;
let code_speed_original = 500;

const range = document.querySelector('input[type=range]');

const calc_range = e => code_speed = code_speed_original / Math.pow(range.value, 2);

range && range.addEventListener('change', calc_range);

calc_range();

const color = async s => {
    const pre = document.querySelector('.visual_breakdown_pre');
    const work_base = pre ? Array.from(pre.querySelectorAll('[data-state]')) : [];
    if (!pre) {
        return;
    }
    work_base.forEach(v => v.classList.remove('green', 'red', 'yellow', 'blue'));
    work_base.filter(v => v.dataset.state === s)
        .forEach(v => v.classList.add(v.dataset.state.includes('check') ? 'yellow' : 'red'));
    await new Promise(resolve => window.setTimeout(() => resolve(), code_speed));
};

const fountain = (() => {
    const give_data = target => {
        const
            width = target && target.clientWidth,
            height = target && target.clientHeight;
        return { width, height, center: { x: width / 2, y: height / 2 } };
    };

    class Interface {
        constructor(options = {}) {
            this._options = options;
            this.parent = options.parent || null;
        }

        initialize() { }

        update() { }

        render() { }

        reset() { }

        get root() {
            return this.parent && this.parent.root || this;
        }

        get canvas() {
            return this.root.canvas;
        }

        get context() {
            return this.root.context;
        }

        get hold() {
            return this.root.hold;
        }
    }

    class Element extends Interface {
        async initialize() {
            if (!this.parent) {
                throw new Error(`${this.constructor.name}: NO PARENT - REQUIRES PARENT`);
            }
            this.waiting = this.hold;
            this.reset()
        }

        async update() {
            await color('element_check_bounds');
            if (this.position.y > this.canvas.height || this.position.y < 0) {
                await color('element_out_of_bounds');
                this.reset()
                await color('element_check_hold');
                if (this.hold) {
                    await color('element_suspend');
                    this.velocity = { x: 0, y: 0 };
                    this.waiting = true;
                }
            }
            await color('element_check_waiting');
            if (!this.hold && this.waiting) {
                await color('element_not_waiting');
                this.reset();
                this.waiting = false;
            }
            await color('element_state_1');
            this.position.x += this.velocity.x;
            await color('element_state_2');
            this.position.y += this.velocity.y;
            await color('element_state_3');
            this.velocity.y += 0.1;
        }

        async render() {
            await color('element_color');
            this.context.fillStyle = this.color;
            await color('element_save');
            this.context.save();
            await color('element_translate');
            this.context.translate(this.position.x, this.position.y);
            await color('element_scale');
            this.context.scale(this.root.scale, this.root.scale);
            await color('element_begin_path');
            this.context.beginPath();
            /* CREDIT TO DEV-DOCS FOR HEART PATTERN */
            await color('element_path_1');
            this.context.moveTo(7.5, 4.0);
            await color('element_path_2');
            this.context.bezierCurveTo(7.5, 3.7, 7.0, 2.5, 5.0, 2.5);
            this.context.fill();
            await color('element_path_3');
            this.context.bezierCurveTo(2.0, 2.5, 2.0, 6.25, 2.0, 6.25);
            this.context.fill();
            await color('element_path_4');
            this.context.bezierCurveTo(2.0, 8.0, 4.0, 10.2, 7.5, 12.0);
            this.context.fill();
            await color('element_path_5');
            this.context.bezierCurveTo(11.0, 10.2, 13.0, 8.0, 13.0, 6.25);
            this.context.fill();
            await color('element_path_6');
            this.context.bezierCurveTo(13.0, 6.25, 13.0, 2.5, 10.0, 2.5);
            this.context.fill();
            await color('element_path_7');
            this.context.bezierCurveTo(8.5, 2.5, 7.5, 3.7, 7.5, 4.0);
            this.context.fill();
            /* CREDIT TO DEV-DOCS FOR HEART PATTERN */
            await color('element_fill');
            this.context.fill();
            await color('element_restore');
            this.context.restore()
        }

        async reset() {
            this.position = { x: (this.canvas.width / 2), y: this.canvas.height };
            this.velocity = { x: this._determine_x(), y: ((Math.random() * -20) - 1) };
            this.color = `rgb(255, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`;
        }

        _determine_x() {
            return +`${Math.random() > 0.5 ? '-' : '+'}${Math.random() * 1.5}`;
        }
    }

    class Manager extends Interface {
        constructor(options) {
            super(options)
            this._initialize();
        }

        async _initialize() {
            this.target = this._options.target;
            if (!this.target || !(this.target instanceof HTMLElement)) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this._canvas = document.createElement('canvas');
            this._context = this.canvas.getContext('2d');
            this.target.append(this._canvas);
            window.addEventListener('resize', () => this._resize());
            this._resize()
            this.quantity = this._options.quantity || 1000;
            this.scale = this._options.scale || 1;
            this.children = new Array(this.quantity)
                .fill(null)
                .map(v => new Element({ parent: this }));
            this.children.forEach(v => v.initialize());
            this.mousehold = false;
            this.keyhold = false;
            this.touchhold = false;
            document.addEventListener('mousedown', () => this.mousehold = true)
            document.addEventListener('touchstart', () => this.touchhold = true)
            document.addEventListener('keydown', () => this.keyhold = true)
            document.addEventListener('mouseup', () => this.mousehold = false)
            document.addEventListener('touchend', () => this.touchhold = false)
            document.addEventListener('keyup', () => this.keyhold = false)
            this._repeat();
        }

        async _update() {
            await color('manager_update');
            for await (let v of this.children) {
                await v.update()
            }
        }

        async _render() {
            await color('manager_clear');
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            await color('manager_render');
            for await (let v of this.children) {
                await v.render()
            }
        }

        async _repeat() {
            await color('manager_repeat_update');
            await this._update();
            await color('manager_repeat_render');
            await this._render();
            window.requestAnimationFrame(() => this._repeat());
        }

        async _resize() {
            const { width, height } = give_data(this.target);
            this._canvas.width = width;
            this._canvas.height = height;
        }

        get hold() {
            return this.mousehold || this.touchhold || this.keyhold;
        }

        get canvas() {
            return this._canvas;
        }

        get context() {
            return this._context;
        }

    }

    return {
        Manager
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.fountain-target')).forEach(target => {
        new fountain.Manager({
            scale: +target.dataset.scale,
            quantity: +target.dataset.quantity,
            target
        });
    });
});