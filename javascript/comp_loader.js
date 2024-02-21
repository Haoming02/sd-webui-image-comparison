class ImgCompLoader {

    static swapImage() {
        let temp = ImageComparator.img_A.src;
        ImageComparator.img_A.src = ImageComparator.img_B.src;
        ImageComparator.img_B.src = temp;
    }

    static loadImage(tab) {
        var source_a = null;
        var source_b = null;

        switch (tab) {
            default:
                alert('WTF?');
                break;
            case 'i2i':
                source_a = gradioApp().getElementById('img2img_image').querySelector('img');
                source_b = gradioApp().getElementById('img2img_gallery').querySelector('img');
                break;
            case 'inpaint':
                source_a = gradioApp().getElementById('img2img_inpaint_tab').querySelector('img');
                source_b = gradioApp().getElementById('img2img_gallery').querySelector('img');
                break;
            case 'extras':
                source_a = gradioApp().getElementById('extras_image').querySelector('img');
                source_b = gradioApp().getElementById('extras_gallery').querySelector('img');
                break;
            case 'upload':
                source_a = gradioApp().getElementById('img_comp_input_A').querySelector('img');
                source_b = gradioApp().getElementById('img_comp_input_B').querySelector('img');
                break;
        }

        if (source_a == null || source_b == null)
            return;

        ImageComparator.img_A.src = source_a.src;
        ImageComparator.img_B.src = source_b.src;
        ImageComparator.reset();
    }
}
