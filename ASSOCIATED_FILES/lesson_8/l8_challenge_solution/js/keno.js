'use strict';

/*_____ X ______*/

/*_____

THIS CHALLENGE SOLUTION INCLUDES SOME BONUS MULTIPLIER TILES

EVERY TURN THE COMPUTER PICKS TWO ADDITIONAL TILES AT RANDOM

IF ONE OF THESE BONUS TILES IS HIT THERE IS A TWO TIMES MULTIPLIER

IF BOTH ARE HIT THERE IS A FIVE TIMES MULTIPLIER

TERTIERY SOUND AND MONEYWAGGER OUTPUT IN ENDPLAY ARE WEIGHTED WITH THE MULTIPLIERS

THIS WAY WITH A MULTIPLIER THE PLAY MIGHT SEE THE MONEYWAGGER WITH ONE OR TWO LESS CATCHES THAN OTHERWISE

THIS IS A SIMPLE EXAMPLE OF BONUS ROUNDS

YOU ARE ENCOURAGED TO ATTEMPT A MINI GAME OR SUB-STATE BONUS LIKE FREE GAMES

______*/

/*_____ COMMENTS WILL ONLY APPEAR WITH BONUS CHANGES ______*/

const keno = (() => {

    const {
        help,
        Vector,
        Sprite,
        List,
        AudioToneList,
        GridList,
        Label,
        ButtonLabel,
        ButtonSprite,
        SliderButtonSprite,
        AnimatedSprite,
        Universe
    } = BAREBONES;

    class NightmareSound extends AudioToneList {
        play() {
            for (let i = 0; i < 100; i++) {
                this.add(this.audio.play_tone({
                    frequency: Math.random() * 1000,
                    duration: 0.02,
                    delay: (i * 0.02),
                    volume: 0.1
                }));
            }
        }
    }

    /*_____ BONUS SOUND FOR WHEN THE COMPUTER HIT A BONUS TILE ______*/
    class BonusSound extends AudioToneList {
        play() {
            /*_____ SAME AS WIN BUT UP AN OCTAVE AND FASTER ______*/
            this.add(this.audio.play_tone({ scale: 6, note: 'D#', duration: 0.1, delay: 0, volume: 0.4 }));
            this.add(this.audio.play_tone({ scale: 6, note: 'G', duration: 0.1, delay: 0.05, volume: 0.4 }));
        }
    }

    class WinSound extends AudioToneList {
        play() {
            this.add(this.audio.play_tone({ scale: 5, note: 'D#', duration: 0.2, delay: 0, volume: 0.4 }));
            this.add(this.audio.play_tone({ scale: 5, note: 'G', duration: 0.2, delay: 0.1, volume: 0.4 }));
        }
    }

    class BigWinSound extends AudioToneList {
        play() {
            this.add(this.audio.play_tone({ scale: 4, note: 'D#', duration: 0.2, delay: 0, volume: 0.5 }));
            this.add(this.audio.play_tone({ scale: 4, note: 'G', duration: 0.2, delay: 0.1, volume: 0.5 }));
            this.add(this.audio.play_tone({ scale: 5, note: 'D#', duration: 0.2, delay: 0.2, volume: 0.5 }));
            this.add(this.audio.play_tone({ scale: 5, note: 'G', duration: 0.2, delay: 0.3, volume: 0.5 }));
            this.add(this.audio.play_tone({ scale: 6, note: 'D#', duration: 0.2, delay: 0.4, volume: 0.5 }));
            this.add(this.audio.play_tone({ scale: 6, note: 'G', duration: 0.2, delay: 0.5, volume: 0.5 }));
        }
    }

    class JackpotSound extends AudioToneList {
        play() {
            for (let i = 0; i < 40; i++) {
                this.add(this.audio.play_tone({
                    frequency: 600 + (i * 20),
                    duration: 0.03,
                    delay: (i * 0.03),
                    volume: 0.6
                }));
            }
        }
    }

    class HelpScreenState extends List {
        initialize() {

            this._back_button = this.add(new ButtonLabel({
                position: new Vector(90, 30),
                contents: `GO BACK`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.23, 1.3),
                memoize: true,
                stroke: true
            }));

            this._info_label = this.add(new Label({
                position: new Vector(90, 180),
                contents:
                    'SELECT BETWEEN TWO AND TEN NUMBERS ON THE BOARD\n\nSELECTIONS CAN BE MADE BY CLICKING, TAPPING, OR DRAGGING THE BOARD\n\nSELECT A BET SIZE YOU CAN COVER\n\nUSE THE UP/DOWN BUTTONS OR KEYS TO CHANGE BET AMOUNT\n\nPLAY BY PRESSING THE PLAY BUTTON OR SPACE OR ENTER KEYS\n\nYOU CAN RANDOMIZE OR CLEAR PICKS BY PRESSING THE CORRESPONDING BUTTONS',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.02, 1.1),
                memoize: true,
                stroke: true
            }));

            super.initialize();
        }

        update() {
            this._back_button.up && (this.root.state_manager.request_switch_to_previous_state() || this.root.dot_sound());
            super.update();
        }
    }

    class SettingsScreenState extends List {
        initialize() {
            this._back_button = this.add(new ButtonLabel({
                position: new Vector(90, 30),
                contents: `GO BACK`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.23, 1.3),
                memoize: true,
                stroke: true
            }));

            this._reset_cash_button = this.add(new ButtonLabel({
                position: new Vector(400, 30),
                contents: `RESET CASH`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.23, 1.3),
                memoize: true,
                stroke: true
            }));

            this._volume_label = this.add(new Label({
                position: new Vector(150, 300),
                contents: `VOLUME:`,
                color: this.root.green,
                font_size: '40px',
                memoize: true,
                origin_center: true
            }));

            this._volume_slider = this.add(new SliderButtonSprite({
                position: new Vector(280, 300),
                sprite_sheet: this.root.money_wagger_sheet,
                scale: new Vector(0.26, 0.26),
                line_color: 'rgb(0, 255, 0)',
                length: 500,
                starting_value: this.audio.volume
            }));

            this._speed_label = this.add(new Label({
                position: new Vector(200, 400),
                contents: `PLAY SPEED:`,
                color: this.root.green,
                font_size: '40px',
                memoize: true,
                origin_center: true
            }));

            this._speed_slider = this.add(new SliderButtonSprite({
                position: new Vector(400, 400),
                sprite_sheet: this.root.money_wagger_sheet,
                scale: new Vector(0.26, 0.26),
                line_color: 'rgb(0, 255, 0)',
                length: 500,
                starting_value: this.root.speed
            }));

            this._cash_label = this.add(new Label({
                position: new Vector(900, 30),
                contents: `CASH: $${this.root.cash.toFixed(2)}`,
                color: this.root.green,
                memoize: true,
                font_size: '40px',
            }));

            super.initialize();
        }

        update() {
            if (this._back_button.up) {
                this.root.dot_sound();
                this.root.set_settings({
                    speed: +this._speed_slider.value.toFixed(2),
                    volume: +this._volume_slider.value.toFixed(2)
                });
                this.root.state_manager.request_switch_to_previous_state();
            }
            if (this._reset_cash_button.up) {
                this.root.dot_sound();
                this.root.set_settings({
                    cash: 100.00
                });
                this._cash_label.clear_cache();
            }
            this._cash_label.contents = `CASH: $${this.root.cash.toFixed(2)}`;
            super.update();
        }
    }

    class TitleScreenState extends List {
        initialize() {
            this.entered = false;
            this.time_remaining = 160;
            this.play = this.add(new ButtonLabel({
                position: this.root.canvas_manager.canvas_center,
                contents: '$ KENO $',
                color: this.root.green,
                font_size: '300px',
                origin_center: true,
                memoize: true,
                background_scale: new Vector(2, 2)
            }));
            super.initialize();
        }

        update() {
            if (!this.entered) {
                if (this.play.pressed || this.keyboard.is_pressed('Enter') || this.keyboard.is_pressed(' ')) {
                    this.root.dot_sound();
                    this.entered = true;
                    this.remove(this.play);
                    this.ready = this.request_add(new Label({
                        position: this.root.canvas_manager.canvas_center,
                        contents: 'GOOD LUCK',
                        color: this.root.green,
                        font_size: '200px',
                        memoize: true,
                        origin_center: true
                    }));
                }
            }
            else if (this.time_remaining <= 0) {
                this.reset();
                this.root.state_manager.request_switch_to(this.root.play_state);
                this.root.nightmare_sound.play();
            }
            else {
                --this.time_remaining;
            }
            super.update();
        }
    }

    class Tile extends List {
        constructor(options) {
            options.universe_object = true;
            super(options);
        }

        initialize() {
            this.selected = false;
            this.hit = false;
            /*_____ NEW BONUS FLAG IS ADDED ______*/
            this.bonus = false;
            this.button = this.add(new ButtonSprite({
                sprite_sheet: this.root.button_sheet,
                scale: this._options.button_scale
            }));
            this.label = this.add(new Label({
                contents: this._options.number || '00',
                origin_center: true,
                color: this.root.green,
                memoize: true,
                font_size: this._options.font_size || '20px'
            }));
            /*_____ ALTERNATIVE FOR THE LABEL IS ADDED INVISIBLE ______*/
            this.bonus_sprite = this.add(new Sprite({
                sprite_sheet: this.root.money_wagger_sheet,
                scale: this._options.button_scale,
                visible: false
            }));
            super.initialize();
        }

        update() {
            /*_____ SWITCH FROM STANDARD LABEL TO MONEYWAGGER IMAGE WHEN BONUS FLAG ENABLED ______*/
            if (this.bonus) {
                this.bonus_sprite.visible = true;
                this.label.visible = false;
            }
            else {
                this.bonus_sprite.visible = false;
                this.label.visible = true;
            }
            super.update();
            if (this.button.up && !this.state_parent.in_progress) {
                this.state_parent.clear_computer_picks();
                !this.selected
                    ? (this.selected = (this.state_parent.selected_count < 10))
                    : (this.selected = !this.selected);
            }
            this.button.frame_index =
                (this.selected && this.hit) ? 2 : this.hit ? 3 : this.selected ? 1 : 0;
        }
    }

    class SpecialButtonSprite extends ButtonSprite {
        update() {
            --this.highlight_for;
            super.update();
        }

        initialize() {
            this.highlight_for = 0;
            super.initialize();
        }

        render() {
            this.context.save();
            this.context.strokeStyle = this.root.green;
            this.context.strokeRect(...this.bounding_box.array);
            if (this.down || this.highlight_for > 0) {
                this.context.fillStyle = this.root.green;
                this.context.fillRect(...this.bounding_box.array);
            }
            this.context.restore();
            super.render();
        }
    }

    class PlayState extends List {
        constructor(options) {
            options.state_ceiling = true;
            super(options);
        }

        initialize() {
            this.button_scale = 0.4;
            this.in_progress = false;
            this.bet = 0.05;
            this.computer_selections = [];
            this.animation_delay = 0;
            this.bet_down_delay = this.bet_up_delay = 30;

            this.money_wagger = this.add(new AnimatedSprite({
                sprite_sheet: this.root.money_wagger_sheet,
                position: new Vector(600, 500),
                scale: new Vector(1.25, 1.25),
                visible: false
            }));

            this.money_wagger.add({
                sprite_sheet: this.root.money_wagger_sheet,
                sub_animation_name: 'money_wagger',
            });

            this.money_wagger.switch_to('money_wagger');

            this.table_border = this.add(new Sprite({
                sprite_sheet: this.root.button_sheet,
                position: new Vector(220, 550),
                scale: new Vector(1.45, 2),
            }));

            this.table = this.add(new Label({
                position: new Vector(40, 300),
                color: this.root.green,
                memoize: true,
                font_size: '50px'
            }));

            this.bet_label = this.add(new Label({
                position: new Vector(370, 888),
                contents: `BET $${this.bet.toFixed(2)}`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.3, 1.82),
                memoize: true,
                stroke: true
            }));

            this.win_label = this.add(new Label({
                visible: false,
                position: new Vector(510, 40),
                contents: `YOU WON\n\n$0.00`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '50px',
                background_scale: new Vector(1.2, 1.1),
                memoize: true,
                stroke: true
            }));

            this.bet_up_button = this.add(new SpecialButtonSprite({
                sprite_sheet: this.root.up_sheet,
                scale: new Vector(0.4, 0.4),
                position: new Vector(710, 860)
            }));

            this.bet_down_button = this.add(new SpecialButtonSprite({
                sprite_sheet: this.root.down_sheet,
                scale: new Vector(0.4, 0.4),
                position: new Vector(710, 940)
            }));

            this.play_button = this.add(new ButtonLabel({
                position: new Vector(46, 860),
                contents: 'PLAY',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '90px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.cash_label = this.add(new Label({
                position: new Vector(90, 36),
                contents: `CASH $${this.root.cash.toFixed(2)}`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.23, 1.3),
                stroke: true
            }));

            this.help_button = this.add(new ButtonLabel({
                position: new Vector(30, 120),
                contents: 'HELP',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.quit_button = this.add(new ButtonLabel({
                position: new Vector(160, 120),
                contents: 'QUIT',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.settings_button = this.add(new ButtonLabel({
                position: new Vector(40, 190),
                contents: 'SETTINGS',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.random_button = this.add(new ButtonLabel({
                position: new Vector(294, 120),
                contents: 'RANDOM',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.clear_button = this.add(new ButtonLabel({
                position: new Vector(280, 190),
                contents: 'CLEAR',
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                memoize: true,
                background_scale: new Vector(1.1, 1.1),
                stroke: true
            }));

            this.button_grid = this.add(new GridList({
                parent: this,
                position: new Vector(840, 80),
                columns: 10,
                rows: 8,
                cell_width: this.root.button_sheet.width * this.button_scale,
                cell_height: this.root.button_sheet.height * this.button_scale,
            }));

            for (let i = 0; i < 80; i++) {
                this.button_grid.add(new Tile({
                    sprite_sheet: this.root.button_sheet,
                    button_scale: new Vector(this.button_scale, this.button_scale),
                    font_size: '50px',
                    number: (`${i + 1}`)
                }));
            }

            /*_____ LABEL IS ADDED TO SHOW THE MULTIPLIER ______*/
            this.multiplier_label = this.add(new Label({
                position: new Vector(460, 780),
                contents: `${this.multiplier}x PAY`,
                color: this.root.green,
                background_color: this.root.green,
                font_size: '40px',
                background_scale: new Vector(1.1, 1.1),
                memoize: true,
                stroke: true
            }));

            super.initialize();
        }

        update() {
            if (!this.in_progress) {
                this.update_buttons();
            }
            this.animate();
            this.refresh_ui();
            super.update();
        }

        play() {
            if (this.bet > this.root.cash || this.selected_count < 2) return;
            this.in_progress = true;
            this.root.set_settings({
                cash: +(this.root.cash - this.bet).toFixed(2)
            });
            this.clear_computer_picks();
            this.computer_selections = this.random_picks(20);
            /*_____ MUST SELECT TWO TILES AS BONUS ______*/
            const bonus_picks = this.random_picks(2);
            /*_____ UPDATE THIER STATE ______*/
            bonus_picks.forEach(v => this.button_grid._children[v].bonus = true);
        }

        play_end() {
            const
                catches = this.catch_count,
                selected = this.selected_count,
                starting_index = this.starting_table_index(selected),
                payout = this.root.payouts[selected][catches] * this.bet * this.multiplier,
                /*_____ ALTERED CATCHES ARE WEIGHTED IN INCREASE WITH THE MULTIPLIER ______*/
                altered_catches = catches + (this.multiplier === 1 ? 0 : this.multiplier === 2 ? 1 : 2);
            if (payout <= 0) {
                this.root.fail_sound();
            }
            /*_____ WIN STATES ARE REACHED EASIER WITH MULTIPLIERS ______*/
            else if (altered_catches <= starting_index + 1) {
                this.root.win_sound.play();
            }
            else if (altered_catches <= starting_index + 3) {
                this.root.big_win_sound.play();
                this.money_wagger.visible = true;
            }
            else {
                this.root.jackpot_sound.loop();
                this.money_wagger.visible = true;
                this.money_wagger.scale = new Vector(2, 2);
            }
            payout > 0 && (this.win_label.visible = true);
            this.win_label.contents = `YOU WON\n\n$${payout.toFixed(2)}`;
            this.root.set_settings({
                cash: +(this.root.cash + payout).toFixed(2)
            });
        }

        animate() {
            --this.animation_delay;
            if (this.computer_selections.length && this.animation_delay <= 0) {
                const pick = this.computer_selections.shift();
                this.button_grid._children[pick].hit = true;
                this.animation_delay = Math.floor(20 - (this.root.speed * 20));
                if (this.button_grid._children[pick].bonus) {
                    this.root.bonus_sound.play();
                }
                else if (this.button_grid._children[pick].selected) {
                    this.root.ding_sound();
                }
                else {
                    this.root.tap_sound();
                }
            }
            else if (this.in_progress && !this.computer_selections.length) {
                this.in_progress = false;
                this.play_end();
            }
        }

        clear_computer_picks() {
            /*_____ KILL BONUS TILES WITH CLEAR ______*/
            this.button_grid._children.forEach(v => v.hit = v.bonus = false);
            this.money_wagger.visible = false;
            this.win_label.visible = false;
            this.money_wagger.scale = new Vector(1.25, 1.25);
            this.root.jackpot_sound.stop();
        }

        update_buttons() {
            this.help_button.up && (this.root.dot_sound() || this.root.state_manager.request_switch_to(this.root.help_screen_state));
            this.settings_button.up && (this.root.dot_sound() || this.root.state_manager.request_switch_to(this.root.settings_screen_state));
            this.quit_button.up && (this.root.reset() || this.root.dot_sound());
            this.clear_button.up && (this.clear_picks() || this.root.dot_sound());
            this.random_button.up && (this.randomize_picks() || this.root.dot_sound());
            !this.bet_up_button.down && !this.keyboard.is_down('ArrowUp') && (this.bet_up_delay = 30);
            if (this.bet <= 9.95) {
                if ((this.bet_up_button.up
                    || this.keyboard.is_pressed('ArrowUp'))) {
                    this._bet_up();
                }
                else if (this.bet_up_button.down || this.keyboard.is_down('ArrowUp')) {
                    --this.bet_up_delay;
                    this.bet_up_delay <= 0 && this._bet_up();
                }
            }
            !this.bet_down_button.down && !this.keyboard.is_down('ArrowDown') && (this.bet_down_delay = 30);
            if (this.bet >= 0.10) {
                if ((this.bet_down_button.up
                    || this.keyboard.is_pressed('ArrowDown'))) {
                    this._bet_down();
                }
                else if (this.bet_down_button.down || this.keyboard.is_down('ArrowDown')) {
                    --this.bet_down_delay;
                    this.bet_down_delay <= 0 && this._bet_down();
                }
            }
            if ((this.play_button.up
                ||
                this.keyboard.is_pressed(' ')
                ||
                this.keyboard.is_pressed('Enter'))
            ) {
                this.play_button.highlight_for = 4;
                this.root.dot_sound();
                this.play();
            }
        }

        _bet_up() {
            this.bet = +(this.bet + 0.05).toFixed(2);
            this.bet_up_button.highlight_for = 4;
            this.root.dot_sound();
        }

        _bet_down() {
            this.bet = +(this.bet - 0.05).toFixed(2);
            this.bet_down_button.highlight_for = 4;
            this.root.dot_sound();
        }

        refresh_ui() {
            /*_____ UPDATE STATE OF MULTIPLER LABEL TO REFLECT MULTIPLIER ______*/
            this.multiplier_label.contents = `${this.multiplier}x PAY`;
            this.cash_label.contents = `CASH $${this.root.cash.toFixed(2)}`;
            this.bet_label.contents = `BET $${this.bet.toFixed(2)}`;
            this.table.contents = this.bet > this.root.cash
                ? `YOU\nCAN'T\nCOVER\nTHAT\nBET`
                : this.selected_count < 2
                    ? `PLEASE\nSELECT\nTWO\nOR\nMORE\nNUMBERS`
                    : this.populated_table;
        }

        clear_picks() {
            this.clear_computer_picks();
            this.button_grid._children.forEach(v => v.selected = false);
        }

        random_picks(quantity = 0) {
            const potential = Array(80).fill(null).map((v, i) => i);
            for (let i = 0; i < 10; i++) {
                potential.sort(() => Math.random() - 0.5);
            }
            return potential.slice(0, quantity);
        }

        randomize_picks() {
            const next_picks = this.random_picks(this.selected_count);
            this.clear_picks();
            next_picks.forEach(v => (this.button_grid._children[v].selected = true));
        }

        starting_table_index(selected = 0) {
            return this.root.payouts[selected].findIndex(v => v !== 0);
        }

        get populated_table() {
            let output = ``;
            for (let i = 0; i < this.selected_count; i++) {
                output += `${i + 1}: $${(this.root.payouts[this.selected_count][i + 1] * this.bet * this.multiplier).toFixed(2)}\n`;
            }
            return output;
        }

        get selected_count() {
            return this.button_grid._children.filter(v => v.selected).length;
        }

        get catch_count() {
            return this.button_grid._children.filter(v => v.selected && v.hit).length;
        }

        /*_____ MULTIPLIER GETTER ______*/
        get multiplier() {
            const bonus_hits = this.button_grid._children.filter(v => v.bonus && v.hit).length;
            return !bonus_hits ? 1 : bonus_hits === 1 ? 2 : 5;
        }
    }

    class Keno extends Universe {
        async initialize() {
            this.payouts = this._options.payouts;
            this.money_wagger_sheet = await this.assets.load({
                src: './images/money_wagger_inverted.png',
                id: 'money_wagger_sheet',
                type: 'image',
                columns: 5
            });
            this.button_sheet = await this.assets.load({
                src: './images/button_sheet.png',
                id: 'button_sheet',
                type: 'image',
                columns: 4
            });
            this.up_sheet = await this.assets.load({
                src: './images/arrow_up.png',
                id: 'up_sheet',
                type: 'image'
            });
            this.down_sheet = await this.assets.load({
                src: './images/arrow_down.png',
                id: 'down_sheet',
                type: 'image'
            });
            this.reset();
            super.initialize();
        }

        reset() {
            this.set_settings();
            this.green = 'rgba(0, 255, 0, 1)';
            this.title_screen_state = new TitleScreenState({ parent: this });
            this.settings_screen_state = new SettingsScreenState({ parent: this });
            this.help_screen_state = new HelpScreenState({ parent: this });
            this.play_state = new PlayState({ parent: this });
            this.nightmare_sound && this.nightmare_sound.stop();
            this.nightmare_sound = new NightmareSound({ parent: this });
            /*_____ ADD THE BONUS SOUND TO THE UNIVERSE ______*/
            this.bonus_sound && this.bonus_sound.stop();
            this.bonus_sound = new BonusSound({ parent: this });
            this.win_sound && this.win_sound.stop();
            this.win_sound = new WinSound({ parent: this });
            this.big_win_sound && this.big_win_sound.stop();
            this.big_win_sound = new BigWinSound({ parent: this });
            this.jackpot_sound && this.jackpot_sound.stop();
            this.jackpot_sound = new JackpotSound({ parent: this });
            this.state_manager.clear();
            this.state_manager.request_switch_to(this.title_screen_state);
            super.reset();
        }

        reset_settings() {
            const default_settings = {
                cash: 100.00,
                volume: 0.5,
                speed: 0.5
            };
            localStorage.keno_settings = JSON.stringify(default_settings);
        }

        set_settings(options = {}) {
            if (!localStorage.keno_settings) {
                this.reset_settings();
            }
            const settings = JSON.parse(localStorage.keno_settings);
            this.cash = options.cash ?? settings.cash;
            this.audio.volume = options.volume ?? settings.volume;
            this.speed = options.speed ?? settings.speed;
            const new_settings = {
                cash: this.cash,
                volume: this.audio.volume,
                speed: this.speed
            };
            localStorage.keno_settings = JSON.stringify(new_settings);
        }

        dot_sound() {
            this.audio.play_tone({ duration: 0.02, scale: 5, volume: 0.3 });
        }

        ding_sound() {
            this.audio.play_tone({ duration: 0.02, scale: 7, volume: 0.4 });
        }

        tap_sound() {
            this.audio.play_tone({ duration: 0.02, scale: 4, volume: 0.3 });
        }

        fail_sound() {
            this.audio.play_tone({ duration: 0.2, scale: 2, volume: 0.3 });
        }
    }

    return {
        Keno
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.keno-target')).forEach(target => {
        new keno.Keno({
            alpha: false, width: 2000, height: 1000, target, payouts:
                [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,], // 0  PICKS
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,], // 1
                    [0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0,], // 2
                    [0, 0, 2, 18, 0, 0, 0, 0, 0, 0, 0,], // 3
                    [0, 0, 1, 5, 35, 0, 0, 0, 0, 0, 0,], // 4
                    [0, 0, 0, 2, 12, 350, 0, 0, 0, 0, 0,], // 5
                    [0, 0, 0, 1, 5, 40, 1200, 0, 0, 0, 0,], // 6
                    [0, 0, 0, 1, 2, 15, 120, 2400, 0, 0, 0,], // 7
                    [0, 0, 0, 0, 2, 10, 50, 400, 5000, 0, 0,], // 8
                    [0, 0, 0, 0, 1, 4, 25, 150, 500, 5000, 0,], // 9
                    [0, 0, 0, 0, 1, 3, 10, 40, 300, 900, 5000,], // 10
                ]// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 CATCHES
        });
    });
});