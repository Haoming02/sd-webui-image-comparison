class ImgCompLoader {

    static loadImage(tab) {
        var source_a = null;
        var source_b = null;

        if (tab === 'i2i') {
            source_a = gradioApp().getElementById('img2img_image').querySelector('img');
            source_b = gradioApp().getElementById('img2img_gallery').querySelector('img');
        } else {
            source_a = gradioApp().getElementById('extras_image').querySelector('img');
            source_b = gradioApp().getElementById('extras_gallery').querySelector('img');
        }

        if (source_a == null || source_b == null)
            return;

        const target_A = gradioApp().getElementById('img_comp_input_A').querySelector("input[type='file']");
        const target_B = gradioApp().getElementById('img_comp_input_B').querySelector("input[type='file']");

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');


        canvas.width = source_a.naturalWidth;
        canvas.height = source_a.naturalHeight;

        ctx.drawImage(source_a, 0, 0, source_a.naturalWidth, source_a.naturalHeight);

        canvas.toBlob((blob) => {
            const file = new File(([blob]), "a.png");
            this.setImage(target_A, file);
        });


        canvas.width = source_b.naturalWidth;
        canvas.height = source_b.naturalHeight;

        ctx.drawImage(source_b, 0, 0, source_b.naturalWidth, source_b.naturalHeight);

        canvas.toBlob((blob) => {
            const file = new File(([blob]), "b.png");
            this.setImage(target_B, file);
        });


        canvas.remove();
    }

    static setImage(imageInput, file) {
        const dt = new DataTransfer();
        dt.items.add(file);

        const list = dt.files;
        imageInput.files = list;

        imageInput.dispatchEvent(new Event('change', {
            'bubbles': true,
            "composed": true
        }));
    }

}
