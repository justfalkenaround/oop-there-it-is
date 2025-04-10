'use strict';

const pong = (() => {
    const {
        help,
        Interface,
        Vector,
        Rectangle,
        Circle,
        Universe
    } = BAREBONES;

    class Ball extends Interface { }

    class Paddle extends Interface { }

    class Pong extends Universe { }

    return {
        Pong
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Array.from(document.querySelectorAll('.pong-target')).forEach(target => {
        new pong.Pong({ width: 2000, height: 1000, target });
    });
});