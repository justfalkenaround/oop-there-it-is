'use strict';

/*_____ X ______*/

/*_____ EXPORT A GALAGA-ISH OBJECT ______*/
const galaga = (() => {

    /*_____ IMPORT SOME CLASSES FROM BAREBONES ______*/
    const {
        help,
        Vector,
        Sprite,
        List,
        AudioToneList,
        GridList,
        Label,
        Universe
    } = BAREBONES;


    /*_____
    
    ' ' = BLANK SPACE
    'd' = ENEMY SHIP DOUBLE
    's' = ENEMY SHIP SINGLE
    
    ______*/

    /*_____ USING A SCENE GRAPH TO ENCODE THE LEVEL BUILDING PROCESS ______*/
    const level_one_matrix = [
        [' ', 'd', 'd', 's', 's', 's', 's', 's', 's', 'd', 'd', ' '],
        ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd'],
        ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd'],
        ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd'],
    ];

    /*_____ CLASS FOR AN INVISIBLE SPRITE WITH NO ADDITIONAL LOGIC ______*/
    class BlankShip extends Sprite {
        constructor(options) {
            super(options);
            this.visible = false;
        }
    }

    /*_____ PROJECTILE CLASS THAT DELETES ITSELF WHEN OUT OF BOUNDS ______*/
    class Projectile extends Sprite {
        update() {
            /*_____ IF OUTSIDE OF CANVAS RECTANGLE ______*/
            if (!this.root.canvas_manager.bounding_box.contains(this.universe_position)) {
                /*_____ QUEUE FOR DELETION ______*/
                this.delete_me = true;
            }
            super.update();
        }
    }

    /*_____ CLASS FOR TEMPORARY EXPLOSIONS FOR SHIP IMPACTS ______*/
    class Explosion extends Sprite {
        initialize() {
            /*_____ GIVE IT A SHORT LIFESPAN OF TEN TICKS ______*/
            this.life_remaining = 10;
            super.initialize();
        }

        update() {
            /*_____ DECREMENT THE LIFE EVERY TICK ______*/
            --this.life_remaining;
            /*_____ UNTIL IT RUNS OUT AND DELETE ______*/
            if (this.life_remaining <= 0) {
                this.delete_me = true;
            }
            super.update();
        }
    }

    /*_____ ENEMY SHIP CLASS ENCAPSULATES ALL OF THE ENEMY LOGIC ______*/
    class EnemyShip extends Sprite {
        initialize() {
            /*_____ SOME STATE VARIABLES ______*/
            this._fire_delay = 0;
            this.enemy = true;
            this._attacking = false;
            super.initialize();
        }

        update() {
            /*_____ DECREMENT THE FIRE DELAY SO ANOTHER FIRE CAN OCCUR ______*/
            --this._fire_delay;
            /*_____ ATTACK RANDOMLY AND BREAK FROM FORMATION ______*/
            !this._attacking && Math.random() < 0.0001 && this.parent.parent.attacker_count < 6 && this._attack();
            /*_____ IF IS OUT OF BOUNDS EXCEPT THE TOP OF THE SCREEN ______*/
            if (
                this.universe_position.y - (this.height / 2) > this.canvas.height
                ||
                this.universe_position.x - (this.width / 2) > this.canvas.width
                ||
                this.universe_position.x + (this.width / 2) < 0
            ) {
                /*_____ PLACE IT ABOVE THE SCREEN SOMEWHERE ______*/
                this.position = new Vector(this.canvas.width * Math.random(), -250);
                /*_____ ATTACK AGAIN ______*/
                this._attack();
            }
            /*_____ IF ATTACKING UPDATE ATTACK ______*/
            this._attacking && this._update_attack();
            super.update();
        }

        _update_attack() {
            /*_____ RANDOMLY SWITCH X VELOCITY TO FAKE OUT THE PLAYER ______*/
            Math.random() < 0.001 && (this.velocity = this.velocity.mirror_axis(true, false));
            /*_____ IF ENEMY SINGLE ______*/
            if (this.sprite_sheet === this.root.enemy_ship_single_sheet) {
                /*_____ FIRE RANDOMLY IF READY ______*/
                Math.random() < 0.020 && this._fire_delay <= 0 && this._fire();
                /*_____ DETERMINE THE DIRECTION VECTOR FROM THE ENEMY TO THE PLAYER ______*/
                const direction_vector = this.root.find_id('player_ship')
                    /*_____ SUBTRACT AND NORMALIZE ______*/
                    .universe_position.minus(this.universe_position).normalized();
                /*_____ SET THE ROTATION TO FACE THE PLAYER ______*/
                /*_____ ROTATE UNIT CIRCLE 45 DEGREES TO CORRECT ______*/
                this.rotation = Vector.radians_from_vector(direction_vector) - ((2 * Math.PI) / 4);
                /*_____ ZOOM TOWARD THE PLAYER A BIT ______*/
                this.velocity = this.velocity.plus(direction_vector.divided_by(30, 30));
            }
            else {
                /*_____ DOUBLE SHIPS JUST FIRE RANDOMLY ______*/
                Math.random() < 0.005 && this._fire();
            }
        }

        _attack() {
            /*_____ ONLY IF THIS IS THE FIRST INVOCATION OF ATTACK ______*/
            if (!this._attacking) {
                /*_____ PLAY THE LAUNCHING SOUND ______*/
                this.root.launching_sound.play();
                /*_____ UPDATE PARENT ATTACK TIMER ______*/
                this.parent.parent.report_attack();
            }
            /*_____ SET ATTACK FLAG ______*/
            this._attacking = true;
            /*_____ CLAMP THE NEW VELOCITY WITHIN A RANDOM RANGE ______*/
            this.velocity = new Vector(
                help.clamp(Math.random(), 0.5, 1),
                help.clamp(Math.random(), 0.5, 1)
            ).mirror_axis(Math.random() > 0.5, false).times(3, 3);
        }

        _fire() {
            /*_____ TO FIRE SET THE DELAY ______*/
            this._fire_delay = 20;
            /*_____ CREATE A NEW PROJECTILE ______*/
            const projectile = new Projectile({
                position: this.position.duplicate(),
                /*_____ DIRECTION VECTOR TO THE PLAYER ______*/
                velocity: this.root.find_id('player_ship').position.minus(this.universe_position).normalized().times(3, 3),
                sprite_sheet: this.root.projectile_sheet
            });
            /*_____ FLAG IT AS ENEMEY FOR COLLISION DETECTION ______*/
            projectile.enemy = true;
            /*_____ CLAMP THE VELOCITY SO THAT ENEMY SHIPS DONT FIRE HORIZONATLLY ______*/
            projectile.velocity = new Vector(projectile.velocity.x, help.clamp(projectile.velocity.y, 5, Infinity));
            /*_____ ADD THE PROJECTILE TO THE UNIVERSE ______*/
            this.parent.request_add(projectile);
            /*_____ ENEMY FIRING SOUND ______*/
            this.audio.play_tone({ duration: 0.03, scale: 3, volume: 0.3 });
        }
    }

    class PlayerShip extends Sprite {
        initialize() {
            /*_____ DEBOUNCE FIRING ______*/
            this._fire_delay = 0;
            super.initialize();
        }

        update() {
            --this._fire_delay;
            /*_____ IF FIRING IS READY AND SPACE PRESSED ______*/
            if (this._fire_delay <= 0 && this.keyboard.is_pressed(' ')) {
                /*_____ CREATE AND ADD A NEW PROJECTILE TO THE UNIVERSE ______*/
                this.parent.request_add(new Projectile({
                    position: this.universe_position.duplicate(),
                    /*_____ VERTICAL VELOCITY ______*/
                    velocity: new Vector(0, -10),
                    sprite_sheet: this.root.projectile_sheet
                }));
                /*_____ PLAYER FIRING SOUND ______*/
                this.audio.play_tone({ duration: 0.03, scale: 2, volume: 0.3 });
                /*_____ RESET THE FIRE DELAY ______*/
                this._fire_delay = 40;
            }
            (   /*_____ MOVE LEFT ______*/
                this.keyboard.is_down('ArrowLeft') || this.keyboard.is_down('a')
            ) && (this.position.x -= this.canvas.width / 200);
            (   /*_____ MOVE RIGHT ______*/
                this.keyboard.is_down('ArrowRight') || this.keyboard.is_down('d')
            ) && (this.position.x += this.canvas.width / 200);
            /*_____ CLAMP THE SHIP POSITION WITHIN THE CANVAS ______*/
            this.position.x = help.clamp(this.position.x, this.width / 2, this.canvas.width - this.width / 2);
            super.update();
        }
    }

    class Level extends List {
        initialize() {
            /*_____ STATE VARIABLES ______*/
            this.attacker_count = 0;
            this._last_attack = this.now;
            this._scene_graph = this._options.scene_graph || [];
            /*_____ CALL RESET INITIALLY ______*/
            this.reset();
            super.initialize();
        }

        update() {
            /*_____ RUN THE COLLISION DETECTION ______*/
            this._collision_detection();
            const ships_remaining = this.find_all(v => v instanceof EnemyShip);
            /*_____ LOG THE CURRENT NUMBER OF ATTACKING SHIPS ______*/
            this.attacker_count = ships_remaining.filter(v => v._attacking).length;
            /*_____ IF NO ENEMY SHIPS THEN GAME WIN ______*/
            if (!ships_remaining.length) {
                /*_____ RESET SWITCH AND SOUND ______*/
                this.root.reset();
                this.root.state_manager.request_switch_to(this.root.end_screen);
                this.root.level_up_sound.play();
            }
            /*_____ IF THERE ARE ONLY 5 OR LESS LAUNCH THEM ALL ______*/
            else if (ships_remaining.length < 6) {
                ships_remaining.forEach(v => !v._attacking && v._attack());
            }
            /*_____ IF AN ATTACK HASENT HAPPENED FOR 2500 MS THEN PICK A SHIP AND LAUNCH IT ______*/
            else if (this.attacker_count < 6 && this.now - this._last_attack > 2500) {
                /*_____ SHUFFLE RANDOMLY ______*/
                ships_remaining.sort(() => Math.random() - 0.5);
                ships_remaining[0]._attack();
            }
            super.update();
        }

        report_attack() {
            /*_____ UPDATE ATTACK TIME ______*/
            this._last_attack = this.now;
        }

        reset() {
            /*_____ TO RESET/SET CLEAR ALL CHILDREN ______*/
            this.clear();
            /*_____ CREATE AND ADD THE PLAYER SHIP ______*/
            this.player_ship = this.add(new PlayerShip({
                /*_____ POSITION CENTER BOTTOM ISH ______*/
                position: new Vector(this.canvas.width / 2, this.canvas.height - this.root.player_ship_sheet.height),
                sprite_sheet: this.root.player_ship_sheet,
                id: 'player_ship'
            }));
            /*_____ CREATE A GRID TO REPRESENT THE ENEMY FORMATION ______*/
            this.enemy_grid = this.add(new GridList({
                /*_____ COLUMNS ARE THE LONGEST REGISTERED ARRAY WITHIN THE SCENE GRAPH ______*/
                columns: Math.max(...this._scene_graph.map(v => v.length)),
                /*_____ NUMBER OF ARRAYS ______*/
                rows: this._scene_graph.length,
                /*_____ SET THE WIDTH AND HEIGHT TO THAT OF A ENEMY SHIP ______*/
                cell_width: this.root.enemy_ship_double_sheet.width,
                cell_height: this.root.enemy_ship_double_sheet.height,
                /*_____ CENTER THE GRID ON X BUT NOT Y ______*/
                center: { x: true, y: false },
                /*_____ OFFSET THE GRID A BIT FROM THE TOP OF THE CANVAS ______*/
                position: new Vector(0, 100)
            }));
            /*_____ FILL THE GRID WITH BLANKS ______*/
            for (let i = 0; i < this.enemy_grid.cell_quantity; i++) {
                this.enemy_grid.add(new BlankShip({ sprite_sheet: this.root.enemy_ship_double_sheet }));
            }
            /*_____ LOOP OVER THE SCENE GRAPH TO REPLACE BLANKS WITH SHIPS ______*/
            for (let i = 0; i < this._scene_graph.length; i++) {
                for (let x = 0; x < this._scene_graph[i].length; x++) {
                    /*_____ SKIP SPACES ______*/
                    if (this._scene_graph[i][x] === ' ') continue;
                    /*_____ DEPENDING ON THE CHARACTER USE DIFFERENT SPRITESHEETS ______*/
                    this.enemy_grid.replace_at(new EnemyShip({
                        sprite_sheet:
                            this._scene_graph[i][x] === 'd'
                                ? this.root.enemy_ship_double_sheet
                                : this._scene_graph[i][x] === 's'
                                    ? this.root.enemy_ship_single_sheet
                                    : this.root.enemy_ship_double_sheet,
                    }), x, i);
                }
            }
            /*_____ DONT FORGET TO CALL SUPER METHOD ______*/
            super.reset();
        }

        _collision_detection() {
            /*_____ USE A HELPER METHOD TO BRING ALL TREE NODES TO A SURFACE ARRAY ______*/
            const flattened_tree = help.flatten_tree(this);
            /*_____ LOOP OVER THE FLAT TREE ______*/
            for (let i = 0, j = flattened_tree.length; i < j; i++) {
                /*_____ NAME THE OUTER ITEM ______*/
                const outer = flattened_tree[i];
                /*_____ IF ANY CONDITIONS THAT WOULD WARRANT NO COLLISION APPLY THEN SKIP ______*/
                if (
                    outer instanceof Explosion
                    ||
                    !outer.visible
                    ||
                    outer === this.player_ship
                    ||
                    outer.delete_me
                    ||
                    !this.root.canvas_manager.bounding_box.scaled_up_by(1.1, 1.1).contains(outer.universe_position)
                ) continue;
                /*_____ IF IS ENEMY ______*/
                if (outer.enemy) {
                    /*_____ ANY ENEMY OBJECT COLLIDING WITH PLAYER IS GAME OVER ______*/
                    if (outer.collides_with(this.player_ship)) {
                        /*_____ RESET SOUND SWITCH ______*/
                        this.root.reset();
                        this.root.nightmare_sound.play();
                        return this.root.state_manager.request_switch_to(this.root.end_screen);
                    }
                }
                /*_____ LOOP FORWARD AGAIN FROM ONE INDEX FURTHUR THAN OUTER IS TO ELEMINATE DUPLICATE CHECKS ______*/
                for (let k = (i + 1); k < j; k++) {
                    const inner = flattened_tree[k];
                    /*_____ CHECK FOR SKIP ______*/
                    if (
                        (outer.enemy && inner.enemy)
                        ||
                        !outer.visible
                        ||
                        inner.delete_me
                        ||
                        !this.root.canvas_manager.bounding_box.scaled_up_by(1.1, 1.1).contains(inner.universe_position)
                    ) continue;
                    /*_____ FINALLY IF THE CONDITIONS APPLY REGISTER A COLLISION ______*/
                    if (!(outer instanceof Projectile && inner instanceof Projectile) && outer.collides_with(inner)) {
                        /*_____ DELETE BOTH ITEMS ______*/
                        inner.delete_me = true;
                        outer.delete_me = true;
                        /*_____ CREATE AND ADD AN EXPLOSION ______*/
                        this.parent.request_add(new Explosion({
                            position: inner.position.duplicate(),
                            sprite_sheet: this.root.explosion_sheet
                        }));
                        /*_____ PLAY THE IMPACT SOUND ______*/
                        this.audio.play_track({
                            audio_buffer: this.root.crash_sound.buffer,
                            duration: 0.5,
                            offset: 0.3,
                            volume: 0.25
                        });
                    }
                }
            }
        }
    }

    /*_____ PLAYSCREEN GAMESTATE REPRESENTS THE STARTING MENU ______*/
    class PlayScreen extends List {
        initialize() {
            /*_____ WAIT FOR THE USER TO PRESS ENTER BEFORE ACTING ______*/
            this.entered = false;
            /*_____ STORE A PROPERTY TO REPRESENT REMAINING TIME AFTER ENTER IS PRESSED BEFORE GAME START ______*/
            this.time_remaining = 160;
            /*_____ ADD A LABEL PROMPTING THE USER TO PRESS ENTER IN SCREEN CENTER ______*/
            this.play = this.add(new Label({
                position: this.root.canvas_manager.canvas_center,
                contents: 'PRESS ENTER TO PLAY',
                color: 'lightgreen',
                font_size: '140px',
                origin_center: true
            }));
            super.initialize();
        }

        update() {
            /*_____ IF THE USER HAS NOT YET PRESSED ENTER ______*/
            if (!this.entered) {
                /*_____ AND THEY ARE PRESSING NOW ______*/
                if (this.keyboard.is_pressed('Enter')) {
                    /*_____ REGISTER THE CHANGE ______*/
                    this.entered = true;
                    /*_____ REMOVE THE PROMPT LABEL ______*/
                    this.remove(this.play);
                    /*_____ ADD A NEW LABEL WARNING THE USER THAT THE GAME IS ABOUT TO START ______*/
                    this.ready = this.request_add(new Label({
                        position: this.root.canvas_manager.canvas_center,
                        contents: 'GET READY',
                        color: 'red',
                        font_size: '140px',
                        origin_center: true
                    }));
                }
            }
            /*_____ IF TIME IS UP ______*/
            else if (this.time_remaining <= 0) {
                /*_____ RESET SWITCH SOUND ______*/
                this.reset();
                this.root.state_manager.request_switch_to(this.root.level_one);
                this.root.buzzing_sound.loop();
            }
            /*_____ OTHERWISE DECREMENT THE TIMER ______*/
            else {
                --this.time_remaining;
            }
            super.update();
        }
    }

    /*_____ ENDSCREEN STATE LIKE THE INTRO STATE WILL DISSAPEAR AFTER A BRIEF PERIOD ______*/
    class EndScreen extends List {
        initialize() {
            /*_____ 200 TICKS TO DISPLAY GAME OVER MESSAGE ______*/
            this.time_remaining = 200;
            /*_____ ADD THE GAME OVER LABEL ______*/
            this.add(new Label({
                position: this.root.canvas_manager.canvas_center,
                contents: 'GAME OVER',
                color: 'red',
                font_size: '140px',
                origin_center: true
            }));
            super.initialize();
        }

        update() {
            /*_____ DECREMENT THE TIMER ______*/
            --this.time_remaining;
            /*_____ IF TIME IS UP SWITCH TO INTRO SCREEN STATE ______*/
            if (this.time_remaining <= 0) {
                this.root.state_manager.request_switch_to(this.root.play_screen);
            }
            super.update();
        }
    }

    /*_____ RANDOM COMBO OF CRAZY BLEEPS AND BLOOPS ______*/
    class NightmareSound extends AudioToneList {
        play() {
            for (let i = 0; i < 100; i++) {
                this.add(this.audio.play_tone({
                    /*_____ FREQUENCY RANDOM WITHIN 1000 ______*/
                    frequency: Math.random() * 1000,
                    duration: 0.02,
                    delay: (i * 0.02),
                    volume: 0.1
                }));
            }
        }
    }

    /*_____ WALK UP THE OCTAVES ______*/
    class LevelUpSound extends AudioToneList {
        play() {
            for (let i = 0; i < 4; i++) {
                this.add(this.audio.play_tone({
                    scale: (i + 2),
                    note: 'A',
                    duration: 0.07,
                    delay: (i * 0.07)
                }));
            }
        }
    }

    /*_____ LOOP DOWN IN FREQUENCY TO CREATE GALAGA LAUNCHING SOUND ______*/
    class LaunchingSound extends AudioToneList {
        play() {
            for (let i = 0; i < 40; i++) {
                this.add(this.audio.play_tone({
                    frequency: 1000 - (i * 20),
                    duration: 0.03,
                    delay: (i * 0.03),
                    volume: 0.1
                }));
            }
        }
    }

    /*_____ ENDLESS LOOP OF RETRO GAME BACKGROUND SOUND ______*/
    class BuzzingSound extends AudioToneList {
        play() {
            const notes = [
                { s: 2, n: 'G' },
                { s: 2, n: 'G#' },
                { s: 2, n: 'A' },
                { s: 2, n: 'G#' },
            ];
            notes.forEach((v, i) => {
                this.add(this.audio.play_tone({
                    scale: v.s,
                    note: v.n,
                    duration: 0.1,
                    delay: (i * 0.1),
                    volume: 0.06
                }));
            });
        }
    }

    /*_____ GALAGA UNIVERSE LOADS UP THE ASSETS AND DEFINES RESET ______*/
    class Galaga extends Universe {
        /*_____ ASSET LOADING IS ASYNC ______*/
        async initialize() {
            /*_____ LOAD IMAGE ASSETS AS SPRITESHEETS ______*/
            this.player_ship_sheet = await this.assets.load({
                /*_____ SOURCES ARE DATA URL BASE 64 ENCODED TO AVOID CORS ERRORS WITH CANVAS READS ______*/
                src: DATA_URLS.PLAYER_SHIP,
                id: 'player_ship',
                type: 'image',
                /*_____ ACTIVATE PER PIXEL COLLISION DETECTION ______*/
                activate_collision_mask: true
            });
            this.enemy_ship_single_sheet = await this.assets.load({
                src: DATA_URLS.ENEMY_SHIP_SINGLE,
                id: 'enemy_ship_single',
                type: 'image',
                activate_collision_mask: true
            });
            this.enemy_ship_double_sheet = await this.assets.load({
                src: DATA_URLS.ENEMY_SHIP_DOUBLE,
                id: 'enemy_ship_double',
                type: 'image',
                activate_collision_mask: true
            });
            this.projectile_sheet = await this.assets.load({
                src: DATA_URLS.PROJECTILE,
                id: 'projectile',
                type: 'image',
                activate_collision_mask: true
            });
            this.explosion_sheet = await this.assets.load({
                src: DATA_URLS.EXPLOSION,
                id: 'explosion',
                type: 'image',
            });
            /*_____ LOAD AUDIO TRACK AS WELL ______*/
            this.crash_sound = await this.assets.load({
                src: DATA_URLS.CRASH_SOUND,
                id: 'crash_sound',
                type: 'audio'
            });
            /*_____ CREATE SOUND OBJECTS ______*/
            this.level_up_sound = new LevelUpSound({ parent: this });
            this.buzzing_sound = new BuzzingSound({ parent: this });
            this.launching_sound = new LaunchingSound({ parent: this });
            this.nightmare_sound = new NightmareSound({ parent: this });
            /*_____ RESET TO SET INITIALLY ______*/
            this.reset();
            /*_____ SWITCH TO THE INTRO SCREEN ______*/
            this.state_manager.request_switch_to(this.play_screen);
            super.initialize();
        }

        reset() {
            /*_____ RECREATE NEW UI STATES ______*/
            this.play_screen = new PlayScreen({ parent: this });
            this.end_screen = new EndScreen({ parent: this });
            /*_____ KILL ANY AUDIO IN PROGRESS ______*/
            this.level_up_sound.stop();
            this.buzzing_sound.stop();
            this.launching_sound.stop();
            this.nightmare_sound.stop();
            /*_____ RECREATE LEVEL ______*/
            this.level_one = new Level({
                parent: this,
                scene_graph: level_one_matrix
            });
            super.reset();
        }
    }

    /*_____ EXPORT THE GAME ENTRY POINT ______*/
    return {
        Galaga
    };
})();

/*_____ LOOP OVER TARGETS AND CREATE UNIVERSES ______*/
window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.galaga-target')).forEach(target => {
        /*_____ ASPECT RATIO MORE LIKE AN ARCADE GAME ______*/
        new galaga.Galaga({ width: 2000, height: 1600, target });
    });
});