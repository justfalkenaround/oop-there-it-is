'use strict';
/*_____ X ______*/

/*_____ AWAIT DOM LOAD AND EXECUTE ASYNC FUNCTION ______*/
document.addEventListener('DOMContentLoaded', async () => {

    /*_____ WRAP CODE IN A TRY CATCH BLOCK FOR MINIMAL ERROR HANDLING ______*/
    try {

        /*_____ GRAB ALL ELEMENTS TO BE ANIMATED ______*/
        const element_list = Array.from(document.querySelectorAll('.sprite_sheet'));

        /*_____ DECLARE INITIALIZATION PHASE FUNCTION ______*/
        const initialize = async element => {

            /*_____ DECLARE STATE VARIABLES ______*/
            let
                throttle_counter = 0,
                /*_____ ROTATION SCALE HUE FOR THE CHALLENGE ______*/
                rotation = -20,
                live_scale = 0,
                hue = 0,

                /*_____ DATASET IS A SPECIAL HTML PROPERTY TO GET DATA FROM ATTRIBUTES ______*/
                throttle = element.dataset.throttle || 10,
                direction = 'forward',

                /*_____ POSITION IS A VECTOR ______*/
                frame_position = { x: 1, y: 1 };

            /*_____ COLLECT MORE DATA FROM DATASET ______*/
            const
                scale = element.dataset.scale || 1,
                divisions_x = element.dataset.divisions_x || 1,
                divisions_y = element.dataset.divisions_y || 1,
                scan_mode = element.dataset.scan_mode || 'loop',
                /*_____ CREATE A NEW IMAGE ______*/
                image = new Image();

            /*_____ ALWAYS REMEMBER IMAGE ALTS ______*/
            image.alt = element.dataset.alt || 'animated sprite';

            /*_____ WAIT FOR THE IMAGE TO LOAD ______*/
            await new Promise((resolve, reject) => {
                image.addEventListener('load', resolve);
                image.src = element.dataset.src || '';
            });

            /*_____ ATTACH THE IMAGE TO THE DOM ELEMENT ______*/
            element.append(image);

            /*_____ SCALE THE IMAGE ______*/
            image.width *= scale;

            /*_____ CALCULATE THE LOCAL DISTANCES ______*/
            const
                local_width = image.width / divisions_x,
                local_height = image.height / divisions_y;

            /*_____ APPLY TO DOM ELEMENT ______*/
            element.style.width = `${local_width}px`;
            element.style.height = `${local_height}px`;

            /*_____ DECLARE THE UPDATE PHASE FUNCTION ______*/
            const
                update = () => {

                    /*_____ ADD THE THE HUE AND ROTATION VALUES FOR THE CHALLENGE ______*/
                    hue += 1;
                    rotation += 7;

                    /*_____ CONTROL FLOW FORWARD BACKWARD ______*/
                    if (direction === 'forward') {

                        /*_____ SCALE UP ______*/
                        live_scale += 0.1;

                        /*_____ ADJUST FRAME POSITION ______*/
                        if (frame_position.x < divisions_x) {
                            ++frame_position.x;
                        }
                        else if (frame_position.y < divisions_y) {
                            ++frame_position.y;
                            frame_position.x = 1;
                        }
                        else {

                            /*_____ RESET PHASE ______*/
                            if (scan_mode === 'loop') {
                                frame_position = { x: 1, y: 1 };
                            }
                            else {
                                direction = 'backward';

                                /*_____ RECURSE ONCE ______*/
                                update();
                            }
                        }
                    }
                    else {

                        /*_____ SCALE DOWN ______*/
                        live_scale -= 0.1;

                        /*_____ ADJUST FRAME POSITION ______*/
                        if (frame_position.x > 1) {
                            --frame_position.x;
                        }
                        else if (frame_position.y > 1) {
                            --frame_position.y;
                            frame_position.x = divisions_x;
                        }
                        else {

                            /*_____ RESET PHASE ______*/
                            direction = 'forward';

                            /*_____ RECURSE ONCE ______*/
                            update();
                        }
                    }
                },

                /*_____ DECLARE RENDER PHASE FUNCTION ______*/
                render = () => {

                    /*_____ ADJUST RELATIVE POSITION OF IMAGE ______*/
                    image.style.left = `-${(frame_position.x - 1) * local_width}px`;
                    image.style.top = `-${(frame_position.y - 1) * local_height}px`;

                    /*_____ CSS FILTER TO APPLY HUE ROTATE FOR CHALLENGE ______*/
                    element.style.filter = `hue-rotate(${hue}deg)`;

                    /*_____ CSS TRANSFORM TO APPLY SCALE AND ROTATE FOR THE CHALLENGE ______*/
                    element.style.transform = `rotate(${rotation}deg) scale(${live_scale + 0.8}, ${live_scale + 0.8})`;
                },

                /*_____ DECLARE REPEAT PHASE FUNCTION ______*/
                repeat = () => {

                    /*_____ INCREMENT THROTTLER ______*/
                    ++throttle_counter;

                    /*_____ IMPLEMENT THROTTLING ______*/
                    if (throttle_counter % throttle === 0) {

                        /*_____ UPDATE ______*/
                        update();

                        /*_____ RENDER ______*/
                        render();
                    }

                    /*_____ REPEAT ______*/
                    window.requestAnimationFrame(repeat);
                };
            /*_____ USER ERROR PROTECTION ______*/
            if ((divisions_y === 1 && divisions_x === 1) || (divisions_x % 1 || divisions_y % 1) || (divisions_x < 0 || divisions_y < 0)) {
                return;
            }
            /*_____ INITIATE THE CHAIN REACTION ______*/
            repeat();
        };

        /*_____ INITIALIZE EACH ELEMENT IN THE LIST ______*/
        element_list.forEach(initialize);
    }
    catch (err) { }
});