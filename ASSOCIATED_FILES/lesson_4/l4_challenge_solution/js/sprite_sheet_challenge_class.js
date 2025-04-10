'use strict';
/*_____ X ______*/

/*_____ GLOBAL CLASS DECLARATION ______*/
class DOMSprite {

    /*_____ PRE-INITIALIZATION PHASE ______*/
    constructor(element) {

        /*_____ MAKE SURE THE USER INPUTS AN ELEMENT ______*/
        if (!element || !(element instanceof HTMLElement)) {

            /*_____ IF THE INPUT IS MISSING OR INVALID OUTPUT ERROR MESSAGE ______*/
            throw new Error(`${this.constructor.name}: DID NOT PROVIDE WRAPPER ELEMENT`);
        }

        /*_____ ASSIGN PARAMETER TO CLASS INSTANCE ______*/
        this.element = element;

        /*_____ FIRE OFF INITIALIZATION PHASE ______*/
        this.initialize();
    }

    /*_____ ASYNC INITIALIZATION PHASE ______*/
    async initialize() {

        /*_____ DECLARE VARIABLES AS PROPERTIES OF THE CLASS INSTANCE ______*/
        this.throttle_counter = 0;
        this.rotation = -20;
        this.live_scale = 0;
        this.hue = 0;

        /*_____ DEFAULT VALUES ______*/
        this.throttle = this.element.dataset.throttle || 10;
        this.direction = 'forward';
        this.frame_position = { x: 1, y: 1 };
        this.scale = this.element.dataset.scale || 1;
        this.divisions_x = this.element.dataset.divisions_x || 1;
        this.divisions_y = this.element.dataset.divisions_y || 1;
        this.scan_mode = this.element.dataset.scan_mode || 'loop';

        /*_____ LOAD IMAGE ASSET ______*/
        this.image = new Image();
        this.image.alt = this.element.dataset.alt || 'animated sprite';
        await new Promise((resolve, reject) => {
            this.image.addEventListener('load', resolve);
            this.image.addEventListener('error', err => {
                reject(new Error(`${this.constructor.name}: COULD NOT LOAD IMAGE ASSET`, { cause: err }));
            });
            this.image.src = this.element.dataset.src || '';
        });

        /*_____ ATTACH AND PREPARE IMAGE ASSET ______*/
        this.element.append(this.image);
        this.image.width *= this.scale;
        this.local_width = this.image.width / this.divisions_x;
        this.local_height = this.image.height / this.divisions_y;
        this.element.style.width = `${this.local_width}px`;
        this.element.style.height = `${this.local_height}px`;

        /*_____ FINAL PARAMETER CHECK ______*/
        if (
            (this.divisions_y === 1 && this.divisions_x === 1)
            ||
            (this.divisions_x % 1 || this.divisions_y % 1)
            ||
            (this.divisions_x < 0 || this.divisions_y < 0)) {
            throw new Error(`${this.constructor.name}: INVALID INPUT PARAMETERS`);
        }

        /*_____ FIRE OFF THE REPEAT PHASE ______*/
        this.repeat();
    }

    /*_____ UPDATE PHASE METHOD ______*/
    update() {

        /*_____ MODIFY ANIMATION STATE HANDLES ______*/
        this.hue += 1;
        this.rotation += 7;

        /*_____ CONDITIONAL TREE ______*/
        if (this.direction === 'forward') {
            this.live_scale += 0.1;
            if (this.frame_position.x < this.divisions_x) {
                ++this.frame_position.x;
            }
            else if (this.frame_position.y < this.divisions_y) {
                ++this.frame_position.y;
                this.frame_position.x = 1;
            }
            else {
                if (this.scan_mode === 'loop') {
                    this.frame_position = { x: 1, y: 1 };
                }
                else {
                    this.direction = 'backward';
                    this.update();
                }
            }
        }
        else {
            this.live_scale -= 0.1;
            if (this.frame_position.x > 1) {
                --this.frame_position.x;
            }
            else if (this.frame_position.y > 1) {
                --this.frame_position.y;
                this.frame_position.x = this.divisions_x;
            }
            else {
                this.direction = 'forward';
                this.update();
            }
        }
    }

    /*_____ RENDER PHASE ______*/
    render() {

        /*_____ MODIFY DOM STATE TO REFLECT INSTANCE STATE ______*/
        this.image.style.left = `-${(this.frame_position.x - 1) * this.local_width}px`;
        this.image.style.top = `-${(this.frame_position.y - 1) * this.local_height}px`;
        this.element.style.filter = `hue-rotate(${this.hue}deg)`;
        this.element.style.transform = `rotate(${this.rotation}deg) scale(${this.live_scale + 0.8}, ${this.live_scale + 0.8})`;
    }

    /*_____ REPEAT PHASE ______*/
    repeat() {

        /*_____ THROTTLED ______*/
        ++this.throttle_counter;
        if (this.throttle_counter % this.throttle === 0) {
            this.update();
            this.render();
        }

        /*_____ NOTE THE USE OF AN ANONYMOUS FUNCTION HERE TO BIND THE CONTEXT ______*/
        window.requestAnimationFrame(() => this.repeat());
    }
}

/*_____ AWAIT DOM LOAD ______*/
document.addEventListener('DOMContentLoaded', () => {
    try {

        /*_____ CREATE ALL ANIMATIONS AS INSTANCES OF THE CLASS ______*/
        const element_list = Array.from(document.querySelectorAll('.sprite_sheet'));
        element_list.forEach(v => new DOMSprite(v));
    }
    catch (err) { }
});