'use strict';

/*______ Written by Falken Brown for the OOP There It Is Tutorial ______*/

const BAREBONES = (() => {

    const help = {

        clamp: (num, min, max) => num <= min ? min : num >= max ? max : num,

        radians_to_degrees: rads => rads * (180 / Math.PI),

        degrees_to_radians: degs => degs * (Math.PI / 180),

        give_element_data: target => {
            const
                width = target && target.clientWidth,
                height = target && target.clientHeight;
            return { width, height, center: { x: width / 2, y: height / 2 } };
        },

        require_numeric: (v, bool = false) => {
            if (typeof v === 'number' && !isNaN(v)) return bool ? true : v;
            throw new Error(`INPUT MUST BE NUMERIC BUT GOT: ${v}`);
        },

        interface_only: (instance, self) => {
            if (instance.constructor === self) {
                throw new Error(`${instance.constructor.name} SAYS: DO NOT CONSTRUCT DIRECTLY`);
            }
        },

        flatten_tree: node => {
            const output = [];
            for (let i = 0, j = node._children.length; i < j; i++) {
                if (node._children[i] instanceof List) {
                    output.push(...help.flatten_tree(node._children[i]));
                }
                else {
                    output.push(node._children[i]);
                }
            }
            return output;
        },

        worker_script_to_url: worker_function => {
            const
                stringified = worker_function.toString(),
                block_contents = stringified.substring(
                    stringified.indexOf('{') + 1,
                    stringified.lastIndexOf('}')
                ),
                worker_blob = new Blob([block_contents], { type: 'application/javascript' });
            return URL.createObjectURL(worker_blob);
        }
    };

    class Vector {
        constructor(x = 0, y = 0) {
            const temp = Vector.require_vector_or_numeric(x, y, true);
            this.x = temp.x;
            this.y = temp.y;
        }

        static require_vector_or_numeric(vec, b, plain = false) {
            if (vec instanceof Vector) return vec;
            const args = [vec, b];
            if (args.every(v => help.require_numeric(v, true))) return !plain && new Vector(vec, b) || { x: vec, y: b };
            throw new Error(`VECTOR SAYS: INPUT MUST BE VECTOR OR NUMERIC BUT GOT: ${args}`);
        }

        static random_normal(x = 0, y = 0) {
            return new Vector(
                !x && +`${Math.random() > 0.5 ? '-' : ''}${Math.random()}` || x,
                !y && +`${Math.random() > 0.5 ? '-' : ''}${Math.random()}` || y
            );
        }

        static radians_from_vector(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return Math.atan2(temp.y, temp.x);
        }

        static radians_to_unit_circle_vector(rads = 0) {
            return new Vector(Math.cos(rads), Math.sin(rads));
        }

        static random_unit_circle_vector() {
            const rads = ((2 * Math.PI) * Math.random());
            return Vector.radians_to_unit_circle_vector(rads);
        }

        static degrees_to_unit_circle_vector(degs = 0) {
            const rads = help.degrees_to_radians(degs);
            return Vector.radians_to_unit_circle_vector(rads);
        }

        duplicate() {
            return new Vector(this.x, this.y);
        }

        plus(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return new Vector(this.x + temp.x, this.y + temp.y);
        }

        minus(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return new Vector(this.x - temp.x, this.y - temp.y);
        }

        times(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return new Vector(this.x * temp.x, this.y * temp.y);
        }

        divided_by(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return new Vector(this.x / temp.x, this.y / temp.y);
        }

        modulused_by(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return new Vector(this.x % temp.x, this.y % temp.y);
        }

        distance_from(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return (Math.hypot(temp.x - this.x, temp.y - this.y));
        }

        mirror_axis(x = false, y = false) {
            return new Vector(this.x * +`${x && '-' || ''}1`, this.y * +`${y && '-' || ''}1`);
        }

        equals(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return (this.x === temp.x && this.y === temp.y);
        }

        normalized_traditional(scale = 1) {
            const length = this.length;
            if (Math.abs(length) < 0.0000001) return this.duplicate();
            return new Vector(scale * this.x / length, scale * this.y / length);
        }

        normalized() {
            const max = Math.max(Math.abs(this.x), Math.abs(this.y));
            if (max < 0.0000001) return this.duplicate();
            return this.divided_by(max, max);
        }

        angle_to(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return Vector.radians_from_vector(temp.minus(this));
        }

        get dot_product() {
            return (this.x * this.x + this.y * this.y);
        }

        get length() {
            return (Math.sqrt(this.dot_product));
        }

        get array() {
            return [this.x, this.y];
        }

        get plain() {
            return { x: this.x, y: this.y };
        }
    }

    class Shape {
        constructor(options = {}) {
            help.interface_only(this, Shape);
            this._options = options;
        }

        intersects_with(shape) {
            if (!(shape instanceof Shape)) {
                throw new Error(`SHAPE SAYS: INPUT MUST BE CIRCLE OR RECTANGLE BUT GOT: ${shape}`);
            }
            const alternate = [this, shape];
            if (alternate.every(v => v instanceof Circle)) {
                return (this.position.distance_from(shape.position) < this.radius + shape.radius);
            }
            else if (alternate.every(v => v instanceof Rectangle)) {
                return (
                    this.position.x < shape.position.x + shape.size.x
                    &&
                    this.position.x + this.size.x > shape.position.x
                    &&
                    this.position.y < shape.position.y + shape.size.y
                    &&
                    this.position.y + this.size.y > shape.position.y
                );
            }
            else {
                alternate.sort(a => a instanceof Rectangle ? -1 : 1);
                const closest_point = new Vector(
                    help.clamp(alternate[1].position.x, alternate[0].position.x, alternate[0].position.x + alternate[0].size.x),
                    help.clamp(alternate[1].position.y, alternate[0].position.y, alternate[0].position.y + alternate[0].size.y)
                );
                return (alternate[1].position.distance_from(closest_point) <= alternate[1].radius);
            }
        }
    }

    class Circle extends Shape {
        constructor(options) {
            super(options);
            this.position = Vector.require_vector_or_numeric(this._options.position);
            this.radius = help.require_numeric(this._options.radius);
        }

        duplicate() {
            return new Circle({
                position: this.position.duplicate(),
                radius: this.radius
            });
        }

        contains(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return (this.position.distance_from(temp) <= this.radius);
        }
    }

    class Rectangle extends Shape {
        constructor(options) {
            super(options);
            this.position = Vector.require_vector_or_numeric(this._options.position);
            this.size = Vector.require_vector_or_numeric(this._options.size);
        }

        duplicate() {
            return new Rectangle({
                position: this.position.duplicate(),
                size: this.size.duplicate()
            });
        }

        contains(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return (
                (temp.x > this.position.x && temp.x < (this.position.x + this.size.x))
                &&
                (temp.y > this.position.y && temp.y < (this.position.y + this.size.y))
            );
        }

        intersection_depth(rectangle) {
            if (!(rectangle instanceof Rectangle)) {
                throw new Error(`RECTANGLE SAYS: INPUT MUST BE INSTANCE OF RECTANGLE BUT GOT: ${rectangle}`);
            }
            const min_distance = this.size.plus(rectangle.size).divided_by(2, 2);
            const distance = this.center.minus(rectangle.center);
            return new Vector(
                distance.x > 0 ? min_distance.x - distance.x : -min_distance.x - distance.x,
                distance.y > 0 ? min_distance.y - distance.y : -min_distance.y - distance.y
            );
        }

        intersection(rectangle) {
            if (!(rectangle instanceof Rectangle)) {
                throw new Error(`RECTANGLE SAYS: INPUT MUST BE INSTANCE OF RECTANGLE BUT GOT: ${rectangle}`);
            }
            const depth = this.intersection_depth(rectangle);
            return new Rectangle({
                position: new Vector(
                    Math.max(this.position.x, rectangle.position.x),
                    Math.max(this.position.y, rectangle.position.y)
                ),
                size: new Vector(
                    Math.abs(depth.x),
                    Math.abs(depth.y)
                )
            });
        }

        scaled_up_by(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            const increase = this.size.times(temp).minus(this.size);
            return new Rectangle({
                position: this.position.minus(increase),
                size: this.size.plus(increase.times(2, 2))
            });
        }

        scaled_down_by(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            const decrease = this.size.times(temp).minus(this.size);
            return new Rectangle({
                position: this.position.plus(decrease),
                size: this.size.minus(decrease.times(2, 2))
            });
        }

        get center() {
            return this.position.plus(this.size.divided_by(2, 2));
        }

        get array() {
            return [...this.position.array, ...this.size.array];
        }

        get random_within() {
            return this.size.minus(this.position).times(Math.random(), Math.random()).plus(this.position);
        }

        get random_within_middle() {
            return this.scaled_down_by(1.15, 1.15).random_within;
        }
    }

    class Interface {
        constructor(options = {}) {
            help.interface_only(this, Interface);
            this._options = options;
            this.parent = options.parent || null;
            this.id = this._options.id || Symbol();
            this.initialized = false;
            this.state_ceiling = options.state_ceiling ?? false;
            this._memoized = {};
            this.universe_object = this._options.universe_object ?? false;
            if (this.universe_object) {
                this.layer = this._options.layer || -1;
                this.position = this._options.position || new Vector();
                this.velocity = this._options.velocity || new Vector();
                this.origin = this._options.origin || new Vector();
                this.scale = this._options.scale || new Vector(1, 1);
                this.visible = this._options.visible ?? true;
                this.rotation = this._options.rotation || 0;
            }
            else {
                this.visible = this._options.visible ?? false;
            }
        }

        initialize() {
            this.initialized = true;
        }

        update() {
            this.universe_object && (this.position = this.position.plus(this.velocity));
        }

        render() { }

        on_delete() { }

        reset() {
            this.clear_cache();
        }

        handle_input(e) { }

        is_instance(v) {
            return (v && v instanceof this.constructor || false);
        }

        is_a(v) {
            return (v && v.constructor === this.constructor || false);
        }

        clear_cache() {
            this._memoized = {};
        }

        static is_a(v) {
            return (v && v.constructor === Interface || false);
        }

        static is_instance(v) {
            return (v && v instanceof Interface || false);
        }

        static require_is_instance(v) {
            if (!Interface.is_instance(v)) {
                throw new Error(`INTERFACE SAYS: INPUT MUST BE INSTANCE OF INTERFACE BUT GOT: ${v}`);
            }
        }

        get root() {
            !this._memoized._hidden_root
                && (this._memoized._hidden_root = this.parent && this.parent.root || this);
            return this._memoized._hidden_root || null;
        }

        get state_parent() {
            !this._memoized._hidden_state_parent
                &&
                (this._memoized._hidden_state_parent =
                    this.parent && this.parent.state_ceiling
                    && this.parent || this.parent && this.parent.state_parent || null);
            return this._memoized._hidden_state_parent || null;
        }

        get audio() {
            return this.root._audio;
        }

        set audio(v) {
            this.root === this ? (this.root._audio = v) : null;
        }

        get assets() {
            return this.root._assets;
        }

        set assets(v) {
            this.root === this ? (this.root._assets = v) : null;
        }

        get audio_context() {
            return this.root._audio_context;
        }

        set audio_context(v) {
            this instanceof AudioManager ? (this.root._audio_context = v) : null;
        }

        get mouse() {
            return this.root._mouse;
        }

        set mouse(v) {
            this instanceof UserInterface ? (this.root._mouse = v) : null;
        }

        get keyboard() {
            return this.root._keyboard;
        }

        set keyboard(v) {
            this instanceof UserInterface ? (this.root._keyboard = v) : null;
        }

        get touch() {
            return this.root._touch;
        }

        set touch(v) {
            this instanceof UserInterface ? (this.root._touch = v) : null;
        }

        get canvas() {
            return this.root._canvas || null;
        }

        set canvas(v) {
            this instanceof CanvasManager ? (this.root._canvas = v) : null;
        }

        get context() {
            return this.root._context || null;
        }

        set context(v) {
            this instanceof CanvasManager ? (this.root._context = v) : null;
        }

        get offscreen_canvas() {
            return this.root._offscreen_canvas || null;
        }

        set offscreen_canvas(v) {
            this instanceof CanvasManager ? (this.root._offscreen_canvas = v) : null;
        }

        get offscreen_canvas_context() {
            return this.root._offscreen_canvas_context || null;
        }

        set offscreen_canvas_context(v) {
            this instanceof CanvasManager ? (this.root._offscreen_canvas_context = v) : null;
        }

        get now() {
            return this.root._now || 0;
        }

        set now(v) {
            this.root === this ? (this.root._now = v) : null;
        }

        get then() {
            return this.root._then || 0;
        }

        set then(v) {
            this.root === this ? (this.root._then = v) : null;
        }

        get time_elapsed() {
            return (this.root._now - this.root._then);
        }

        get universe_position() {
            return this.universe_object
                &&
                (this.parent && this.parent.universe_position.plus(this.position) || this.position.duplicate())
                ||
                new Vector();
        }

        get layer() {
            return this.universe_object && this._layer || -1;
        }

        set layer(v) {
            if (!this.universe_object) return;
            this._layer = v;
            this.parent instanceof List && this.parent.request_layer_sort();
        }
    }

    class List extends Interface {
        constructor(options) {
            super(options);
            this._children = [];
            this._queue = [];
            this.visible = this._options.visible || true;
        }

        initialize() {
            this._children.forEach(v => !v.initialized && v.initialize());
            super.initialize();
        }

        update() {
            this._prune();
            this._handle_queue();
            this._children.forEach(v => !v.initialized && v.initialize());
            this._children.forEach(v => v.update());
        }

        render() {
            if (!this.visible) return;
            this._children.forEach(v => v.visible && v.render());
        }

        handle_input(e) {
            this._children.forEach(v => v.handle_input(e));
        }

        reset() {
            this._handle_queue();
            this._children.forEach(v => v.reset());
            super.reset();
        }

        _prune() {
            [...this._children, ...this._queue].forEach(v => {
                if (v.delete_me) {
                    v.clear_cache();
                    v.on_delete();
                    v.parent = null;
                }
            });
            this._children = this._children.filter(v => !v.delete_me);
            this._queue = this._queue.filter(v => !v.delete_me);
        }

        _handle_queue() {
            if (!this._queue.length) {
                return;
            }
            this._queue = this._queue.flat(Infinity);
            this._queue = this._queue.filter(v => Interface.is_instance(v));
            this._queue.length && this._children.push(...this._queue);
            this._children.forEach(v => {
                v.parent = this;
                !v.initialized && v.initialize();
            });
            this._queue = [];
        }

        request_add(v) {
            this._queue.push(v);
        }

        add(v) {
            Interface.require_is_instance(v);
            v.parent = this;
            this._children.push(v);
            this.request_layer_sort();
            return v;
        }

        remove(v) {
            v.clear_cache();
            v.on_delete();
            v.parent = null;
            this._children = this._children.filter(x => x !== v);
        }

        clear() {
            this._handle_queue();
            this._children.forEach(v => {
                v.parent = null;
                v.clear_cache();
            });
            this._children = [];
        }

        find_id(id = null) {
            if (!this._memoized[id]) {
                for (let i = 0, j = this._children.length; i < j; i++) {
                    if (this._children[i].id === id) {
                        this._memoized[id] = this._children[i];
                        break;
                    }
                    if (this._children[i] instanceof List) {
                        const v = this._children[i].find_id(id);
                        if (v !== null) {
                            this._memoized[id] = v;
                            break;
                        }
                    }
                }
            }
            return this._memoized[id] || null;
        }

        find(callback_or_reference = () => true) {
            for (let i = 0, j = this._children.length; i < j; i++) {
                if (callback_or_reference instanceof Function) {
                    if (callback_or_reference(this._children[i]) === true) {
                        return this._children[i];
                    }
                }
                else if (this._children[i] === callback_or_reference) {
                    return this._children[i];
                }
                if (this._children[i] instanceof List) {
                    const v = this._children[i].find(callback_or_reference);
                    if (v !== null) {
                        return v;
                    }
                }
            }
            return null;
        }

        find_all(callback = () => true) {
            const output = [];
            for (let i = 0, j = this._children.length; i < j; i++) {
                if (callback(this._children[i]) === true) {
                    output.push(this._children[i]);
                }
                if (this._children[i] instanceof List) {
                    output.push(...this._children[i].find_all(callback));
                }
            }
            return output;
        }

        request_layer_sort() {
            this._children.sort((a, b) => a.layer && b.layer && a.layer - b.layer || -1);
        }
    }

    class GridList extends List {
        constructor(options) {
            options.universe_object = true;
            super(options);
            this._rows = this._options.rows || 0;
            this._columns = this._options.columns || 0;
            this._cell_width = this._options.cell_width || 0;
            this._cell_height = this._options.cell_height || 0;
        }

        initialize() {
            if (this._options.center) {
                const center = this.root.canvas_manager
                    .canvas_center
                    .minus(this.bounding_box.size.divided_by(2, 2))
                    .plus(this._cell_width / 2, this._cell_height / 2);
                this.position = new Vector(
                    this._options.center.x && center.x || this.position.x,
                    this._options.center.y && center.y || this.position.y
                );
            }
            super.initialize();
        }

        add(v) {
            if (!v.universe_object) {
                throw new Error(`GRIDLIST SAYS: INPUT MUST UNIVERSE OBJECT`);
            }
            const row = Math.floor(this._children.length / this._columns);
            const column = this._children.length % this._columns;
            v.position = new Vector(column * this._cell_width, row * this._cell_height);
            super.add(v);
        }

        replace_at(v, vec, b) {
            Interface.require_is_instance(v);
            const temp = Vector.require_vector_or_numeric(vec, b);
            const index = temp.y * this._columns + temp.x;
            const old = this._children[index] || null;
            this._children[index] = v;
            v.parent = this;
            v.position = new Vector(temp.x * this._cell_width, temp.y * this._cell_height);
            return old;
        }

        item_at(vec, b) {
            const temp = Vector.require_vector_or_numeric(vec, b);
            return this._children[temp.y * this._columns + temp.x];
        }

        get_anchor_position(v) {
            for (let i = 0, j = this._children.length; i < j; i++) {
                if (this._children[i] === v) {
                    const row = Math.floor(i / this._columns);
                    const column = i % this._columns;
                    return new Vector(column * this._cell_width, row * this._cell_height);
                }
            }
        }

        request_layer_sort() { }

        get bounding_box() {
            return new Rectangle({
                position: this.universe_position.duplicate(),
                size: new Vector(this._cell_width * this._columns, this._cell_height * this._rows)
            });
        }

        get cell_quantity() {
            return this._rows * this._columns;
        }
    }

    class Label extends Interface {
        constructor(options) {
            options.universe_object = true;
            super(options);
            this.contents = this._options.contents || '';
            this._previous_contents = this.contents;
            this.memoize = this._options.memoize ?? true;
            this.color = this._options.color || 'black';
            this.font_name = this._options.font_name || 'Courier New';
            this.font_size = this._options.font_size || '20px';
            this.align = this._options.align || 'left';
            this.baseline = 'top';
            this.background_color = this._options.background_color || 'rgba(255, 255, 255, 0)';
            this.background_scale = this._options.background_scale || new Vector(1, 1);
            this.stroke = this._options.stroke ?? false;
            this.line_height = this._options.line_height || +this.font_size.replace('px', '');
            this._stroke_start = this.stroke;
        }

        update() {
            if (!this.memoize && this._previous_contents !== this.contents) {
                this._previous_contents = this.contents;
                this._memoized._bounding_box = null;
            }
            super.update();
        }

        initialize() {
            if (this._options.origin_center) {
                const rect = this.bounding_box;
                this.origin = new Vector(rect.size.x / 2, rect.size.y / 2);
            }
            super.initialize();
        }

        render() {
            if (!this.visible) return;
            super.render();
            this.root.canvas_manager.draw_text(
                this.contents,
                this.universe_position,
                this.rotation,
                this.origin,
                this.color,
                this.align,
                this.font_name,
                this.font_size,
                this.baseline,
                this.scale,
                this.background_color,
                this.background_bounding_box,
                this.stroke,
                this.line_height
            );
        }

        _read_bounding_box() {
            const span = document.createElement('span');
            span.innerHTML = this.contents.replaceAll(' ', '&nbsp;').replaceAll('\n', '<br>');
            span.style.font = `${this.font_size} ${this.font_name}`;
            span.display = 'none';
            this.root.target.append(span);
            const size = new Vector(span.offsetWidth, span.offsetHeight);
            span.remove();
            return new Rectangle({
                position: this.universe_position.minus(this.origin),
                size: size.times(this.scale)
            });
        }

        get bounding_box() {
            if (this.memoize) {
                this._memoized._bounding_box = this._memoized._bounding_box || this._read_bounding_box();
                return this._memoized._bounding_box;
            }
            return this._read_bounding_box();
        }

        get background_bounding_box() {
            return this.bounding_box.scaled_up_by(this.background_scale);
        }
    }

    class ButtonLabel extends Label {
        constructor(options) {
            super(options);
            this.highlight_for = 0;
            this._pressed = this._down = this._was_down = this.up = false;
            this._onclick = (this._options.onclick instanceof Function && this._options.onclick) || (() => null);
        }

        update() {
            super.update();
            --this.highlight_for;
            if (this.mouse.contains_mouse(this.background_bounding_box)) {
                this.hover();
            }
            this.stroke = this._down || this.highlight_for > 0 ? !this._stroke_start : this._stroke_start;
            this.up = (this._was_down && !this._down);
            this._was_down = this._down;
            this._pressed = false;
        }

        hover() {
            this.root.canvas_manager.cursor_pointer_on();
        }

        handle_input(e) {
            if (!this.touch || !this.mouse) return;
            this._pressed = this.touch.contains_touch_press(this.background_bounding_box) || this.mouse.contains_mouse_press(this.background_bounding_box);
            this._down = this.touch.contains_touch(this.background_bounding_box) || this.mouse.contains_mouse_down(this.background_bounding_box);
            if (e && (e.type === 'mouseup' || e.type === 'touchend')) this._onclick(e);
            super.handle_input(e);
        }

        get down() {
            return this.visible && this._down;
        }

        get pressed() {
            return this.visible && this._pressed;
        }
    }

    class StateManager extends List {
        constructor(options) {
            options.universe_object = true;
            super(options);
            this.clear();
        }

        clear() {
            this._current_state = this._queued_state = this._previous_state = null;
        }

        initialize() {
            this._current_state && !this._current_state.initialized && this._current_state.initialize();
            super.initialize();
        }

        update() {
            if (this._queued_state) {
                this._switch_to(this._queued_state);
                this._queued_state = null;
            }
            if (!this._current_state || !this.initialized || !this._current_state.initialized) return;
            this._current_state && this._current_state.update();
        }

        render() {
            if (!this._current_state || !this.initialized || !this._current_state.initialized) return;
            this._current_state && this._current_state.render();
        }

        handle_input(e) {
            if (!this._current_state || !this.initialized || !this._current_state.initialized) return;
            this._current_state && this._current_state.handle_input(e);
        }

        reset() {
            if (!this._current_state || !this.initialized || !this._current_state.initialized) return;
            this._current_state && this._current_state.reset();
        }

        _switch_to(state) {
            if (!(state instanceof Interface)) {
                throw new Error(`STATE MANAGER SAYS: INPUT MUST BE INTERFACE BUT GOT: ${state}`);
            }
            this._previous_state = this._current_state;
            this._current_state = state;
            this._children = [state];
            !state.initialized && state.initialize();
        }

        request_switch_to_previous_state() {
            this._previous_state && this.request_switch_to(this._previous_state);
        }

        request_switch_to(state) {
            if (!(state instanceof Interface)) {
                throw new Error(`STATE MANAGER SAYS: INPUT MUST BE INTERFACE BUT GOT: ${state}`);
            }
            this._queued_state = state;
        }
    }

    class ButtonState {
        constructor(down = false, pressed = false) {
            this.down = down;
            this.pressed = pressed;
        }
    }

    class KeyboardManager extends Interface {
        constructor(options) {
            super(options);
            this.key_states = {};
        }

        initialize() {
            window.addEventListener('keydown', e => {
                this.handle_key_down(e);
                this.root.handle_input(e);
            });
            window.addEventListener('keyup', e => {
                this.handle_key_up(e);
                this.root.handle_input(e);
            });
            super.initialize();
        }

        update() {
            Object.keys(this.key_states).forEach(v => this.key_states[v].pressed = false);
        }

        _register_key(e) {
            !this.key_states[e.key] && (this.key_states[e.key] = new ButtonState());
        }

        handle_key_down(e) {
            this._register_key(e);
            if (!this.key_states[e.key].down) {
                this.key_states[e.key].pressed = true;
            }
            this.key_states[e.key].down = true;
        }

        handle_key_up(e) {
            this._register_key(e);
            this.key_states[e.key].down = false;
        }

        is_down(key) {
            return (this.key_states[key] && this.key_states[key].down);
        }

        is_pressed(key) {
            return (this.key_states[key] && this.key_states[key].pressed);
        }
    }

    class MouseManager extends Interface {
        constructor(options) {
            super(options);
            this.position = new Vector();
            this.left = new ButtonState();
            this.middle = new ButtonState();
            this.right = new ButtonState();
        }

        initialize() {
            this.canvas.addEventListener('mousemove', e => {
                this.handle_mouse_move(e);
                this.root.handle_input(e);
            });
            this.canvas.addEventListener('mousedown', e => {
                this.handle_mouse_down(e);
                this.root.handle_input(e);
            });
            this.canvas.addEventListener('mouseup', e => {
                this.handle_mouse_up(e);
                this.root.handle_input(e);
            });
            super.initialize();
        }

        update() {
            this.left.pressed = false;
            this.middle.pressed = false;
            this.right.pressed = false;
        }

        handle_mouse_move(e) {
            this.position = new Vector(
                e.offsetX,
                e.offsetY
            ).divided_by(this.root.canvas_manager.canvas_scale);
        }

        handle_mouse_down(e) {
            if (e.which === 1) {
                !this.left.down && (this.left.pressed = true);
                this.left.down = true;
            }
            if (e.which === 2) {
                !this.middle.down && (this.middle.pressed = true);
                this.middle.down = true;
            }
            if (e.which === 3) {
                !this.right.down && (this.right.pressed = true);
                this.right.down = true;
            }
        }

        handle_mouse_up(e) {
            if (e.which === 1) {
                this.left.down = false;
            }
            if (e.which === 2) {
                this.middle.down = false;
            }
            if (e.which === 3) {
                this.right.down = false;
            }
        }

        contains_mouse(shape) {
            return shape.contains(this.position);
        }

        contains_mouse_press(shape, which = 'left') {
            return (this.contains_mouse(shape) && this[which].pressed);
        }

        contains_mouse_down(shape, which = 'left') {
            return (this.contains_mouse(shape) && this[which].down);
        }
    }

    class TouchManager extends Interface {
        constructor(options) {
            super(options);
            this.touches = [];
            this.touch_presses = [];
            this.touch_detected = false;
        }

        initialize() {
            document.addEventListener('touchstart', e => {
                this.handle_touch_start(e);
                this.root.handle_input(e);
            }, { passive: false });
            document.addEventListener('touchend', e => {
                this.handle_touch_end(e);
                this.root.handle_input(e);
            }, { passive: false });
            document.addEventListener('touchcancel', e => {
                this.handle_touch_end(e);
                this.root.handle_input(e);
            }, { passive: false });
            document.addEventListener('touchleave', e => {
                this.handle_touch_end(e);
                this.root.handle_input(e);
            }, { passive: false });
            document.body.addEventListener('touchmove', e => {
                this.handle_touch_move(e);
                this.root.handle_input(e);
            }, { passive: false });
            super.initialize();
        }

        update() {
            this.touch_presses = this.touch_presses.map(() => false);
        }

        handle_touch_start(e) {
            e.preventDefault();
            !this.touch_detected && (this.touch_detected = true);
            Array.from(e.changedTouches).forEach(v => {
                this.touches.push(v);
                this.touch_presses.push(true);
            });
            this.touches.forEach((v, i) => {
                v.position = new Vector(e.touches[i].clientX, e.touches[i].clientY).minus(this.root.canvas_manager.canvas_offset).divided_by(this.root.canvas_manager.canvas_scale);
                v.starting_position = v.position.duplicate();
                v.previous_position = v.position.duplicate();
            });
        }

        handle_touch_end(e) {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(v => {
                const idx = this.id_index(v.identifier);
                this.touches.splice(idx, 1);
                this.touch_presses.splice(idx, 1);
            });
        }

        handle_touch_move(e) {
            e.preventDefault();
            this.touches.forEach((v, i) => {
                v.position = new Vector(
                    e.touches[i].clientX,
                    e.touches[i].clientY
                ).minus(this.root.canvas_manager.canvas_offset).divided_by(this.root.canvas_manager.canvas_scale);
                v.change = v.position.minus(v.previous_position);
                v.total_change = v.position.minus(v.starting_position);
                v.previous_position = v.position.duplicate();
            });
        }

        id_index(id) {
            return this.touches.reduce((acc, v, i) => v.identifier === id ? i : null);
        }

        contains_touch(shape) {
            return this.touch_within(shape) ? true : false;
        }

        contains_touch_press(shape) {
            const idx = this.touch_within(shape, true);
            return idx !== null && this.touch_presses[idx];
        }

        touch_within(shape, idx = false) {
            for (let i = 0; i < this.touches.length; ++i) {
                if (shape.contains(this.touches[i].position)) {
                    return !idx ? this.touches[i] : i;
                }
            }
            return null;
        }
    }

    class UserInterface extends List {
        constructor(options) {
            super(options);
            this.initialize();
        }

        initialize() {
            this.keyboard = new KeyboardManager();
            this.add(this.keyboard);
            this.mouse = new MouseManager();
            this.add(this.mouse);
            this.touch = new TouchManager();
            this.add(this.touch);
            super.initialize();
        }
    }

    class CanvasManager extends Interface {
        constructor(options) {
            super(options);
            this.fixed_ratio = this._options.width || this._options.height || false;
            this.canvas = document.createElement('canvas');
            this.alpha_enabled = this._options.alpha || true;
            if (this._options.alpha) {
                this.offscreen_canvas = new OffscreenCanvas(0, 0);
                this.offscreen_canvas.willReadFrequently = true;
                this.offscreen_canvas_context = this.offscreen_canvas.getContext('2d');
            }
            this.canvas.style.touchAction = 'none';
            this.context = this.canvas.getContext('2d', { alpha: this._options.alpha || true });
            if (this.fixed_ratio) {
                this.aspect = new Vector(this._options.width || 2400, this._options.height || 1200);
                this.aspect_ratio = this.aspect.x / this.aspect.y;
                this.canvas.width = this.aspect.x;
                this.canvas.height = this.aspect.y;
                this.canvas.style.maxWidth = '100vw';
                this.canvas.style.maxHeight = '100vh';
            }
            this.root.target.append(this.canvas);
            window.addEventListener('resize', () => this.resize());
            this.resize();
            this.pointer_enabled = false;
        }

        update() {
            if (this.pointer_enabled) {
                this.canvas.style.cursor = 'pointer';
            }
            else if (this.grab_enabled) {
                this.canvas.style.cursor = 'grab';
            }
            else {
                this.canvas.style.cursor = 'default';
            }
            this.pointer_enabled = this.grab_enabled = false;
        }

        cursor_pointer_on() {
            this.pointer_enabled = true;
        }

        cursor_grab_on() {
            this.grab_enabled = true;
        }

        cursor_grabbing_on() {
            this.canvas.style.cursor = 'grabbing';
        }

        cursor_default() {
            this.canvas.style.cursor = 'default';
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        resize() {
            if (!this.fixed_ratio) {
                const { width, height } = help.give_element_data(this.target);
                this.canvas.width = width;
                this.canvas.height = height;
            }
            this._canvas_scale = this.canvas_client_dimensions.divided_by(this.canvas_dimensions);
        }

        draw_image(
            image,
            position = new Vector(),
            rotation = 0,
            origin = new Vector(),
            scale = new Vector(),
            source_rectangle = new Rectangle({
                position: new Vector(),
                size: new Vector(
                    image && image.width || 0,
                    image && image.height || 0
                )
            })
        ) {
            if (!(image instanceof Image)) {
                throw new Error(`CANVAS REQUIRES IMAGE ASSET TO DRAW IMAGE BUT GOT: ${image}`);
            }
            [position, origin, scale].forEach(v => {
                if (!(v instanceof Vector)) {
                    throw new Error(`CANVAS REQUIRES A VECTOR TO DRAW IMAGE BUT GOT: ${v}`);
                }
            });
            if (!(source_rectangle instanceof Rectangle)) {
                throw new Error(`CANVAS REQUIRES SUB RECTANGLE: ${source_rectangle}`);
            }
            this.context.save();
            this.context.translate(...position.array);
            this.context.scale(...scale.array);
            this.context.rotate(rotation);
            this.context.drawImage(
                image,
                ...source_rectangle.position.array,
                ...source_rectangle.size.array,
                ...origin.times(-1, -1).array,
                ...source_rectangle.size.array
            );
            this.context.restore();
        }

        draw_text(
            contents = '',
            position = new Vector(),
            rotation = 0,
            origin = new Vector(),
            color = 'black',
            align = 'left',
            font_name = 'Courier New',
            font_size = '20px',
            baseline = 'top',
            scale = new Vector(),
            background_color = 'rgba(255, 255, 255, 0)',
            background_rectangle = new Rectangle({ position: new Vector(), size: new Vector() }),
            stroke,
            line_height
        ) {
            [position, origin, scale].forEach(v => {
                if (!(v instanceof Vector)) {
                    throw new Error(`CANVAS REQUIRES A VECTOR TO DRAW TEXT BUT GOT: ${v}`);
                }
            });
            this.context.save();
            this.context.translate(...background_rectangle.position.array);
            if (stroke) {
                this.context.strokeStyle = background_color;
                this.context.lineWidth = 2;
                this.context.strokeRect(0, 0, background_rectangle.size.x, background_rectangle.size.y);
            }
            else {
                this.context.fillStyle = background_color;
                this.context.fillRect(0, 0, background_rectangle.size.x, background_rectangle.size.y);
            }
            this.context.restore();
            this.context.save();
            this.context.textBaseline = baseline;
            this.context.font = `${font_size} ${font_name}`;
            this.context.textAlign = align;
            this.context.translate(...position.minus(origin).array);
            this.context.rotate(rotation);
            this.context.fillStyle = color;
            const lines = contents.trim().split('\n');
            lines.forEach((v, i) => {
                this.context.fillText(v, 0, line_height * i);
            });
            this.context.scale(...scale.array);
            this.context.restore();
        }

        create_collision_mask(image, scale = new Vector(1, 1), rotation = 0) {
            const collision_mask = [];
            const scaled_width = image.width * scale.x;
            const scaled_height = image.height * scale.y;
            this.offscreen_canvas.width = scaled_width;
            this.offscreen_canvas.height = scaled_height;
            this.offscreen_canvas_context.clearRect(0, 0, this.offscreen_canvas.width, this.offscreen_canvas.height);
            this.offscreen_canvas_context.save();
            this.offscreen_canvas_context.translate(scaled_width / 2, scaled_height / 2);
            this.offscreen_canvas_context.rotate(rotation);
            this.offscreen_canvas_context.drawImage(image, 0, 0, image.width, image.height, -(scaled_width / 2), -(scaled_height / 2), scaled_width, scaled_height);
            this.offscreen_canvas_context.restore();
            const image_data = this.offscreen_canvas_context.getImageData(0, 0, this.offscreen_canvas.width, this.offscreen_canvas.height);
            for (let i = 3, z = scaled_width * scaled_height * 4; i < z; i += 4) {
                collision_mask.push(image_data.data[i]);
            }
            return collision_mask;
        }

        get canvas_dimensions() {
            return new Vector(this.canvas.width, this.canvas.height);
        }

        get bounding_box() {
            return new Rectangle({
                position: new Vector(0, 0),
                size: this.canvas_dimensions
            });
        }

        get canvas_client_dimensions() {
            return new Vector(this.canvas.clientWidth, this.canvas.clientHeight);
        }

        get canvas_center() {
            return this.canvas_dimensions.divided_by(2, 2);
        }

        get canvas_scale() {
            return this._canvas_scale || new Vector(1, 1);
        }

        set canvas_scale(v) {
            this instanceof CanvasManager ? (this._canvas_scale = v) : null;
        }

        get canvas_offset() {
            return new Vector(this.canvas.offsetLeft, this.canvas.offsetTop);
        }
    }

    class AudioManager extends List {
        constructor(options) {
            super(options);
            this.audio_context = new AudioContext();
            this._volume_node = this.audio_context.createGain();
            this._volume_node.connect(this.audio_context.destination);
            this._volume_node.gain.value = this._options.volume || 1;
            this.notes = AudioManager._notes;
        }

        play_track(options = {}) {
            const audio_buffer = options.audio_buffer,
                track = this.audio_context.createBufferSource(),
                volume = options.volume || 1,
                gain = this.audio_context.createGain();
            gain.gain.value = volume;
            track.buffer = audio_buffer;
            track.connect(gain);
            gain.connect(this._volume_node);
            track.start(options.delay || 0, options.offset || 0, options.duration);
            return track;
        }

        loop_track(options = {}) {
            const offset = options.offset || 0,
                track = this.audio_context.createBufferSource(),
                duration = options.duration || 0,
                audio_buffer = options.audio_buffer,
                volume = options.volume || 1,
                gain = this.audio_context.createGain();
            track.buffer = audio_buffer;
            gain.gain.value = volume;
            track.connect(gain);
            gain.connect(this._volume_node);
            track.loop = true;
            track.loopStart = offset || 0;
            track.loopEnd = (offset || 0 + duration || 0);
            track.start(options.delay, options.offset);
            return track;
        }

        play_tone(options = {}) {
            const
                tone = this.audio_context.createOscillator(),
                gain = this.audio_context.createGain(),
                scale = options.scale || 4,
                note = options.note || 'C',
                frequency = options.frequency || this.notes[scale][note] || this.notes[4]['C'],
                delay = options.delay || 0,
                volume = options.volume || 1,
                duration = options.duration || 1,
                type = options.type || 'square',
                endless = options.endless ?? false;
            gain.gain.value = volume;
            tone.connect(gain);
            gain.connect(this._volume_node);
            tone.type = type;
            tone.frequency.value = frequency;
            tone.start(this.audio_context.currentTime + delay);
            tone.stop(!endless ? (this.audio_context.currentTime + duration + delay) : Infinity);
            return tone;
        }

        stop_tone(tone) {
            tone.stop();
            return tone;
        }

        get volume() {
            return this._volume_node.gain.value;
        }

        set volume(v) {
            help.require_numeric(v);
            this._volume_node.gain.value = help.clamp(v, 0, 1);
        }

        /*_____CREDIT TO MDN FOR FREQUENCY TABLE_____*/
        static get _notes() {
            const n = [];
            for (let i = 0; i < 9; i++) {
                n[i] = [];
            }
            n[0]['A'] = 27.500000000000000;
            n[0]['A#'] = 29.135235094880619;
            n[0]['B'] = 30.867706328507756;
            n[1]['C'] = 32.703195662574829;
            n[1]['C#'] = 34.647828872109012;
            n[1]['D'] = 36.708095989675945;
            n[1]['D#'] = 38.890872965260113;
            n[1]['E'] = 41.203444614108741;
            n[1]['F'] = 43.653528929125485;
            n[1]['F#'] = 46.249302838954299;
            n[1]['G'] = 48.999429497718661;
            n[1]['G#'] = 51.913087197493142;
            n[1]['A'] = 55.000000000000000;
            n[1]['A#'] = 58.270470189761239;
            n[1]['B'] = 61.735412657015513;
            n[2]['C'] = 65.406391325149658;
            n[2]['C#'] = 69.295657744218024;
            n[2]['D'] = 73.416191979351890;
            n[2]['D#'] = 77.781745930520227;
            n[2]['E'] = 82.406889228217482;
            n[2]['F'] = 87.307057858250971;
            n[2]['F#'] = 92.498605677908599;
            n[2]['G'] = 97.998858995437323;
            n[2]['G#'] = 103.826174394986284;
            n[2]['A'] = 110.000000000000000;
            n[2]['A#'] = 116.540940379522479;
            n[2]['B'] = 123.470825314031027;
            n[3]['C'] = 130.812782650299317;
            n[3]['C#'] = 138.591315488436048;
            n[3]['D'] = 146.832383958703780;
            n[3]['D#'] = 155.563491861040455;
            n[3]['E'] = 164.813778456434964;
            n[3]['F'] = 174.614115716501942;
            n[3]['F#'] = 184.997211355817199;
            n[3]['G'] = 195.997717990874647;
            n[3]['G#'] = 207.652348789972569;
            n[3]['A'] = 220.000000000000000;
            n[3]['A#'] = 233.081880759044958;
            n[3]['B'] = 246.941650628062055;
            n[4]['C'] = 261.625565300598634;
            n[4]['C#'] = 277.182630976872096;
            n[4]['D'] = 293.664767917407560;
            n[4]['D#'] = 311.126983722080910;
            n[4]['E'] = 329.627556912869929;
            n[4]['F'] = 349.228231433003884;
            n[4]['F#'] = 369.994422711634398;
            n[4]['G'] = 391.995435981749294;
            n[4]['G#'] = 415.304697579945138;
            n[4]['A'] = 440.000000000000000;
            n[4]['A#'] = 466.163761518089916;
            n[4]['B'] = 493.883301256124111;
            n[5]['C'] = 523.251130601197269;
            n[5]['C#'] = 554.365261953744192;
            n[5]['D'] = 587.329535834815120;
            n[5]['D#'] = 622.253967444161821;
            n[5]['E'] = 659.255113825739859;
            n[5]['F'] = 698.456462866007768;
            n[5]['F#'] = 739.988845423268797;
            n[5]['G'] = 783.990871963498588;
            n[5]['G#'] = 830.609395159890277;
            n[5]['A'] = 880.000000000000000;
            n[5]['A#'] = 932.327523036179832;
            n[5]['B'] = 987.766602512248223;
            n[6]['C'] = 1046.502261202394538;
            n[6]['C#'] = 1108.730523907488384;
            n[6]['D'] = 1174.659071669630241;
            n[6]['D#'] = 1244.507934888323642;
            n[6]['E'] = 1318.510227651479718;
            n[6]['F'] = 1396.912925732015537;
            n[6]['F#'] = 1479.977690846537595;
            n[6]['G'] = 1567.981743926997176;
            n[6]['G#'] = 1661.218790319780554;
            n[6]['A'] = 1760.000000000000000;
            n[6]['A#'] = 1864.655046072359665;
            n[6]['B'] = 1975.533205024496447;
            n[7]['C'] = 2093.004522404789077;
            n[7]['C#'] = 2217.461047814976769;
            n[7]['D'] = 2349.318143339260482;
            n[7]['D#'] = 2489.015869776647285;
            n[7]['E'] = 2637.020455302959437;
            n[7]['F'] = 2793.825851464031075;
            n[7]['F#'] = 2959.955381693075191;
            n[7]['G'] = 3135.963487853994352;
            n[7]['G#'] = 3322.437580639561108;
            n[7]['A'] = 3520.000000000000000;
            n[7]['A#'] = 3729.310092144719331;
            n[7]['B'] = 3951.066410048992894;
            n[8]['C'] = 4186.009044809578154;
            return n;
        }
    }

    class AudioToneList extends Interface {
        constructor(options) {
            super(options);
            help.interface_only(this, AudioToneList);
            this.current_tones = [];
            this.looping = false;
        }

        play() { }

        stop() {
            this.current_tones.forEach(v => {
                v.onended = () => null;
                v.stop();
            });
            this.current_tones = [];
            this.looping = false;
        }

        add(tone) {
            this.current_tones.push(tone);
            tone.onended = () => this.current_tones = this.current_tones.filter(v => v !== tone);
            return tone;
        }

        loop() {
            this.looping = true;
            this._loop();
        }

        _loop() {
            if (!this.looping) return;
            this.play();
            const last = this.current_tones[this.current_tones.length - 1];
            last.onended = () => this._loop();
        }

        get playing() {
            return this.current_tones.length ? true : false;
        }
    }

    class SpriteSheet extends Interface {
        constructor(options) {
            super(options);
            this.image = this._options.image || null;
            if (!this.image || !this.image.complete || !this.image.src) {
                throw new Error(`SPRITESHEET SAYS: NEED A LOADED IMAGE BUT GOT: ${this.image}`);
            }
            this.columns = help.clamp(this._options.columns || 1, 1, Infinity);
            this.rows = help.clamp(this._options.rows || 1, 1, Infinity);
            this.refresh_collision_mask();
        }

        refresh_collision_mask(scale, rotation) {
            if (this.root.canvas_manager.offscreen_canvas && this._options.activate_collision_mask) {
                this.collision_mask = this.root.canvas_manager.create_collision_mask(this.image, scale, rotation);
            }
        }

        get_alpha(x, y, index) {
            if (!this.collision_mask) {
                return 255;
            }
            const idx =
                Math.floor(
                    ((Math.floor(index / this.columns) % this.rows) * this.height + y)
                    *
                    this.image.width + ((index % this.columns) * this.width + x)
                );
            if (idx < 0 || idx > this.collision_mask.length) {
                return 0;
            }
            else {
                return this.collision_mask[idx];
            }
        }

        get width() {
            return this.image.width / this.columns;
        }

        get height() {
            return this.image.height / this.rows;
        }

        get element_quantity() {
            return this.columns * this.rows;
        }
    }

    class Sprite extends Interface {
        constructor(options) {
            options.universe_object = true;
            super(options);
            this.sprite_sheet = this._options.sprite_sheet || null;
            if (this.sprite_sheet && !(this.sprite_sheet instanceof SpriteSheet)) {
                throw new Error(`SPRITE SAYS: REQUIRES SPRITESHEET BUT GOT: ${this.sprite_sheet}`);
            }
            if (this.rotation !== 0 || !this.scale.equals(1, 1)) {
                this.sprite_sheet.refresh_collision_mask(this.scale, this.rotation);
            }
            this._previous_rotation = this.rotation;
            this._previous_scale = this.scale.duplicate();
            this.frame_index = this._options.frame_index || 0;
            this.origin = this._options.origin_getter && this[`origin_${this._options.origin_getter}`] || this.origin_center;
        }

        update() {
            super.update();
            if (this.rotation !== this._previous_rotation || !this.scale.equals(this._previous_scale)) {
                this.sprite_sheet.refresh_collision_mask(this.scale, this.rotation);
                this._previous_rotation = this.rotation;
                this._previous_scale = this.scale.duplicate();
            }
        }

        render() {
            if (!this.visible) return;
            this.root.canvas_manager.draw_image(
                this.sprite_sheet.image,
                this.universe_position,
                this.rotation,
                this.origin,
                this.scale,
                this.source_rectangle
            );
        }

        collides_with(v) {
            if (!this.visible || !v.visible || !(v instanceof Sprite) || !this.bounding_box.intersects_with(v.bounding_box)) {
                return false;
            }
            if (this.sprite_sheet.collision_mask && v.sprite_sheet.collision_mask) {
                const intersecting_rect = this.bounding_box.intersection(v.bounding_box);
                const local = intersecting_rect.position.minus(this.universe_position.minus(this.origin));
                const v_local = intersecting_rect.position.minus(v.universe_position.minus(v.origin));
                for (let x = 0, j = intersecting_rect.size.x; x < j; x++) {
                    for (let y = 0, z = intersecting_rect.size.y; y < z; y++) {
                        if (
                            this.get_alpha(Math.floor(local.x + x), Math.floor(local.y + y)) !== 0
                            &&
                            v.get_alpha(Math.floor(v_local.x + x), Math.floor(v_local.y + y)) !== 0) {
                            return true;
                        }
                    }
                }
            }
            else {
                return true;
            }
            return false;
        }

        get_alpha(x, y) {
            return this.sprite_sheet.get_alpha(x, y, this.frame_index);
        }

        get height() {
            return this.sprite_sheet.height;
        }

        get width() {
            return this.sprite_sheet.width;
        }

        get dimensions() {
            return new Vector(this.width, this.height);
        }

        get bounding_box_center() {
            return this.bounding_box.position.plus(this.origin_center);
        }

        get origin_center() {
            return this.dimensions.divided_by(2, 2);
        }

        get origin_center_left() {
            return new Vector(0, this.height / 2);
        }

        get origin_center_right() {
            return new Vector(this.width, this.height / 2);
        }

        get origin_center_top() {
            return new Vector(this.width / 2, 0);
        }

        get origin_center_bottom() {
            return new Vector(this.width / 2, this.height);
        }

        get origin_top_left() {
            return new Vector();
        }

        get origin_top_right() {
            return new Vector(this.width, 0);
        }

        get origin_bottom_right() {
            return this.dimensions.duplicate();
        }

        get origin_bottom_left() {
            return new Vector(0, this.height);
        }

        get source_rectangle() {
            const column_index = (this.frame_index % this.sprite_sheet.columns);
            const row_index = (Math.floor(this.frame_index / this.sprite_sheet.columns) % this.sprite_sheet.rows);
            return new Rectangle({
                position: new Vector(
                    column_index * this.width,
                    row_index * this.height
                ),
                size: new Vector(
                    this.width,
                    this.height
                )
            });
        }

        get bounding_box() {
            const position = this.universe_position.minus(this.origin.times(this.scale));
            return new Rectangle({
                position,
                size: this.dimensions.times(this.scale)
            });
        }
    }

    class AnimatedSprite extends Sprite {
        constructor(options) {
            super(options);
            this.animations = {};
            this.current_animation = null;
            this.seconds_passed = 0;
            this.direction_forward = true;
        }

        add(options) {
            const
                sprite_sheet = options.sprite_sheet,
                sub_animation_name = options.sub_animation_name,
                bouncing = options.bouncing ?? false,
                frame_rate = options.frame_rate || 0.1;
            this.animations[sub_animation_name] = { sprite_sheet, bouncing, frame_rate };
        }

        switch_to(sub_animation_name) {
            if (this.current_animation === this.animations[sub_animation_name]) {
                return;
            }
            this.direction_forward = true;
            this.frame_index = 0;
            this.seconds_passed = 0;
            this.current_animation = this.animations[sub_animation_name];
            this.sprite_sheet = this.current_animation.sprite_sheet;
        }

        update() {
            if (!this.current_animation) {
                return;
            }
            if (this.current_animation && this.sprite_sheet.element_quantity !== 1) {
                this.seconds_passed += (this.time_elapsed / 1000) || 0;
                while (this.seconds_passed > this.current_animation.frame_rate) {
                    this.seconds_passed -= this.current_animation.frame_rate;
                    if (this.direction_forward) {
                        ++this.frame_index;
                    }
                    else {
                        --this.frame_index;
                    }
                    if (this.frame_index >= this.sprite_sheet.element_quantity) {
                        if (this.current_animation.bouncing) {
                            this.direction_forward = false;
                            this.frame_index = help.clamp(this.sprite_sheet.element_quantity - 2, 0, Infinity);
                        }
                        else {
                            this.frame_index = 0;
                            this.direction_forward = true;
                        }
                    }
                    if (this.frame_index < 0) {
                        this.direction_forward = true;
                        this.frame_index = 1;
                    }
                }
            }
            super.update();
        }
    }

    class ButtonSprite extends Sprite {
        constructor(options) {
            super(options);
            this._pressed = this._down = this._up = false;
            this._onclick = (this._options.onclick instanceof Function && this._options.onclick) || (() => null);
        }

        update() {
            super.update();
            if (this.mouse.contains_mouse(this.bounding_box)) {
                this.hover();
            }
            this.up = (this._was_down && !this._down);
            this._was_down = this._down;
            this._pressed = false;
        }

        hover() {
            this.root.canvas_manager.cursor_pointer_on();
        }

        handle_input(e) {
            if (!this.touch || !this.mouse) return;
            this._pressed = this.touch.contains_touch_press(this.bounding_box) || this.mouse.contains_mouse_press(this.bounding_box);
            this._down = this.touch.contains_touch(this.bounding_box) || this.mouse.contains_mouse_down(this.bounding_box);
            if (e && (e.type === 'mouseup' || e.type === 'touchend')) this._onclick(e);
            super.handle_input(e);
        }

        get down() {
            return this.visible && this._down;
        }

        get pressed() {
            return this.visible && this._pressed;
        }
    }

    class BinaryButtonSprite extends ButtonSprite {
        constructor(options) {
            super(options);
            if (this.sprite_sheet.element_quantity < 2) {
                throw new Error(`BINARY BUTTON SPRITE SAYS: REQUIRES TWO ELEMENTS BUT GOT: ${this.sprite_sheet.element_quantity}`);
            }
            this.on = this._options.on ?? false;
            this.on ? (this.frame_index = 1) : (this.frame_index = 0);
        }

        handle_input(e) {
            super.handle_input(e);
            this.pressed && (this.on = !this.on);
            this.on ? (this.frame_index = 1) : (this.frame_index = 0);
        }
    }

    class TernaryButtonSprite extends BinaryButtonSprite {
        constructor(options) {
            super(options);
            if (this.sprite_sheet.element_quantity < 3) {
                throw new Error(`TERNARY BUTTON SPRITE SAYS: REQUIRES THREE ELEMENTS BUT GOT: ${this.sprite_sheet.element_quantity}`);
            }
        }

        handle_input(e) {
            super.handle_input(e);
            this.down ? (this.frame_index = 2) : null;
        }
    }

    class SliderButtonSprite extends ButtonSprite {
        constructor(options) {
            super(options);
            this.starting_value = help.clamp(this._options.starting_value || 0, 0, 1);
            this.length = this._options.length || 300;
            this.line_color = this._options.line_color || 'rgb(0, 0, 0)';
            this.locked_position = this.position.duplicate();
            this.position = this.position.plus(this.starting_value * this.length, 0);
            this.grabbed = false;
            this.grab_start_postition = this.grab_postition = this.grab_type = this.grab_touch = null;
        }

        render() {
            this.context.save();
            this.context.fillStyle = this.line_color;
            this.context.translate(...this.locked_position.array);
            this.context.rotate(this.rotation);
            this.context.fillRect(0, 0, this.length, 2);
            this.context.restore();
            super.render();
        }

        update() {
            if (this.grabbed) {
                if (this.grab_type === 'mouse') {
                    this.position.x = help.clamp(this.grab_start_postition.x + (this.mouse.position.x - this.grab_postition.x), this.locked_position.x, this.length + this.locked_position.x);
                    this.grabbed = this.mouse.left.down;
                }
                else {
                    this.position.x = help.clamp(this.grab_start_postition.x + (this.grab_touch.position.x - this.grab_postition.x), this.locked_position.x, this.length + this.locked_position.x);
                    this.grabbed = this.touch.touches.includes(this.grab_touch);
                }
            }
            super.update();
        }

        handle_input(e) {
            super.handle_input(e);
            if (!this.grabbed && this.pressed) {
                this.grabbed = true;
                this.grab_type = e.type.includes('mouse') ? 'mouse' : 'touch';
                if (this.grab_type === 'mouse') {
                    this.grab_postition = this.mouse.position.duplicate();
                }
                else {
                    this.grab_touch = this.touch.touch_within(this.bounding_box);
                    this.grab_postition = this.grab_touch.position.duplicate();
                }
                this.grab_start_postition = this.position.duplicate();
            }
        }

        hover() {
            if (this.down) {
                this.root.canvas_manager.cursor_grabbing_on();
            }
            else {
                this.root.canvas_manager.cursor_grab_on();
            }
        }

        get value() {
            return (this.position.x - this.locked_position.x) / this.length;
        }
    }

    class AssetManager extends List {
        async load_all(items = []) {
            if (!(items instanceof Array)) {
                throw new Error(`ASSET MANAGER SAYS: LOAD ALL ACCEPTS AN ARRAY BUT GOT: ${items}`);
            }
            items = items.filter(v => v.src instanceof String && v.type instanceof String);
            const promises = items.map(v => this.load(v));
            const assets = await Promise.all(promises);
            this._children.push(...assets);
            return assets;
        }

        async load(options) {
            const { src, type } = options;
            const id = options.id || Symbol();
            if (type && type.toUpperCase && type.toUpperCase() === 'AUDIO') {
                const fetched = await fetch(src);
                const array_buffer = await fetched.arrayBuffer();
                const audio_buffer = await this.audio_context.decodeAudioData(array_buffer);
                const asset = { buffer: audio_buffer, type: type.toUpperCase(), id };
                this._children.push(asset);
                return asset;
            }
            else if (type && type.toUpperCase && type.toUpperCase() === 'IMAGE') {
                const asset = new Image();
                const load_promise = new Promise(resolve => asset.addEventListener('load', resolve));
                asset.src = src;
                await load_promise;
                const sheet = new SpriteSheet({
                    columns: options.columns,
                    rows: options.rows,
                    image: asset,
                    activate_collision_mask: options.activate_collision_mask ?? false,
                    parent: this,
                    id
                });
                this._children.push(sheet);
                return sheet;
            }
            throw new Error(`ASSET MANAGER SAYS: INVALID ASSET TYPE: ${type}`);
        }
    }

    class Universe extends List {
        constructor(options) {
            options.universe_object = true;
            super(options);
            this.target = this._options.target;
            if (!this.target || !(this.target instanceof HTMLElement)) {
                throw new Error(`${this.constructor.name}: NO TARGET ELEMENT`);
            }
            this._paused = false;
            this._frame_rate_window = this._fresh_frame_window;
            this.canvas_manager = new CanvasManager({
                parent: this,
                width: this._options.width || 2400,
                height: this._options.height || 1200,
                alpha: this._options.alpha || true
            });
            this.ui = new UserInterface({ parent: this });
            this.assets = new AssetManager({ parent: this });
            this.audio = new AudioManager({ parent: this });
            this.state_manager = this.add(new StateManager({ parent: this }));
            this.initialize();
        }

        async initialize() {
            await super.initialize();
            this._repeat();
        }

        update() {
            super.update();
            this.ui.update();
            this.canvas_manager.update();
        }

        render() {
            this.canvas_manager.clear();
            super.render();
        }

        _repeat(time) {
            if (!this._paused) {
                this.now = time;
                this._slide_window();
                this.update();
                this.render();
                this.then = this.now;
            }
            window.requestAnimationFrame(t => this._repeat(t));
        }

        reset() {
            super.reset();
            this._frame_rate_window = this._fresh_frame_window;
        }

        _slide_window() {
            this._frame_rate_window.shift();
            this._frame_rate_window.push(this.frame_length);
        }

        get frame_length() {
            return (Math.abs(this.now - this.then));
        }

        get average_frame_rate() {
            return (this._frame_rate_window.reduce((v, acc = 0) => acc + v) / this._frame_rate_window.length);
        }

        get _fresh_frame_window() {
            return new Array(100).fill(16.666);
        }
    }

    return {
        help,
        Vector,
        Shape,
        Rectangle,
        Circle,
        Interface,
        List,
        GridList,
        Label,
        StateManager,
        ButtonState,
        KeyboardManager,
        MouseManager,
        TouchManager,
        UserInterface,
        CanvasManager,
        AudioManager,
        AudioToneList,
        Sprite,
        SpriteSheet,
        AnimatedSprite,
        ButtonSprite,
        ButtonLabel,
        BinaryButtonSprite,
        TernaryButtonSprite,
        SliderButtonSprite,
        AssetManager,
        Universe
    };
})();