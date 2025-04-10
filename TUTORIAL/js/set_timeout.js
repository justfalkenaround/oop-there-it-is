'use strict';

window.setTimeout = (callback, delay) => {
    let initial = 0;
    const loop = time => (time - initial) >= (delay - 16.777) ? callback() : window.requestAnimationFrame(t => loop(t));
    return window.requestAnimationFrame(t => {
        initial = t;
        loop(t);
    });
};

window.clearTimeout = id => window.cancelAnimationFrame(id);