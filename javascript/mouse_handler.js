class MouseComparator {

    /** @param {string} src @param {boolean} is_a @param {boolean} auto */
    static #send(src, side, auto) {
        (side ? ImageComparator.img_B : ImageComparator.img_A).src = src;
        ImageComparator.reset();

        if (auto) ImageComparator.switch_to_comparison();
    }

    static init() {
        const enable = document.getElementById("setting_comp_send_mouse_click").querySelector("input[type=checkbox]").checked;
        if (!enable)
            return;

        const auto = document.getElementById("setting_comp_send_mouse_auto").querySelector("input[type=checkbox]").checked;
        for (const [event, side] of [["click", false], ["contextmenu", true]]) {
            document.addEventListener(event, (e) => {
                if (!(e.ctrlKey && e.altKey))
                    return;

                const img = (e.target.nodeName.toLowerCase() === 'img') ? e.target : e.target.querySelector("img");
                if (img != null) {
                    this.#send(img.src, side, auto);
                    e.preventDefault();
                    return false;
                }
            });
        }
    }

}

onUiLoaded(() => { MouseComparator.init(); });
