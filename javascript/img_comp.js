class ImageComparator {

    static IMG_COMP_WIDTH;
    static img_A;
    static img_B;
    static alpha_slider;
    static bar;
    static direction_checkbox;

    static isHorizontal() {
        return this.direction_checkbox.checked;
    }

    static switch_to_comparison() {
        const tabs = gradioApp().querySelector('#tabs').querySelector('.tab-nav').querySelectorAll('button');
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].textContent.trim() === "Comparison") {
                tabs[i].click();
                break;
            }
        }
    }

    static reset() {
        if (this.isHorizontal()) {
            this.img_B.parentNode.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.left = `${this.IMG_COMP_WIDTH}px`;
            this.bar.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;

            this.img_B.parentNode.style.top = '0px';
            this.img_B.style.top = '0px';
            this.bar.style.top = '0px';

            this.bar.style.height = `${this.IMG_COMP_WIDTH}px`;
            this.bar.style.width = '2px';

            this.img_A.classList.add('hor');
            this.img_A.classList.remove('ver');
        } else {
            this.img_B.parentNode.style.left = `calc(50% - ${this.IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.left = '0px';
            this.bar.style.left = `calc(50% - ${this.IMG_COMP_WIDTH / 2}px)`;

            this.img_B.parentNode.style.top = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.top = `${this.IMG_COMP_WIDTH}px`;
            this.bar.style.top = `${this.IMG_COMP_WIDTH}px`;

            this.bar.style.width = `${this.IMG_COMP_WIDTH}px`;
            this.bar.style.height = '2px';

            this.img_A.classList.remove('hor');
            this.img_A.classList.add('ver');
        }

        this.img_B.style.opacity = 1.0;
        this.alpha_slider.querySelector('input').value = 1.0;
        updateInput(this.alpha_slider.querySelector('input'));
    }

    static addButtons() {
        // 0: Off ; 1: Text ; 2: Icon
        const config = gradioApp().getElementById('setting_comp_send_btn').querySelectorAll('label');
        var option = 0;

        for (let i = 1; i < 3; i++) {
            if (config[i].classList.contains('selected')) {
                option = i;
                break;
            }
        }

        if (option === 0)
            return;

        ['img2img', 'extras'].forEach((mode) => {
            const row = gradioApp().getElementById(`image_buttons_${mode}`).querySelector('.form');
            const btn = row.lastElementChild.cloneNode();

            btn.id = `${mode}_send_to_comp`;
            btn.title = "Send images to comparison tab.";
            if (option === 1)
                btn.textContent = "Send to Comparison";
            else
                btn.textContent = "🆚";

            if (mode === "extras") {
                btn.addEventListener('click', () => {
                    ImgCompLoader.loadImage("extras");
                    this.switch_to_comparison();
                });
            }
            else {
                const tabs = gradioApp().getElementById('img2img_settings').querySelector('.tabs').querySelector('.tab-nav');

                btn.addEventListener('click', () => {
                    [...tabs.querySelectorAll('button')].forEach((tab) => {
                        if (tab.classList.contains('selected')) {
                            const t = tab.textContent.trim();

                            if (t === "img2img") {
                                ImgCompLoader.loadImage("i2i");
                                this.switch_to_comparison();
                            }
                            else if (t === "Inpaint") {
                                ImgCompLoader.loadImage("inpaint");
                                this.switch_to_comparison();
                            }
                            else {
                                alert("Only img2img and Inpaint are supported in Comparison!");
                                return;
                            }
                        }
                    });
                });
            }

            row.appendChild(btn);
        });
    }

    static init() {
        const block_A = gradioApp().getElementById('img_comp_A');
        this.img_A = block_A.querySelector('img');
        const block_B = gradioApp().getElementById('img_comp_B');
        this.img_B = block_B.querySelector('img');

        const tab = gradioApp().getElementById('tab_sd-webui-image-comparison');
        this.IMG_COMP_WIDTH = parseFloat(getComputedStyle(tab).getPropertyValue('--img-comp-width').split('px')[0]);

        const row = gradioApp().getElementById('img_comp_row');
        row.style.display = 'block';

        block_A.insertBefore(this.img_A, block_A.firstChild);
        while (block_A.children.length > 1)
            block_A.lastChild.remove();

        block_B.insertBefore(this.img_B, block_B.firstChild);
        while (block_B.children.length > 1)
            block_B.lastChild.remove();

        block_A.classList.add('comp-block');
        block_B.classList.add('comp-block');

        this.img_A.ondragstart = (event) => { event.preventDefault; return false; };
        this.img_B.ondragstart = (event) => { event.preventDefault; return false; };

        block_B.style.pointerEvents = 'none';
        block_B.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;
        this.img_B.style.left = `${this.IMG_COMP_WIDTH}px`;

        this.alpha_slider = gradioApp().getElementById('img_comp_alpha');
        this.alpha_slider.addEventListener('mousemove', () => {
            this.img_B.style.opacity = this.alpha_slider.querySelector('input').value;
        });

        this.direction_checkbox = gradioApp().getElementById('img_comp_horizontal').querySelector('input[type=checkbox]');

        this.bar = row.querySelector('.bar');

        this.bar = document.createElement('div');
        this.bar.classList.add('bar');
        row.appendChild(this.bar);

        ['click', 'mousemove', 'touchmove'].forEach((ev) => {
            row.addEventListener(ev, (e) => {
                e.preventDefault();
                if (ev.startsWith('touch')) {
                    e = e.changedTouches[0];
                } else {
                    if (e.buttons != 1) {
                        return;
                    }
                }
                const rect = e.target.getBoundingClientRect();
                var ratio = 0.5;

                if (this.isHorizontal()) {
                    if (e.target.id === 'img_comp_row')
                        ratio = (e.clientX > (rect.left + rect.right) / 2) ? 1.0 : 0.0;
                    else
                        ratio = ((e.clientX - rect.left) / (rect.right - rect.left));

                    const SLIDE_VALUE = this.IMG_COMP_WIDTH * (1.0 - ratio);

                    this.bar.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                    block_B.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                    this.img_B.style.left = `calc(${-this.IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
                } else {
                    if (e.target.id === 'img_comp_row')
                        ratio = (e.clientX > (rect.left + rect.right) / 2) ? 1.0 : 0.0;
                    else
                        ratio = ((e.clientY - rect.top) / (rect.bottom - rect.top));

                    const SLIDE_VALUE = this.IMG_COMP_WIDTH * (1.0 - ratio);

                    this.bar.style.top = `calc(${this.IMG_COMP_WIDTH}px - ${SLIDE_VALUE}px)`;
                    block_B.style.top = `calc(${this.IMG_COMP_WIDTH}px - ${SLIDE_VALUE}px)`;
                    this.img_B.style.top = `calc(${-this.IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
                }
            });
        });

        ImageComparator.reset();
        this.addButtons();
    }
}

onUiLoaded(async () => {
    ImageComparator.init();
});
