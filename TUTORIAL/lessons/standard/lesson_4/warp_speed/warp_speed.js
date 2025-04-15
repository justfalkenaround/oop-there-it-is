'use strict';

const warp = (() => {

    const give_data = target => {
        const
            width = target && target.clientWidth || window.innerWidth,
            height = target && target.clientHeight || window.innerHeight;
        return { width, height, center: { x: width / 2, y: height / 2 } };
    };

    class Star {
        constructor(options = {}) {
            this._options = options;
        }

        initialize() {
            this.parent = this._options.parent || null;
            this.target = this._options.target;
            if (!this.target || !(this.target instanceof HTMLElement)) {
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

        update() {
            this.velocity =
            {
                x: (this.position.x - this.window_data.center.x) / (this.parent && this.parent.speed || 100),
                y: (this.position.y - this.window_data.center.y) / (this.parent && this.parent.speed || 100)
            };
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            if (
                this.position.x < 0
                ||
                this.position.x > this.window_data.width
                ||
                this.position.y < 0
                ||
                this.position.y > this.window_data.height
            ) {
                this.reset();
            }
        }

        render() {
            this.dom_node.style.left = `${this.position.x}px`;
            this.dom_node.style.top = `${this.position.y}px`;
        }

        reset() {
            this.position =
            {
                x: (Math.floor(Math.random() * (this.window_data.width / 2)) + (this.window_data.width / 4)),
                y: (Math.floor(Math.random() * (this.window_data.height / 2)) + (this.window_data.height / 4)),
            };
            this.height = (Math.floor(Math.random() * 3) + 1);
            this.dom_node.style.height = this.dom_node.style.width = `${this.height}px`;
        }

        get window_data() {
            return this.parent && this.parent.window_data || give_data(this.target);
        }
    }

    class Space {
        constructor(options = {}) {
            this._options = options;
            this._initialize();
        }

        _initialize() {
            this.parent = this._options.parent || null;
            this.target = this._options.target;
            if (!this.target || !(this.target instanceof HTMLElement)) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this.window_data = give_data(this.target);
            this.speed = this._options.speed || 100;
            this.quantity = this._options.quantity || 800;
            this.stars = new Array(this.quantity)
                .fill(null)
                .map(v => new Star({ target: this.target, parent: this }));
            this.stars.forEach(v => v.initialize());
            this._repeat();
        }

        _update() {
            this.speed -= 0.06;
            this.window_data = give_data(this.target);
            this.stars.forEach(v => v.update());
            if (this.speed < -5) {
                this.reset();
            }
        }

        _render() {
            this.stars.forEach(v => v.render());
        }

        _repeat() {
            this._update();
            this._render();
            window.requestAnimationFrame(() => this._repeat());
        }

        reset() {
            this.speed = this._options.speed || 100;
            this.stars.forEach(v => v.reset());
        }
    }

    return {
        Space,
        Star
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.warp_target')).forEach(target => {
        new warp.Space({
            speed: target.dataset.speed,
            quantity: target.dataset.quantity,
            target
        });
    });
});