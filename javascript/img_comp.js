function load_ImageComparison() {
    const block_A = gradioApp().getElementById('img_comp_A');
    const img_A = block_A.querySelector('img');
    const block_B = gradioApp().getElementById('img_comp_B');
    const img_B = block_B.querySelector('img');

    if (img_A == null || img_B == null)
        return;

    const tab = gradioApp().getElementById('tab_sd-webui-image-comparison');
    const IMG_COMP_WIDTH = parseFloat(getComputedStyle(tab).getPropertyValue('--img-comp-width').split('px')[0]);

    const row = gradioApp().getElementById('img_comp_row');
    row.style.display = 'block';

    block_A.insertBefore(img_A, block_A.firstChild);
    while (block_A.children.length > 1)
        block_A.lastChild.remove();

    block_B.insertBefore(img_B, block_B.firstChild);
    while (block_B.children.length > 1)
        block_B.lastChild.remove();

    block_A.classList.add('comp-block');
    block_B.classList.add('comp-block');

    img_A.ondragstart = (event) => { event.preventDefault; return false; };
    img_B.ondragstart = (event) => { event.preventDefault; return false; };

    block_B.style.pointerEvents = 'none';
    block_B.style.left = `calc(50% + ${IMG_COMP_WIDTH / 2}px)`;
    img_B.style.left = `${IMG_COMP_WIDTH}px`;

    var bar = row.querySelector('.bar');
    if (bar != null) {
        bar.style.left = `calc(50% + ${IMG_COMP_WIDTH / 2}px)`;
        return;
    }

    bar = document.createElement('div');
    bar.classList.add('bar');
    row.appendChild(bar);

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

            const SLIDE_VALUE = IMG_COMP_WIDTH * (1.0 - ratio);

            bar.style.left = `calc(50% + ${IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
            block_B.style.left = `calc(50% + ${IMG_COMP_WIDTH / 2}px - ${SLIDE_VALUE}px)`;
            img_B.style.left = `calc(${-IMG_COMP_WIDTH}px + ${SLIDE_VALUE}px)`;
        });
    });
}
