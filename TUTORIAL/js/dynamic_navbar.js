'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const index = document.querySelector('nav'),
            navbar = document.createElement('nav'),
            items = Array.from(index.querySelectorAll('a')),
            ids = items.map(v => v.href.substring(v.href.lastIndexOf('#') + 1)),
            dividers = ids.map(v => {
                const element = document.createElement('a'),
                    hidden = document.createElement('span');
                hidden.innerHTML = v.replaceAll('_', '&nbsp;');
                element.append(hidden);
                element.style.height = `${100 / (ids.length + 1)}vh`;
                element.href = `#${v}`;
                return element;
            });
        ids.unshift(`index_tag`);
        items.unshift(index);
        index.id = 'index_tag';
        const element = document.createElement('a');
        element.style.height = `${100 / (ids.length)}vh`;
        element.href = `#index_tag`;
        dividers.unshift(element);
        const actual_elements = ids.map((v, i) => {
            return i === 0 ? document.querySelector(`#${v}`) : document.querySelector(`#${v}`).parentNode;
        });
        navbar.classList.add('sidebar');
        dividers.forEach(v => navbar.append(v));
        const check_activity = () => {
            dividers.forEach((v, i) => {
                const rect = actual_elements[i].getBoundingClientRect();
                if (rect.bottom < 0 || rect.y > window.innerHeight) {
                    v.classList.remove('activated');
                }
                else {
                    v.classList.add('activated');
                }
            });
        };
        window.addEventListener('scroll', () => check_activity());
        check_activity();
        document.querySelector('body').append(navbar);

    }
    catch (err) { }
});
