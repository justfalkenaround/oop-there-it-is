'use strict';

const galaga = (() => {
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

    /*
    
    
    YOU CAN USE THE FOLLOWING CODE AS A BASE OR START FROM SCRATCH
    
    IMAGE AND AUDIO ASSETS AND CODE HAVE ALREADY BEEN PROVIDED
    
    GOOD LUCK
    
    
    */

    class Projectile extends Sprite { }

    class Explosion extends Sprite { }

    class EnemyShip extends Sprite { }

    class PlayerShip extends Sprite { }

    class Level extends List { }

    class PlayScreen extends List { }

    class EndScreen extends List { }

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

    class Galaga extends Universe {
        async initialize() {
            this.player_ship_sheet = await this.assets.load({
                src: DATA_URLS.PLAYER_SHIP,
                id: 'player_ship',
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
            this.crash_sound = await this.assets.load({
                src: DATA_URLS.CRASH_SOUND,
                id: 'crash_sound',
                type: 'audio'
            });
            super.initialize();
        }
    }

    return {
        Galaga
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.galaga-target')).forEach(target => {
        new galaga.Galaga({ width: 2000, height: 1600, target });
    });
});