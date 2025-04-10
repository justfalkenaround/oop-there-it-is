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

const warp = (() => {

    window.give_data = target => (
        {
            width: target && target.clientWidth || window.innerWidth,
            height: target && target.clientHeight || window.innerHeight,
            center: {
                x: (target && target.clientWidth || window.innerWidth) / 2,
                y: (target && target.clientHeight || window.innerHeight) / 2
            }
        }
    );

    class Star {
        constructor(options = {}) {
            this._options = options;
        }

        async initialize() {
            this.parent = this._options.parent || null;
            this.target = this._options.target;
            if (!this.target) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this.position = {
                x: (Math.floor(Math.random() * this.window_data.width)),
                y: (Math.floor(Math.random() * this.window_data.height))
            };
            this.velocity = { x: 0, y: 0 };
            this.height = (Math.floor(Math.random() * 3) + 1);
            this.dom_node = document.createElement('gold');
            this.dom_node.classList.add('star');
            this.dom_node.style.height = this.dom_node.style.width = `${this.height}px`;
            this.target.append(this.dom_node);
        }

        async update() {
            this.velocity =
                {
                    x: (this.position.x - this.window_data.center.x) / (this.parent && this.parent.speed || 100),
                    y: (this.position.y - this.window_data.center.y) / (this.parent && this.parent.speed || 100)
                };
            await color('star_update_velocity');
            this.position.x += this.velocity.x;
            await color('star_update_position_x');
            this.position.y += this.velocity.y;
            await color('star_update_position_y');
            await color('star_update_check_collisions');
            if (
                this.position.x < 0
                ||
                this.position.x > this.window_data.width
                ||
                this.position.y < 0
                ||
                this.position.y > this.window_data.height
            ) {
                await color('star_update_reset');
                await this.reset();
            }
        }

        async render() {
            this.dom_node.style.left = `${this.position.x}px`;
            await color('star_render_x');
            this.dom_node.style.top = `${this.position.y}px`;
            await color('star_render_y');
        }

        async reset() {
            this.position =
                {
                    x: (Math.floor(Math.random() * (this.window_data.width / 2)) + (this.window_data.width / 4)),
                    y: (Math.floor(Math.random() * (this.window_data.height / 2)) + (this.window_data.height / 4)),
                };
            this.height = (Math.floor(Math.random() * 3) + 1);
            this.dom_node.style.height = this.dom_node.style.width = `${this.height}px`;
            await color('star_reset');
        }

        get window_data() {
            return this.parent && this.parent.window_data || window.give_data(this.target);
        }
    }

    class Space {
        constructor(options = {}) {
            this._options = options;
            this._initialize();
        }

        async _initialize() {
            this.target = this._options.target;
            if (!this.target) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this.window_data = window.give_data(this.target);
            this.speed = this._options.speed || 100;
            this.quantity = this._options.quantity || 800;
            this.stars = new Array(this.quantity)
                .fill(null)
                .map(v => new Star({ target: this.target, parent: this }));
            for await (let v of this.stars) {
                await v.initialize()
            }
            this._repeat();
        }

        async _update() {
            this.speed -= 0.06;
            await color('space_update_speed');
            this.window_data = window.give_data(this.target);
            await color('space_update_window_data');
            await color('space_update_loop');
            for await (let v of this.stars) {
                await v.update()
            }
            await color('space_update_check_speed');
            if (this.speed < -5) {
                await color('space_update_reset');
                await this.reset();
            }
        }

        async _render() {
            await color('space_render_loop');
            for await (let v of this.stars) {
                await v.render()
            }
        }

        async _repeat() {
            await color('space_repeat_update');
            await this._update();
            await color('space_repeat_render');
            await this._render();
            window.requestAnimationFrame(() => this._repeat());
        }

        async reset() {
            this.speed = this._options.speed || 100;
            await color('space_reset_speed');
            await color('space_reset_loop');
            for await (let v of this.stars) {
                await v.reset()
            }
        }
    }

    return {
        Space,
        Star
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    new warp.Space({
        speed: 10,
        quantity: 20,
        target: document.querySelector('.warp_target')
    });
});