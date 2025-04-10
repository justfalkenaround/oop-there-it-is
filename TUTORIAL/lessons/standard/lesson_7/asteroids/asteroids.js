'use strict';

const asteroids = (() => {
    const {
        help,
        Vector,
        Sprite,
        Universe
    } = BAREBONES;

    class Asteroid extends Sprite {
        constructor(options) {
            super(options);
            this.awaiting_space = true;
            this.rotation = (Math.random() * (2 * Math.PI));
        }

        update() {
            this.awaiting_space && (this.awaiting_space = this.root._is_intersecting(this));
            if (!this.root.canvas_manager.bounding_box.scaled_up_by(1.5, 1.5).contains(this.universe_position)) {
                this.velocity = this.root.canvas_manager
                    .bounding_box
                    .random_within_middle
                    .minus(this.universe_position)
                    .normalized();
            }
            super.update();
        }

        impact() {
            if (this.sprite_sheet !== this.root.roid_sheet_8) {
                for (let i = 0, j = Math.floor(Math.random() * 3) + 1; i < j; i++) {
                    const
                        radian = (2 * Math.PI),
                        step = (radian / j),
                        unit_circle = Vector.radians_to_unit_circle_vector(i * step + this.rotation % radian);
                    this.root.request_add(new Asteroid(
                        {
                            position: this.position.duplicate(),
                            velocity: this.velocity.plus(unit_circle),
                            sprite_sheet:
                                this.sprite_sheet === this.root.roid_sheet_5
                                    ?
                                    this.root.roid_sheet_6
                                    :
                                    this.sprite_sheet === this.root.roid_sheet_6
                                        ?
                                        this.root.roid_sheet_7
                                        :
                                        this.root.roid_sheet_8,
                        }
                    ));
                }
            }
            else {
                this.root.queue_new_roid();
            }
            this.audio.play_track({
                audio_buffer: this.root.crash_sound.buffer,
                duration: 0.2,
                offset: 0.1,
                volume: 0.25
            });
            this.delete_me = true;
        }

        bump(other) {
            this.velocity = this.velocity.plus(other.velocity).mirror_axis(true, true);
        }
    }

    class Projectile extends Sprite {
        update() {
            if (!this.root.canvas_manager.bounding_box.contains(this.universe_position)) {
                this.delete_me = true;
            }
            super.update();
        }
    }

    class Ship extends Sprite {
        update() {
            if (this.keyboard.is_pressed(' ')) {
                this.root.request_add(new Projectile({
                    position: this.universe_position.duplicate(),
                    velocity: Vector.radians_to_unit_circle_vector(this.rotation - ((2 * Math.PI) / 4)).times(5, 5),
                    sprite_sheet: this.root.projectile_sheet
                }));
                this.audio.play_tone({ duration: 0.03, scale: 2, volume: 0.3 });
            }
            this.keyboard.is_down('ArrowLeft') && (this.rotation -= 0.05);
            this.keyboard.is_down('ArrowRight') && (this.rotation += 0.05);
            this.keyboard.is_down('w') && (this.position.y -= 3);
            this.keyboard.is_down('s') && (this.position.y += 3);
            this.keyboard.is_down('a') && (this.position.x -= 3);
            this.keyboard.is_down('d') && (this.position.x += 3);
            if (!this.root.canvas_manager.bounding_box.contains(this.universe_position)) {
                return this.root._game_over();
            }
            super.update();
        }
    }

    class Asteroids extends Universe {
        async initialize() {
            this.ship_sheet = await this.assets.load({
                src: DATA_URLS.SHIP,
                id: 'ship',
                type: 'image',
                activate_collision_mask: true
            });
            this.projectile_sheet = await this.assets.load({
                src: DATA_URLS.PROJECTILE,
                id: 'projectile',
                type: 'image',
                activate_collision_mask: true
            });
            this.roid_sheet_5 = await this.assets.load({
                src: DATA_URLS.ASTEROID_5,
                id: 'roid_5',
                type: 'image',
                activate_collision_mask: true
            });
            this.roid_sheet_6 = await this.assets.load({
                src: DATA_URLS.ASTEROID_6,
                id: 'roid_6',
                type: 'image',
                activate_collision_mask: true
            });
            this.roid_sheet_7 = await this.assets.load({
                src: DATA_URLS.ASTEROID_7,
                id: 'roid_7',
                type: 'image',
                activate_collision_mask: true
            });
            this.roid_sheet_8 = await this.assets.load({
                src: DATA_URLS.ASTEROID_8,
                id: 'roid_8',
                type: 'image',
                activate_collision_mask: true
            });
            this.crash_sound = await this.assets.load({
                src: DATA_URLS.CRASH_SOUND,
                id: 'crash_sound',
                type: 'audio'
            });
            this.ship = this.add(new Ship(
                {
                    position: new Vector(this.canvas.width / 2, this.canvas.height / 2),
                    sprite_sheet: this.ship_sheet,
                    id: 'ship',
                }
            ));
            this.reset();
            super.initialize();
        }

        update() {
            this._collision_detection();
            super.update();
        }

        queue_new_roid() {
            let position = this.root.canvas_manager.bounding_box.scaled_up_by(1.5, 1.5).random_within;
            while (this.root.canvas_manager.bounding_box.contains(position)) {
                position = this.root.canvas_manager.bounding_box.scaled_up_by(1.5, 1.5).random_within;
            }
            const velocity = this.root.canvas_manager
                    .bounding_box
                    .random_within_middle
                    .minus(position)
                    .normalized();
            const variance = help.clamp(Math.random() * 2, 1, 2);
            const roid = this.request_add(new Asteroid(
                {
                    position,
                    velocity: velocity.times(variance, variance),
                    sprite_sheet: this.roid_sheet_5,
                }
            ));
        }

        reset() {
            super.reset();
            [...this._children, ...this._queue]
                .forEach(v => v instanceof Asteroid || v instanceof Projectile ? v.delete_me = true : null);
            for (let i = 0; i < 15; i++) {
                this.queue_new_roid();
            }
            this.ship.rotation = 0;
            this.ship.position = this.canvas_manager.canvas_center;
        }

        _collision_detection() {
            const live_objects = this._children.filter(v => v instanceof Asteroid || v instanceof Projectile);
            for (let i = 0, j = live_objects.length; i < j; i++) {
                const outer = live_objects[i];
                if (outer.delete_me) continue;
                if (outer instanceof Asteroid && outer.collides_with(this.ship)) {
                    return this._game_over();
                }
                for (let k = (i + 1); k < j; k++) {
                    const inner = live_objects[k];
                    if (inner.delete_me || inner instanceof Projectile && outer instanceof Projectile) continue;
                    if (outer.collides_with(inner)) {
                        if (inner instanceof Asteroid && outer instanceof Asteroid) {
                            if (!(inner.awaiting_space && outer.awaiting_space)) {
                                inner.bump(outer);
                                outer.bump(inner);
                            }
                        }
                        else {
                            (outer instanceof Projectile) ? (outer.delete_me = true) : (outer.impact());
                            (inner instanceof Projectile) ? (inner.delete_me = true) : (inner.impact());
                        }
                    }
                }
            }
        }

        _is_intersecting(roid) {
            const roids = this._children.filter(v => v instanceof Asteroid);
            for (let i = 0, j = roids.length; i < j; i++) {
                if (roids[i] === roid) {
                    continue;
                }
                if (roids[i].bounding_box.intersects_with(roid.bounding_box)) {
                    return true;
                }
            }
            return false;
        }

        _game_over() {
            this.reset();
        }
    }

    return {
        Asteroids
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.asteroids-target')).forEach(target => {
        new asteroids.Asteroids({ width: 2000, height: 1000, target });
    });
});