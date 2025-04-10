'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const
        input = document.querySelector('#input'),
        output = document.querySelector('#output'),
        reader = new FileReader();

    const dump_data_url = e => {
        reader && reader.addEventListener('load', () => {
            output.innerText = reader.result;
        });

        input && input.files[0] && reader && reader.readAsDataURL(input.files[0]);
    }

    input.addEventListener('change', dump_data_url)
});