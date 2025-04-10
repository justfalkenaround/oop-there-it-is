'use strict';

const cell_division = (() => {
    const {
        Vector,
        Circle,
        Interface,
        Universe
    } = BAREBONES;

    class Cell extends Interface {
        constructor(options) {
            options.universe_object = true;
            super(options);
        }

        initialize() {
            this.age = 0;
            this.random = Math.random();
            this.color = this._options.color || `rgb(${Math.random() * 155 + 100},${Math.random() * 155 + 100}, ${Math.random() * 155 + 100})`;
            this.radius = this._options.radius || (this.canvas.width / 10);
            this._path = new Path2D();
            this._path.arc(0, 0, this.radius, (2 * Math.PI), 0, false);
            super.initialize();
        }

        update() {
            ++this.age;
            this.velocity = this.velocity.mirror_axis(
                this.origin_center.x + this.radius >= this.canvas.width || this.origin_center.x - this.radius <= 0,
                this.origin_center.y + this.radius >= this.canvas.height || this.origin_center.y - this.radius <= 0
            );
            if (this.age % Math.floor(300 * this.random) === 0) {
                this.divide();
            }
            super.update();
        }

        render() {
            this.context.fillStyle = this.color;
            this.context.save();
            this.context.translate(...this.origin_center.array);
            this.context.fill(this._path);
            this.context.restore();
        }

        divide() {
            this.delete_me = true;
            this.root.request_add(new Cell(
                {
                    position: this.position.duplicate().plus(0, (this.radius / 2)),
                    velocity: this.velocity.duplicate().plus(Math.random(), 0.2),
                    radius: (this.radius / 1.3),
                    color: this.color
                }
            ));
            this.root.request_add(new Cell(
                {
                    position: this.position.duplicate().plus(0, -(this.radius / 2)),
                    velocity: this.velocity.duplicate().plus(Math.random(), -0.2),
                    radius: (this.radius / 1.3),
                    color: this.color
                }
            ));
        }

        get origin_center() {
            return new Vector((this.position.x + this.radius), (this.position.y + this.radius));
        }

        get circle() {
            return new Circle({
                position: this.origin_center,
                radius: this.radius
            });
        }
    }

    class CellDivision extends Universe {
        initialize() {
            this.reset();
            super.initialize();
        }

        update() {
            if (this.average_frame_rate > 25) {
                this.reset();
            }
            this._collision_detection();
            super.update();
        }

        reset() {
            super.reset();
            [...this._children, ...this._queue].forEach(v => v instanceof Cell ? v.delete_me = true : null);
            this.add(new Cell(
                {
                    position: new Vector((this.canvas.width / 1.5), this.canvas.height / 2),
                    velocity: new Vector(0.25, Math.random() * 0.4),
                }
            ));
            this.add(new Cell(
                {
                    position: new Vector((this.canvas.width / 6), this.canvas.height / 2),
                    velocity: new Vector(-0.25, Math.random() * -0.4),
                }
            ));
        }

        _collision_detection() {
            const cells = this._children.filter(v => v instanceof Cell);
            for (let i = 0, j = cells.length; i < j; i++) {
                const outer = cells[i];
                if (outer.delete_me) continue;
                for (let k = (i + 1); k < j; k++) {
                    const inner = cells[k];
                    if (inner.delete_me) continue;
                    if (outer.color !== inner.color && outer.circle.intersects_with(inner.circle)) {
                        outer.delete_me = true;
                        inner.delete_me = true;
                        break;
                    }
                }
            }
        }
    }

    return {
        CellDivision
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.cell-division-target')).forEach(target => {
        new cell_division.CellDivision({ target });
    });
});