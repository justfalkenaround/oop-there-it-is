'use strict';
/*_____ X _____*/

/*_____ WAIT UNTIL THE DOM HAS LOADED BEFORE DOING ANYTHING _____*/
document.addEventListener('DOMContentLoaded', () => {

    /*_____ GRAB ALL OF THE ELEMENTS WITH A CLASS OF animated-text _____*/
    const elements = document.querySelectorAll('.animated-text');

    /*_____ DECLARE A FUNCTION THAT WILL ACCEPT A DOM ELEMENT AND INITIATE THE ANIMATION FOR THAT ELEMENT _____*/
    const activate = element => {

        /*_____ GRAB ALL OF THE TEXT IN THE ELEMENT : FILL AN ARRAY WITH EACH INDIVIDUAL CHARACTER _____*/
        /*_____ ALSO DECLARE VARIABLES FOR TRACKING DELAY AND COUNT _____*/
        let work = element.innerText.split(''), delay = 0, count = 0;

        /*_____ CLEAR THE ELEMENT TEXT CONTENT _____*/
        element.innerText = '';

        /*_____ OVERRIDE THE DEFAULT CSS TEXT COLOR TO A RANDOM VALUE _____*/
        element.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

        /*_____ CREATE ANOTHER FUNCTION FOR THE ANIMATION LOOP _____*/
        /*_____ THIS WILL BE CALLED EVERY 16.7 OR SO MILISECONDS _____*/
        const animate = () => {

            /*_____ EVERY TIME _____*/

            /*_____ GRAB THE ELEMENTS CURRENT POSITION RELATIVE TO THE VIEWPORT _____*/
            const rect = element.getBoundingClientRect();

            /*_____ STOP HERE IF THE ELEMENT IS OUT OF VIEW _____*/
            if (rect.bottom < 0 || rect.y > window.innerHeight) {
                /*_____ BUT STILL KEEP LOOPING _____*/
                window.requestAnimationFrame(animate);
                return;
            }

            /*_____ INCREMENT COUNT _____*/
            ++count;

            /*_____ USE MODULUS THREE OF COUNT TO SLOW THE SPEED OF THE ANIMATION TO ONE THIRD _____*/
            if (count % 3 === 0) {

                /*_____ REMOVE THE LAST CHARACTER OF THE ELEMENTS TEXT : THE PIPE : IF IT EXISTS _____*/
                element.innerText = element.innerText.substring(0, element.innerText.length - 1);

                /*_____ RESET VALUES AND CLEAR TEXT IF THE WORK ARRAY IS EMPTY _____*/
                if (work.length === 0) {

                    /*_____ REFILL WORK ARRAY _____*/
                    work = element.innerText.split('');

                    /*_____ RESET DELAY AND COUNT TO ZERO _____*/
                    delay = 0;
                    count = 0;

                    /*_____ CLEAR THE ELEMENT TEXT CONTENT _____*/
                    element.innerText = '';
                }

                /*_____ IF THERE IS NO REMAINING DELAY TIME _____*/
                if (delay <= 0) {

                    /*_____ REMOVE THE FIRST CHARACTER IN THE WORK ARRAY AND SAVE IT _____*/
                    const char = work.shift();

                    /*_____ IF THE CHARACTER IS A SPACE _____*/
                    if (char === ' ') {

                        /*_____ APPEND A NON-BREAKING SPACE CHARACTER TO THE ELEMENT TEXT CONTENT _____*/
                        /*_____ THIS IS BECAUSE HTML WILL TRY AND TRIM WHITESPACE _____*/
                        element.innerHTML += '&nbsp;';
                    }

                    /*_____ IF THE CHARACTER IS A PERIOD _____*/
                    else if (char === '.') {

                        /*_____ APPEND THE CHARACTER TO THE ELEMENT TEXT CONTENT _____*/
                        element.innerText += char;

                        /*_____ BECAUSE IT IS THE END OF A SENTENCE : ADD SOME DELAY TIME _____*/
                        delay = 20;
                    }

                    /*_____ OTHERWISE _____*/
                    else {

                        /*_____ APPEND THE CHARACTER TO THE ELEMENT TEXT CONTENT _____*/
                        element.innerText += char;
                    }
                }

                /*_____ DECREMENT THE DELAY VARIABLE IF THIS WAS A DELAY STEP _____*/
                else {
                    --delay;
                }

                /*_____ ALWAYS PUT A PIPE CHARACTER AT THE END OF THE ELEMENT TEXT CONTENT _____*/
                element.innerText += '|';
            }

            /*_____ LOOP _____*/
            window.requestAnimationFrame(animate);
        };

        /*_____ START THE LOOP OFF _____*/
        animate();
    };

    /*_____ LOOP OVER THE ELEMENTS AND ACTIVATE THEM _____*/
    /*_____ HAVE TO USE ARRAY FROM BECAUSE QUERYSELECTORALL RETURNS NOT AN ARRAY _____*/
    Array.from(elements).forEach(activate);
});