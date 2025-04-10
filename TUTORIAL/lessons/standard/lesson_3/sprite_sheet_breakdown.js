'use strict';

document.addEventListener('DOMContentLoaded', async () => {

    const initialize = async (element, pre, slide, slide_window, special = null) => {
        let
            throttle_counter = 0,
            throttle = element.dataset.throttle || 10,
            direction = 'forward',
            frame_position = { x: 1, y: 1 },
            state = 'initial';

        let work_base = pre ? Array.from(pre.querySelectorAll('[data-state]')) : [];

        const
            scale = element.dataset.scale || 1,
            divisions_x = element.dataset.divisions_x || 1,
            divisions_y = element.dataset.divisions_y || 1,
            scan_mode = element.dataset.scan_mode || 'loop',
            image = new Image();

        image.alt = element.dataset.alt || 'animated sprite';
        await new Promise((resolve, reject) => {
            image.addEventListener('load', resolve);
            image.src = element.dataset.src || '';
        });
        element.append(image);
        image.width *= scale;

        const
            local_width = image.width / divisions_x,
            local_height = image.height / divisions_y;

        element.style.width = `${local_width}px`;
        element.style.height = `${local_height}px`;

        const
            color = async st => {
                if (!pre) {
                    return;
                }
                state = st || 'initial';
                work_base.forEach(v => v.classList.remove('green', 'red', 'yellow', 'blue'));
                work_base.filter(v => v.dataset.state === state)
                    .forEach(v => v.classList.add(v.dataset.state.includes('check') ? 'yellow' : 'red'));
                await new Promise(resolve => window.setTimeout(() => resolve(), 400));
            },

            update = async () => {
                if (direction === 'forward') {
                    await color('check_forward');
                    if (frame_position.x < divisions_x) {
                        await color('check_forward_x');
                        frame_position.x += 1;
                        await color('increment_x');
                    }
                    else if (frame_position.y < divisions_y) {
                        await color('check_forward_x');
                        await color('check_forward_y');
                        frame_position.y += 1;
                        await color('increment_y');
                        frame_position.x = 1;
                        await color('reset_x');
                    }
                    else {
                        await color('check_forward_x');
                        await color('check_forward_y');
                        await color('check_forward_else');
                        if (scan_mode === 'loop') {
                            await color('check_scanmode');
                            frame_position = { x: 1, y: 1 };
                            await color('frame_reset');
                        }
                        else {
                            await color('check_scanmode');
                            await color('check_scanmode_else');
                            direction = 'backward';
                            await color('direction_backward');
                            await color('call_back_update_forward');
                            await color('update');
                            await update();
                        }
                    }
                }
                else {
                    await color('check_forward');
                    await color('check_back');
                    if (frame_position.x > 1) {
                        await color('check_back');
                        frame_position.x -= 1;
                        await color('decrement_x');
                    }
                    else if (frame_position.y > 1) {
                        await color('check_back');
                        await color('check_back_y');
                        frame_position.y -= 1;
                        await color('decrement_y');
                        frame_position.x = divisions_x;
                        await color('reset_x_max');
                    }
                    else {
                        await color('check_back');
                        await color('check_back_y');
                        await color('check_back_else');
                        direction = 'forward';
                        await color('direction_forward');
                        await color('call_back_update_backward');
                        await color('update');
                        await update();
                    }
                }
            },

            render = async () => {
                image.style.left = `-${(frame_position.x - 1) * local_width}px`;
                await scroll();
                await color('render_left');
                image.style.top = `-${(frame_position.y - 1) * local_height}px`;
                await scroll();
                await color('render_top');
            },

            scroll = async () => {
                const rect = slide.getBoundingClientRect();
                slide_window.style.left = `${rect.x + ((rect.width / divisions_x) * (frame_position.x - 1))}px`;
                slide_window.style.top = `${rect.y + ((rect.height / divisions_y) * (frame_position.y - 1))}px`;
                slide_window.style.height = `${rect.height / divisions_y}px`;
                slide_window.style.width = `${rect.width / divisions_x}px`;
            },

            repeat = async () => {
                if (special) {
                    await color('call_update');
                    await color('update');
                    await update();
                    await color('call_render');
                    await color('render');
                    await render();
                    window.requestAnimationFrame(repeat);
                    return;
                }
                ++throttle_counter;
                if (throttle_counter % throttle === 0) {
                    await color('call_update');
                    await color('update');
                    await update();
                    await color('call_render');
                    await color('render');
                    await render();
                }
                window.requestAnimationFrame(repeat);
            };
        if ((divisions_y === 1 && divisions_x === 1) || (divisions_x % 1 || divisions_y % 1) || (divisions_x < 0 || divisions_y < 0)) {
            return;
        }
        window.addEventListener('scroll', () => scroll());

        repeat();
    };

    const element = document.querySelector('.sprite_sheet_breakdown_special');
    const pre = document.querySelector('.sprite_sheet_breakdown_pre_special');
    const slide = document.querySelector('.slide_special');
    const slide_window = document.querySelector('.slide_window_special');

    initialize(element, pre, slide, slide_window, true);

    const list = document.querySelectorAll('.sprite_sheet_breakdown_wrapper');

    for (let i = 0; i < list.length; i++) {
        const v = list[i]
        initialize(
            v.querySelector('.sprite_sheet_breakdown'),
            null,
            v.querySelector('.slide'),
            v.querySelector('.slide_window')
        );
    }
});