'use strict';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const element = document.querySelector('.animated-text');
        let work = element.innerText.split('');
        let delay = 0;
        let count = 0;
        element.innerText = '';

        const animate = () => {
            ++count;
            if (count % 3 === 0) {
                element.innerText = element.innerText.substring(0, element.innerText.length - 1);
                if (delay <= 0) {
                    if (work.length === 0) {
                        work = element.innerText.split('');
                        delay = 0;
                        count = 0;
                        element.innerText = '';
                    }
                    let char = work.shift();
                    if (char === ' ') {
                        element.innerHTML += '&nbsp;';
                    }
                    else if (char === '.') {
                        element.innerText += char;
                        delay = 20;
                    }
                    else {
                        element.innerText += char;
                    }
                }
                else {
                    --delay;
                }
                element.innerText += '|';
            }
            window.requestAnimationFrame(animate);
        };
        animate();
    }
    catch (err) { }
});