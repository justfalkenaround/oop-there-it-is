'use strict';
/*_____ X _____*/

document.addEventListener('DOMContentLoaded', () => {
    try {
        const elements = Array.from(document.querySelectorAll('.highlight_loop'));
        const activate = element => {
            let work_base = Array.from(element.querySelectorAll('[data-tick]'))
                .sort((a, b) => a.dataset.tick - b.dataset.tick),
                count = 0,
                work = work_base.map(v => v),
                throttle = Number(element.dataset.throttle) || 30,
                class_type = element.dataset.class || 'yellow';
            const animate = () => {
                const rect = element.getBoundingClientRect();
                if (rect.bottom < 0 || rect.y > window.innerHeight) {
                    window.requestAnimationFrame(animate);
                    return;
                }
                ++count;
                if (count % throttle === 0) {
                    if (!work.length) {
                        work = work_base.map(v => v);
                    }
                    work_base.forEach(v => v.classList.remove(class_type));
                    const current = work.shift();
                    current.classList.add(class_type);
                }
                window.requestAnimationFrame(animate);
            };
            if (work_base.length) {
                animate();
            }
        };
        elements.forEach(activate);
    }
    catch (err) { }
});