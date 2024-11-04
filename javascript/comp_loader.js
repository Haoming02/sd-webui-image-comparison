class ImgCompLoader {

    static swapImage() {
        let temp = ImageComparator.img_A.src;
        ImageComparator.img_A.src = ImageComparator.img_B.src;
        ImageComparator.img_B.src = temp;
    }

    static loadImage(tab) {
        let source_a = null;
        let source_b = null;

        switch (tab) {
            case 'i2i':
                source_a = document.getElementById('img2img_image').querySelector('img');
                source_b = document.getElementById('img2img_gallery').querySelector('img');
                break;
            case 'inpaint':
                source_a = document.getElementById('img2img_inpaint_tab').querySelector('img');
                source_b = document.getElementById('img2img_gallery').querySelector('img');
                break;
            case 'extras':
                source_a = document.getElementById('extras_image').querySelector('img');
                source_b = document.getElementById('extras_gallery').querySelector('img');
                break;
            case 'upload':
                source_a = document.getElementById('img_comp_input_A').querySelector('img');
                source_b = document.getElementById('img_comp_input_B').querySelector('img');
                break;
            default:
                alert('Invalid Tab...?');
                break;
        }

        if (source_a == null || source_b == null)
            return;

        ImageComparator.img_A.src = source_a.src;
        ImageComparator.img_B.src = source_b.src;
        ImageComparator.reset();
    }
}
