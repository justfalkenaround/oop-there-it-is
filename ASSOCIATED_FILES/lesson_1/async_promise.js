'use strict';
/*_____ X _____*/

/*_____ OLD SYNTAX _____*/
const before_async = () => {
    new Promise((resolve, reject) => {
        window.setTimeout(() => resolve(), 3000);
    })
        .then(() => console.log('I WAITED 3 SECONDS'))
        .catch(err => console.error('SOMETHING WENT WRONG', err));
};

/*_____ NEW SYNTAX _____*/
const with_async = async () => {
    try {
        await new Promise((resolve, reject) => {
            window.setTimeout(() => resolve(), 3000);
        });
        console.log('I WAITED 3 SECONDS');

    }
    catch (err) {
        console.error('SOMETHING WENT WRONG', err);
    }
};

/*_____ TEST BOTH _____*/
before_async();
with_async();