'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const element_list = Array.from(document.querySelectorAll('.sprite_sheet'));

        const initialize = async element => {

            let
                throttle_counter = 0,
                throttle = element.dataset.throttle || 10,
                direction = 'forward',
                frame_position = { x: 1, y: 1 };

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
                update = () => {
                    if (direction === 'forward') {
                        if (frame_position.x < divisions_x) {
                            ++frame_position.x;
                        }
                        else if (frame_position.y < divisions_y) {
                            ++frame_position.y;
                            frame_position.x = 1;
                        }
                        else {
                            if (scan_mode === 'loop') {
                                frame_position = { x: 1, y: 1 };
                            }
                            else {
                                direction = 'backward';
                                update();
                            }
                        }
                    }
                    else {
                        if (frame_position.x > 1) {
                            --frame_position.x;
                        }
                        else if (frame_position.y > 1) {
                            --frame_position.y;
                            frame_position.x = divisions_x;
                        }
                        else {
                            direction = 'forward';
                            update();
                        }
                    }
                },

                render = () => {
                    image.style.left = `-${(frame_position.x - 1) * local_width}px`;
                    image.style.top = `-${(frame_position.y - 1) * local_height}px`;
                },

                repeat = () => {
                    ++throttle_counter;
                    if (throttle_counter % throttle === 0) {
                        update();
                        render();
                    }
                    window.requestAnimationFrame(repeat);
                };
            if ((divisions_y === 1 && divisions_x === 1) || (divisions_x % 1 || divisions_y % 1) || (divisions_x < 0 || divisions_y < 0)) {
                return;
            }
            repeat();
        };

        element_list.forEach(initialize);
    }
    catch (err) { }
});