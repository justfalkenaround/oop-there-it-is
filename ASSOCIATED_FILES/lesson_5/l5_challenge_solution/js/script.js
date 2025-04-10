'use strict';
/*_____ X ______*/

/*_____


THIS SETUP IS PRETTY MESSY AT THIS POINT

THERE IS SOME BLEED THROUGH WITHIN THE INSTANCES AND THE SHAPE OF THE TREE IS NOT SCALABLE

THE NEXT LESSONS WILL SHOW YOU HOW SOME OF THE SHARED FUNCTIONALITY COULD BE MODULARIZED


THIS SETUP SHOULD NOT BE USED AS AN EXAMPLE OF GOOD O.O.P

______*/

/*_____ EXPORT MORTARS OBJECT ______*/
const mortars = (() => {
    /*_____ UTILITY DOM FUNCTION ______*/
    const give_data = target => {
        const
            width = target && target.clientWidth,
            height = target && target.clientHeight;
        return { width, height, center: { x: width / 2, y: height / 2 } };
    };

    /*_____ INTERFACE CLASS ______*/
    class Interface {
        constructor(options = {}) {
            this._options = options;
            this.parent = options.parent || null;
            /*_____ ALL INSTANCES HAVE A DELETION FLAG ______*/
            this.delete_me = false;
        }

        initialize() { }

        update() { }

        render() { }

        reset() { }

        get root() {
            return this.parent && this.parent.root || this;
        }

        get canvas() {
            return this.root._canvas;
        }

        get context() {
            return this.root._context;
        }

        get hold() {
            return this.root.hold;
        }

        /*_____ INSTANCES SHARE THIS FUNCTION ______*/
        _determine_x() {
            return Number(`${Math.random() > 0.5 ? '-' : '+'}${Math.random() * 1.5}`);
        }
    }

    /*_____ STAR CLASS ______*/
    class Star extends Interface {
        initialize() {
            if (!this.parent) {
                throw new Error(`${this.constructor.name}: NO PARENT - REQUIRES PARENT`);
            }
            /*_____ DEFAULTS ______*/
            this.origin = this._options.origin || { x: 0, y: 0 };
            this.color = this._options.color || 'rgb(255, 255, 255)';
            this.size = this._options.size || (Math.floor(Math.random() * 3) + 1);
            /*_____ PLACE THE STARS IN A BOX AROUND THE ORIGIN ______*/
            // this.position = { x: this.origin.x + (this._determine_x() * (this.size / 2)), y: this.origin.y + (this._determine_x() * (this.size / 2)) };
            /*_____ OR ADD A LITTLE TRIGONOMETRY TO PLACE THE STARS IN CONCENTRIC RINGS AROUND THE ORIGIN ______*/
            const angle = (Math.random() * (Math.PI * 2));
            this.position = { x: this.origin.x + (Math.cos(angle) * (this.size / 2)), y: this.origin.y + (Math.sin(angle) * (this.size / 2)) };
            /*_____ VELOCITY IS OUTWARD FROM THE ORIGIN ______*/
            this.velocity = { x: ((this.position.x - this.origin.x) * this.size / 3), y: ((this.position.y - this.origin.y) * this.size / 3) };
        }

        update() {
            /*_____ QUEUE FOR DELETION IF OFF CANVAS ______*/
            if (this.position.y > this.canvas.height) {
                this.delete_me = true;
                return;
            }
            /*_____ UPDATE STATE ______*/
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            /*_____ LOW DENSITY GRAVITY ______*/
            this.velocity.y += 0.03;
        }

        render() {
            this.context.fillStyle = this.color;
            this.context.save();
            this.context.translate(this.position.x, this.position.y);
            this.context.scale(this.root.scale, this.root.scale);
            /*_____ JUST DRAW A RECTANGE OF THE INSTANCE SIZE ______*/
            this.context.fillRect(this.position.x, this.position.y, this.size, this.size);
            this.context.restore();
        }
    }

    class Mortar extends Interface {
        initialize() {
            if (!this.parent) {
                throw new Error(`${this.constructor.name}: NO PARENT - REQUIRES PARENT`);
            }
            this.reset();
        }

        update() {
            /*_____ ADD SOME USER CONTROL ______*/
            if (this.hold && this.position.y < this.canvas.height - 300) {
                this.explode();
            }
            /*_____ RANDOM LAUNCHING WHEN OFF CANVAS ______*/
            if (this.position.y > this.canvas.height && Math.random() < 0.003) {
                this.reset();
            }
            /*_____ UPDATE STATE ______*/
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.y += 0.1;
            /*_____ EXPLODE WHEN VELOCITY REACHES THE TOP OF THE CURVE ______*/
            if (this.velocity.y > -0.2) {
                this.explode();
            }
        }

        render() {
            this.context.fillStyle = this.color;
            this.context.save();
            this.context.translate(this.position.x, this.position.y);
            this.context.scale(this.root.scale, this.root.scale);
            /*_____ DRAW A RECTANGLE OF THE INSTANCE SIZE ______*/
            this.context.fillRect(this.position.x, this.position.y, this.size, this.size);
            this.context.restore();
        }

        reset() {
            /*_____ RANDOM SIZE WITHIN RANGE ______*/
            this.size = ((Math.random() * 5) + 3);
            /*_____ RANDOM X WITHIN CANVAS ______*/
            this.position = { x: (Math.random() * this.canvas.width), y: this.canvas.height };
            /*_____ APPROXIMATE Y VELOCITY WITHIN CANVAS ______*/
            this.velocity = { x: this._determine_x(), y: ((-5 * Math.random()) - 8) };
            /*_____ RANDOM COLOR WITH MINIMUM 155 LOCKED IN ______*/
            this.color = `rgb(${Math.round(Math.random() * 100) + 155}, ${Math.round(Math.random() * 100) + 155}, ${Math.round(Math.random() * 100) + 155})`;
        }

        /*_____ METHOD FOR WHEN A MORTAR SHOULD EXPLODE ______*/
        explode() {
            /*_____ GENERATE SOME STARS ______*/
            const stars = new Array(100 + Math.floor(Math.random() * 100))
                .fill(null)
                .map(v => new Star({ parent: this.root, origin: this.position, color: this.color }));
            /*_____ INITIALIZE THEM ______*/
            stars.forEach(v => v.initialize());
            /*_____ REQUEST THEM TO BE ADDED TO THE UNIVERS ______*/
            this.root.request_add(stars);
            /*_____ RESET STATE ______*/
            this.reset();
        }
    }

    /*_____ SIMILAR MANAGER CLASS AS BEFORE ______*/
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
            this._context = this.canvas.getContext('2d');
            this.target.append(this._canvas);
            window.addEventListener('resize', () => this._resize());
            this._resize();
            /*_____ ADD A QUEUE ARRAY ______*/
            this.queue = [];
            this.quantity = this._options.quantity || 30;
            this.scale = this._options.scale || 1;
            this.children = new Array(this.quantity)
                .fill(null)
                .map(v => new Mortar({ parent: this }));
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
            /*_____ PRUNE ANY OBJECTS READY FOR DELETION ______*/
            this._prune();
            /*_____ ADD OBJECTS FROM THE QUEUE ______*/
            this._handle_queue();
            /*_____ UPDATE CHILDREN ______*/
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

        _prune() {
            /*_____ REMOVE ANY CHILDREN WITH THE FLAG FOR GARBAGE COLLECTION ______*/
            this.children = this.children.filter(v => !v.delete_me);
        }

        _handle_queue() {
            /*_____ ADD THE OBJECTS TO CHILDREN ______*/
            this.queue.length && this.children.push(...this.queue);
            /*_____ CLEAR QUEUE ______*/
            this.queue = [];
        }

        request_add(objects) {
            /*_____ ADD OBJECTS TO QUEUE ______*/
            this.queue.push(...objects);
        }

        get hold() {
            return this.mousehold || this.touchhold || this.keyhold || false;
        }
    }

    return {
        Manager
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.mortars-target')).forEach(target => {
        new mortars.Manager({
            scale: +target.dataset.scale,
            quantity: +target.dataset.quantity,
            target
        });
    });
});