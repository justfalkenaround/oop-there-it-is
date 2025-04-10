'use strict';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const pres_html = Array.from(document.querySelectorAll('pre.html'));
        pres_html.forEach(v => {
            let temp = v.innerHTML;
            temp = temp.replaceAll('<', '<span><</span>');
            v.innerHTML = temp;
        });

        const pres = Array.from(document.querySelectorAll('pre'));
        pres.forEach(v => {
            let temp = v.innerHTML;
            temp = temp.trim();
            v.innerHTML = temp;
        });
    }
    catch (err) { }
});