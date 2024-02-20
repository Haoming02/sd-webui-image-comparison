class ImageComparator {

    static IMG_COMP_WIDTH;
    static img_A;
    static img_B;
    static alpha_slider;
    static bar;

    static reset() {
        this.img_B.parentNode.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;
        this.img_B.style.left = `${this.IMG_COMP_WIDTH}px`;
        this.img_B.style.opacity = 1.0;
        this.bar.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px)`;
        this.alpha_slider.querySelector('input').value = 1.0;
        updateInput(this.alpha_slider.querySelector('input'));
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

        this.bar = row.querySelector('.bar');

        this.bar = document.createElement('div');
        this.bar.classList.add('bar');
        row.appendChild(this.bar);

        ['click', 'mousemove'].forEach((ev) => {
            row.addEventListener(ev, (e) => {
                e.preventDefault();
                if (e.buttons != 1)
                    return;

                const rect = e.target.getBoundingClientRect();
                var ratio = 0.5;

                if (e.target.id === 'img_comp_row')
                    ratio = (e.clientX > (rect.left + rect.right) / 2) ? 1.0 : 0.0;
                else
                    ratio = ((e.clientX - rect.left) / (rect.right - rect.left));

                const SLIDE_VALUE = this.IMG_COMP_WIDTH * (1.0 - ratio);

                this.bar.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                block_B.style.left = `calc(50% + ${this.IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
                this.img_B.style.left = `calc(${-this.IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
            });
        });
    }
}

onUiLoaded(async () => {
    ImageComparator.init();
});
