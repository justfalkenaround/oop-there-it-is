'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const text_element = document.querySelector('.animated-text-custom'),
        element = document.querySelector('.animated-text-pre');
    let text_work = text_element.innerText.split(''),
        delay = 0,
        count = 0,
        state = 'initial',
        work_base = Array.from(element.querySelectorAll('[data-state]')),
        class_type = element.dataset.class || 'yellow';
    text_element.innerText = '';

    const color = async st => {
        state = st || 'initial';
        work_base.forEach(v => v.classList.remove('green', 'red', 'yellow', 'blue'));
        work_base.filter(v => v.dataset.state === state)
            .forEach(v => v.classList.add(v.dataset.class || class_type));
        await new Promise(resolve => window.setTimeout(() => resolve(), 400));
    };

    const animate = async () => {
        ++count;
        if (count % 90 === 0) {
            await color('count');
            text_element.innerText = text_element.innerText.substring(0, text_element.innerText.length - 1);
            await color('pipe_off');
            await color('check_delay');
            if (delay <= 0) {
                await color('check_reset');
                if (text_work.length === 0) {
                    text_work = text_element.innerText.split('');
                    delay = 0;
                    count = 0;
                    text_element.innerText = '';
                    await color('reset');
                }
                let char = text_work.shift();
                await color('shift');
                await color('check_space');
                if (char !== ' ') {
                    await color('check_period');
                }
                if (char === ' ') {
                    text_element.innerHTML += '&nbsp;';
                    await color('space');
                }
                else if (char === '.') {
                    text_element.innerText += char;
                    delay = 20;
                    await color('period');
                }
                else {
                    await color('check_regular');
                    text_element.innerText += char;
                    await color('regular');
                }
            }
            else {
                --delay;
                await color('delay');
            }
            text_element.innerText += '|';
            await color('pipe_on');
            await color('repeat');
        };
        window.requestAnimationFrame(animate);
    };
    animate();
});