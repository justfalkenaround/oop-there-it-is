'use strict';

document.addEventListener('DOMContentLoaded', () => {
    class Randomizer {
        constructor(dest, enter, name, execute, group_size) {
            this.group_size = group_size;
            this.students = [];
            this.destination = dest;
            this.name = name;
            execute.addEventListener('click', () => RANDOMIZER.execute());
            enter.addEventListener('click', () => this.enter_name());
            name.addEventListener('keydown', e => {
                if (e.keyCode === 13) {
                    this.enter_name();
                }
            });
        }

        enter_name() {
            const _name = this.name.value.trim();
            if (!_name.length) {
                return;
            }
            this.destination.innerHTML += `<li>${_name}</li>`;
            this.students.push(_name);
            this.name.value = '';
        }

        async execute() {
            const _group_size = Number(this.group_size.value);
            const items = Array.from(this.destination.querySelectorAll('li'));
            for await (let item of items) {
                item.remove();
                await new Promise(r => window.setTimeout(() => r(), 100));
            }
            this.destination.innerHTML = '';
            this.students.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);
            const list = [];
            for (let i = 0; i < this.students.length; i += _group_size) {
                const section = document.createElement('section');
                section.classList.add('randomizer_group_section');
                for (let x = 0; x < Math.min(_group_size, this.students.length - i); x++) {
                    section.innerHTML += `<li>${this.students[i + x]}</li>`;
                }
                list.push(section);
            }
            for await (let v of list) {
                this.destination.append(v);
                this.destination.append(document.createElement('hr'));
                await new Promise(r => window.setTimeout(() => r(), 200));
            }
        }
    }

    const RANDOMIZER = new Randomizer(
        document.querySelector('#randomizer_destination'),
        document.querySelector('#randomizer_enter'),
        document.querySelector('#new_name'),
        document.querySelector('#randomizer_execute'),
        document.querySelector('#group_size')
    );
});