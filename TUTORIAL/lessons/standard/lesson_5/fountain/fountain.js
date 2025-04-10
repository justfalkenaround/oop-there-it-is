'use strict';

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
            !this._local_root && (this._local_root = this.parent && this.parent.root || this);
            return this._local_root;
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
        initialize() {
            if (!this.parent) {
                throw new Error(`${this.constructor.name}: NO PARENT - REQUIRES PARENT`);
            }
            this._waiting = this.hold;
            this._path = new Path2D();
            /* CREDIT TO DEV-DOCS FOR HEART PATTERN */
            this._path.moveTo(7.5, 4.0);
            this._path.bezierCurveTo(7.5, 3.7, 7.0, 2.5, 5.0, 2.5);
            this._path.bezierCurveTo(2.0, 2.5, 2.0, 6.25, 2.0, 6.25);
            this._path.bezierCurveTo(2.0, 8.0, 4.0, 10.2, 7.5, 12.0);
            this._path.bezierCurveTo(11.0, 10.2, 13.0, 8.0, 13.0, 6.25);
            this._path.bezierCurveTo(13.0, 6.25, 13.0, 2.5, 10.0, 2.5);
            this._path.bezierCurveTo(8.5, 2.5, 7.5, 3.7, 7.5, 4.0);
            /* CREDIT TO DEV-DOCS FOR HEART PATTERN */
            this.reset();
        }

        update() {
            if (this.position.y > this.canvas.height || this.position.y < 0) {
                this.reset();
                if (this.hold) {
                    this.velocity = { x: 0, y: 0 };
                    this._waiting = true;
                }
            }
            if (!this.hold && this._waiting) {
                this.reset();
                this._waiting = false;
            }
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.y += 0.1;
        }

        render() {
            this.context.fillStyle = this.color;
            this.context.save();
            this.context.translate(this.position.x, this.position.y);
            this.root.scale !== 1 && this.context.scale(this.root.scale, this.root.scale);
            this.context.fill(this._path);
            this.context.restore();
        }

        reset() {
            this.position = { x: (this.canvas.width / 2), y: this.canvas.height };
            this.velocity = { x: +`${Math.random() > 0.5 ? '-' : '+'}${Math.random() * 1.5}`, y: ((Math.random() * -20) - 1) };
            this.color = `rgb(255, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`;
        }
    }

    class Manager extends Interface {
        constructor(options) {
            super(options);
            this._initialize();
        }

        _initialize() {
            this.target = this._options.target;
            if (!this.target || !(this.target instanceof HTMLElement)) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this._canvas = document.createElement('canvas');
            this._context = this.canvas.getContext('2d', { alpha: false });
            this.target.append(this._canvas);
            window.addEventListener('resize', () => this._resize());
            this._resize();
            this.quantity = this._options.quantity || 1000;
            this.scale = this._options.scale || 1;
            this.children = new Array(this.quantity)
                .fill(null)
                .map(v => new Element({ parent: this }));
            this.children.forEach(v => v.initialize());
            this.mousehold = false;
            this.keyhold = false;
            this.touchhold = false;
            document.addEventListener('mousedown', () => this.mousehold = true);
            document.addEventListener('touchstart', () => this.touchhold = true);
            document.addEventListener('keydown', () => this.keyhold = true);
            document.addEventListener('mouseup', () => this.mousehold = false);
            document.addEventListener('touchend', () => this.touchhold = false);
            document.addEventListener('keyup', () => this.keyhold = false);
            this._repeat();
        }

        _update() {
            this.children.forEach(v => v.update());
        }

        _render() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.children.forEach(v => v.render());
        }

        _repeat() {
            this._update();
            this._render();
            window.requestAnimationFrame(() => this._repeat());
        }

        _resize() {
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