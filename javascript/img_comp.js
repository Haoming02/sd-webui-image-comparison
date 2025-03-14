class ImageComparator {

    static #IMG_COMP_WIDTH;
    static img_A;
    static img_B;
    static #alpha_slider;
    static #bar;
    static #direction_checkbox;
    static #cached_image = undefined;

    static #translateX = 0.0;
    static #translateY = 0.0;
    static #scale = 1.0;

    static get #isHorizontal() { return this.#direction_checkbox.checked; }

    static switch_to_comparison() {
        const tabs = document.querySelector('#tabs').querySelector('.tab-nav').querySelectorAll('button');
        // Surely, everyone uses txt2img, img2img, and Extras...
        for (let i = 3; i < tabs.length; i++) {
            if (tabs[i].textContent.trim() === "Comparison") {
                tabs[i].click();
                break;
            }
        }
    }

    static reset() {
        if (this.#isHorizontal) {
            this.img_B.parentNode.style.left = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.left = `${this.#IMG_COMP_WIDTH}px`;
            this.#bar.style.left = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px)`;

            this.img_B.parentNode.style.top = '0px';
            this.img_B.style.top = '0px';
            this.#bar.style.top = '0px';

            this.#bar.style.height = `${this.#IMG_COMP_WIDTH}px`;
            this.#bar.style.width = '2px';

            this.img_A.classList.add('hor');
            this.img_A.classList.remove('ver');
        } else {
            this.img_B.parentNode.style.left = `calc(50% - ${this.#IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.left = '0px';
            this.#bar.style.left = `calc(50% - ${this.#IMG_COMP_WIDTH / 2}px)`;

            this.img_B.parentNode.style.top = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px)`;
            this.img_B.style.top = `${this.#IMG_COMP_WIDTH}px`;
            this.#bar.style.top = `${this.#IMG_COMP_WIDTH}px`;

            this.#bar.style.width = `${this.#IMG_COMP_WIDTH}px`;
            this.#bar.style.height = '2px';

            this.img_A.classList.remove('hor');
            this.img_A.classList.add('ver');
        }

        this.img_B.style.opacity = 1.0;
        this.#alpha_slider.querySelector('input').value = 1.0;
        updateInput(this.#alpha_slider.querySelector('input'));
    }

    static #addButtons() {
        // 0: Off ; 1: Text ; 2: Icon
        const config = Array.from(document.getElementById('setting_comp_send_btn').querySelectorAll('label'));
        const option = config.findIndex(label => label.classList.contains('selected'));
        if (option === 0)
            return;

        for (const mode of ['img2img', 'extras']) {
            const buttons = document.getElementById(`image_buttons_${mode}`).querySelectorAll("button");
            const btn = buttons[buttons.length - 1].cloneNode();

            btn.id = `${mode}_send_to_comp`;
            btn.title = "Send images to comparison tab.";
            btn.textContent = (option === 1) ? "Send to Comparison" : "🆚";

            if (mode === "extras") {
                btn.addEventListener('click', () => {
                    ImgCompLoader.loadImage("extras");
                    this.switch_to_comparison();
                });
            }
            else {
                const tabs = document.getElementById('img2img_settings').querySelector('.tabs').querySelector('.tab-nav');

                btn.addEventListener('click', () => {
                    for (const tab of tabs.querySelectorAll('button')) {
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
                    }
                });
            }

            buttons[0].parentElement.appendChild(btn);
        }
    }

    static #addTxt2ImgButton() {
        // 0: Off ; 1: Text ; 2: Icon
        const config = Array.from(document.getElementById('setting_comp_send_btn_t2i').querySelectorAll('label'));
        const option = config.findIndex(label => label.classList.contains('selected'));
        if (option === 0)
            return;

        for (const btn of ["txt2img_generate", "txt2img_upscale"]) {
            const generate = document.getElementById(btn);
            generate?.addEventListener("click", () => {
                this.#cached_image = document.getElementById('txt2img_gallery').querySelector('img')?.src;
            });
        }

        const buttons = document.getElementById("image_buttons_txt2img").querySelectorAll("button");
        const btn = buttons[buttons.length - 1].cloneNode();

        btn.id = "txt2img_send_to_comp";
        btn.title = "Send images to comparison tab.";
        btn.textContent = (option === 1) ? "Send to Comparison" : "🆚";

        btn.addEventListener('click', () => {
            if (this.#cached_image == null) {
                alert("No cached result exists!");
                return;
            }

            ImageComparator.img_A.src = this.#cached_image;
            ImageComparator.img_B.src = document.getElementById('txt2img_gallery').querySelector('img').src;
            ImageComparator.reset();

            this.switch_to_comparison();
        });

        buttons[0].parentElement.appendChild(btn);
    }

    static #clamp01(val) {
        return Math.min(Math.max(val, 0.0), 1.0);
    }

    static init() {
        const block_A = document.getElementById('img_comp_A');
        this.img_A = block_A.querySelector('img');
        const block_B = document.getElementById('img_comp_B');
        this.img_B = block_B.querySelector('img');

        const tab = document.getElementById('tab_sd-webui-image-comparison');
        this.#IMG_COMP_WIDTH = parseFloat(getComputedStyle(tab).getPropertyValue('--img-comp-width').split('px')[0]);

        const row = document.getElementById('img_comp_row');
        row.setAttribute("tabindex", 0);
        row.style.display = 'block';

        block_A.insertBefore(this.img_A, block_A.firstChild);
        while (block_A.children.length > 1)
            block_A.lastChild.remove();

        block_B.insertBefore(this.img_B, block_B.firstChild);
        while (block_B.children.length > 1)
            block_B.lastChild.remove();

        block_A.classList.add('comp-block');
        block_B.classList.add('comp-block');

        this.img_A.ondragstart = (e) => { e.preventDefault(); return false; };
        this.img_B.ondragstart = (e) => { e.preventDefault(); return false; };

        block_B.style.pointerEvents = 'none';
        block_B.style.left = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px)`;
        this.img_B.style.left = `${this.#IMG_COMP_WIDTH}px`;

        this.#alpha_slider = document.getElementById('img_comp_alpha');
        for (const ev of ['mousemove', 'touchmove']) {
            this.#alpha_slider.addEventListener(ev, () => {
                this.img_B.style.opacity = this.#alpha_slider.querySelector('input').value;
            }, { passive: true });
        };

        this.#direction_checkbox = document.getElementById('img_comp_horizontal').querySelector('input[type=checkbox]');

        this.#bar = document.createElement('div');
        this.#bar.classList.add('bar');
        row.appendChild(this.#bar);

        let startX, startY;
        let freezeX, freezeY;
        row.addEventListener("mousedown", (e) => {
            if (!e.shiftKey)
                return;

            startX = e.clientX;
            startY = e.clientY;
            freezeX = this.#translateX;
            freezeY = this.#translateY;
        });

        for (const ev of ['mousemove', 'touchmove']) {
            row.addEventListener(ev, (e) => {
                e.preventDefault();

                if (ev.startsWith('touch'))
                    e = e.changedTouches[0];
                else if (e.buttons != 1)
                    return;

                if (e.shiftKey) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    this.#translateX = freezeX + deltaX / this.#scale;
                    this.#translateY = freezeY + deltaY / this.#scale;

                    row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
                } else {
                    const rect = e.target.getBoundingClientRect();
                    const notImage = e.target.tagName !== 'IMG';
                    let ratio;

                    if (this.#isHorizontal) {
                        if (notImage)
                            ratio = (e.clientX > (rect.left + rect.right) / 2) ? 1.0 : 0.0;
                        else
                            ratio = ((e.clientX - rect.left) / (rect.right - rect.left));

                        ratio = this.#clamp01(ratio);
                        const SLIDE_VALUE = this.#IMG_COMP_WIDTH * (1.0 - ratio);

                        this.#bar.style.left = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                        block_B.style.left = `calc(50% + ${this.#IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                        this.img_B.style.left = `calc(${-this.#IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
                    } else {
                        if (notImage)
                            ratio = (e.clientY > (rect.bottom + rect.top) / 2) ? 1.0 : 0.0;
                        else
                            ratio = ((e.clientY - rect.top) / (rect.bottom - rect.top));

                        ratio = this.#clamp01(ratio);
                        const SLIDE_VALUE = this.#IMG_COMP_WIDTH * (1.0 - ratio);

                        this.#bar.style.top = `calc(${this.#IMG_COMP_WIDTH}px - ${SLIDE_VALUE}px)`;
                        block_B.style.top = `calc(${this.#IMG_COMP_WIDTH}px - ${SLIDE_VALUE}px)`;
                        this.img_B.style.top = `calc(${-this.#IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
                    }
                }
            }, { passive: false });
        }

        row.addEventListener("wheel", (e) => {
            if (!e.shiftKey)
                return;

            let flag = false;
            if (e.deltaY < 0) {
                this.#scale = Math.min(this.#scale + 0.5, 10.0);
                flag = true;
            }
            if (e.deltaY > 0) {
                this.#scale = Math.max(this.#scale - 0.5, 0.5)
                flag = true;
            }

            if (flag) {
                e.preventDefault();
                row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
                return false;
            }
        }, { passive: false });

        row.addEventListener("keyup", (e) => {
            if (e.key == "Shift")
                this.img_A.classList.remove('drag');
        });

        row.addEventListener("keydown", (e) => {
            if (e.key == "Shift")
                this.img_A.classList.add('drag');

            let flag = false;
            if (e.key == "=" || e.key == "+") {
                this.#scale = Math.min(this.#scale + 0.5, 10.0);
                flag = true;
            }
            if (e.key == "-") {
                this.#scale = Math.max(this.#scale - 0.5, 0.5)
                flag = true;
            }
            if (e.key == "ArrowUp") {
                this.#translateY += (100 / this.#scale);
                flag = true;
            }
            if (e.key == "ArrowDown") {
                this.#translateY -= (100 / this.#scale);
                flag = true;
            }
            if (e.key == "ArrowRight") {
                this.#translateX -= (100 / this.#scale);
                flag = true;
            }
            if (e.key == "ArrowLeft") {
                this.#translateX += (100 / this.#scale);
                flag = true;
            }

            if (e.key == "Backspace" || e.key == ")" || e.key == "Insert") {
                this.#translateX = 0.0;
                this.#translateY = 0.0;
                this.#scale = 1.0;
                flag = true;
            }

            if (flag) {
                e.preventDefault();
                row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
                return false;
            }
        });

        document.getElementById("icomp_in").addEventListener("click", () => {
            this.#scale = Math.min(this.#scale + 1.0, 10.0);
            row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
        });

        document.getElementById("icomp_reset").addEventListener("click", () => {
            this.#translateX = 0.0;
            this.#translateY = 0.0;
            this.#scale = 1.0;
            row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
        });

        document.getElementById("icomp_out").addEventListener("click", () => {
            this.#scale = Math.max(this.#scale - 1.0, 0.5);
            row.style.transform = `scale(${this.#scale}) translate(${this.#translateX}px, ${this.#translateY}px)`;
        });

        ImageComparator.reset();
        this.#addButtons();
        this.#addTxt2ImgButton();

        const container = document.createElement("div");
        container.id = "img_comp_row_container";
        row.parentNode.insertBefore(container, row);
        container.appendChild(row);
    }
}

onUiLoaded(() => { ImageComparator.init(); });
