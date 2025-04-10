'use strict';

/*_____ X ______*/

/*_____ EXPORT A PONG OBJECT ______*/
const pong = (() => {

    /*_____ IMPORT SOME CLASSES FROM BAREBONES ______*/
    const {
        help,
        Interface,
        Vector,
        Rectangle,
        Circle,
        Universe
    } = BAREBONES;

    /*_____ BALL CLASS ______*/
    class Ball extends Interface {
        constructor(options) {
            /*_____ SINCE IT INHERITS DIRECTLY FROM INTERFACE IT MUST BE TOLD TO BE A UNIVERSE OBJECT ______*/
            options.universe_object = true;
            super(options);
            /*_____ BALL IS ROUND AND NEEDS A RADIUS ______*/
            this.radius = this._options.radius || 30;
        }

        update() {
            /*_____ GET THE PLAYER PADDLE ______*/
            const player_paddle = this.root.find_id('player_paddle');
            /*_____ IF BALL VELICITY IS NONE PUT THE BALL ON THE PLAYER PADDLE ______*/
            this.velocity.equals(0, 0) && (this.position = player_paddle.position.plus(player_paddle.size.x / 2, -player_paddle.size.y));
            /*_____ IF THE BALL HITS THE SIDES OF THE CANVAS SWITCH X VELOCITY TO BOUNCE ______*/
            if (this.position.x >= this.canvas.width - this.radius || this.position.x <= this.radius) {
                /*_____ MIRROR AXIS ONLY ON X ______*/
                this.velocity = this.velocity.mirror_axis(true, false);
            }
            /*_____ IF THE BALL GOES OFF CANVAS VERTICALLY THEN GAME OVER ______*/
            if (this.position.y >= this.canvas.height - this.radius || this.position.y <= this.radius) {
                /*_____ JUST RESET ______*/
                this.root.reset();
            }
            /*_____ IF THE BALL HITS A PADDLE THEN BOUNCE ______*/
            if (
                this.circle.intersects_with(this.root.player_paddle.rectangle)
                ||
                this.circle.intersects_with(this.root.enemy_paddle.rectangle)
            ) {
                /*_____ ALSO SPEED THINGS UP A BIT EVERY TIME THIS HAPPENS BY 10 PRECENT ______*/
                this.velocity = this.velocity.mirror_axis(false, true).times(1.1, 1.1);
            }
            super.update();
        }

        render() {
            /*_____ ACCESS THE CANVAS RENDERING PIPELINE ______*/
            this.context.save();
            /*_____ WHITE BALL ______*/
            this.context.fillStyle = 'rgb(255, 255, 255)';
            /*_____ MOVE TO POSITION ______*/
            this.context.translate(...this.position.array);
            /*_____ DRAW ARC ______*/
            this.context.beginPath();
            this.context.arc(0, 0, this.radius, (2 * Math.PI), 0, false);
            this.context.fill();
            /*_____ RESTORE STATE ______*/
            this.context.restore();
        }

        reset() {
            /*_____ RESET BY ZEROING OUT VELOCITY ______*/
            this.velocity = new Vector();
        }

        fire() {
            /*_____ FIRE BY GETTING SOME UP TO THE RIGHT VELOCITY ______*/
            this.velocity = new Vector(3, -3);
        }

        /*_____ GET A CIRCLE OBJECT FOR COLLISION DETECTION ______*/
        get circle() {
            return new Circle({
                position: this.position.duplicate(),
                radius: this.radius
            });
        }
    }

    /*_____ PADDLE CLASS FOR PLAYER AND ENEMY ______*/
    class Paddle extends Interface {
        constructor(options) {
            /*_____ SET AS UNIVERSE OBJECT ______*/
            options.universe_object = true;
            super(options);
            /*_____ NEED TO KNOW IF IT IS PLAYER OR ENEMY ______*/
            this.player = this._options.player || false;
        }

        render() {
            /*_____ CANVAS RENDERING PIPELINE ______*/
            this.context.save();
            /*_____ GREEN PADDLES ______*/
            this.context.fillStyle = 'rgb(0, 255, 0)';
            /*_____ MOVE TO POSITION ______*/
            this.context.translate(...this.universe_position.array);
            /*_____ DRAW RECTANGLE ______*/
            this.context.fillRect(0, 0, ...this.size.array);
            /*_____ RESTORE STATE ______*/
            this.context.restore();
        }

        update() {
            /*_____ IF THIS IS THE PLAYER PADDLE ______*/
            if (this.player) {
                /*_____ RESPOND TO KEYBOARD INPUT ______*/
                /*_____ FIRE ON SPACE ______*/
                this.keyboard.is_down(' ') && (this.root.find_id('ball').fire());
                /*_____ MOVE LEFT OR RIGHT ______*/
                (this.keyboard.is_down('a') || this.keyboard.is_down('ArrowLeft')) && (this.position.x -= 25);
                (this.keyboard.is_down('d') || this.keyboard.is_down('ArrowRight')) && (this.position.x += 25);
            }
            else {
                /*_____ OTHERWISE LOCK THE CENTER OF THE ENEMY PADDLE TO THE BALL X COORDINATE ______*/
                this.position.x = this.root.find_id('ball') && this.root.find_id('ball').position.x - this.size.x / 2;
            }
            /*_____ CLAMP THE PADDLE WITHIN THE CANVAS ______*/
            this.position = new Vector(
                help.clamp(this.position.x, 0, this.canvas.width - this.size.x),
                this.position.y
            );
        }

        reset() {
            /*_____ IF THIS IS THE PLAYER PADDLE ______*/
            if (this.player) {
                /*_____ PUT IT IN CENTER POSITION ______*/
                this.position = new Vector(
                    ((this.canvas.width / 2) - (this.size.x / 2)),
                    ((this.canvas.height) - this.size.y)
                );
            }
            /*_____ OR THE EMEMY ______*/
            else {
                /*_____ PUT IT IN BALL POSITION ______*/
                this.position = new Vector(
                    this.root.find_id('ball') && this.root.find_id('ball').position.x - (this.size.x / 2),
                    0
                );
            }
        }

        /*_____ GET PADDLE SIZE AS 1 / 10 OF CANVAS WIDTH AND 1 / 30 CANVAS HEIGHT ______*/
        get size() {
            return this.root.canvas_manager.canvas_dimensions.divided_by(10, 30);
        }

        /*_____ GET RECTANGLE FOR COLLISION DETECTION ______*/
        get rectangle() {
            return new Rectangle({
                position: this.position.duplicate(),
                size: this.size
            });
        }
    }

    /*_____ PONG UNIVERSE ______*/
    class Pong extends Universe {
        initialize() {
            /*_____ ADD THE PLAYERS PADDLE ______*/
            this.player_paddle = this.add(new Paddle({
                player: true,
                id: 'player_paddle',
                position: new Vector(500, 40)
            }));
            /*_____ THE BALL ______*/
            this.ball = this.add(new Ball({
                id: 'ball',
            }));
            /*_____ ENEMY PADDLE ______*/
            this.enemy_paddle = this.add(new Paddle({
                player: false,
                id: 'enemy_paddle',
            }));
            /*_____ RESET TO SET INITIALLY ______*/
            this.reset();
            super.initialize();
        }
    }

    /*_____ EXPORT PONG GAME ______*/
    return {
        Pong
    };
})();

/*_____ LOOP OVER PONG TARGETS TO CREATE PONG UNIVERSES ______*/
window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.pong-target')).forEach(target => {
        new pong.Pong({ width: 2000, height: 1000, target });
    });
});