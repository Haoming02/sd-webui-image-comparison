from modules.script_callbacks import on_ui_tabs, on_ui_settings
from modules.images import read_info_from_image
from modules.ui_components import ToolButton
from modules.shared import OptionInfo, opts

from PIL import Image
import gradio as gr
import re


def parsePrompts(info: str) -> str:
    positive = negative = ""
    params: dict[str, str] = {}

    if "Negative prompt:" in info:
        positive, chunk = info.split("Negative prompt:")

        if "Steps" in chunk:
            negative, args = chunk.split("Steps")
        else:
            negative = chunk
            args = ""

    else:
        if "Steps" in info:
            positive, args = info.split("Steps")
        else:
            positive = info
            args = ""

    comma = ',(?=(?:[^"]*["][^"]*["])*[^"]*$)'
    chunks = re.split(comma, ("Steps" + args))

    for c in chunks:
        params[c.split(":", 1)[0].strip()] = c.split(":", 1)[1].strip()

    return (
        positive.strip().replace("<", "&lt;").replace(">", "&gt;"),
        negative.strip().replace("<", "&lt;").replace(">", "&gt;"),
        params,
    )


def toDiff(s: str) -> str:
    if len(s) == 0:
        return ""
    else:
        return f'<span class="comp-diff">{s}</span>'


def img2info(imgA, imgB) -> str:
    if (imgA is None) or (imgB is None):
        return [gr.update(value=""), gr.update(value="")]

    infoA, _ = read_info_from_image(imgA)
    infoB, _ = read_info_from_image(imgB)

    if (infoA is None) or (infoB is None):
        return [gr.update(value=""), gr.update(value="")]

    infoA = parsePrompts(infoA)
    infoB = parsePrompts(infoB)

    contentA = []
    contentB = []

    if infoA[0] == infoB[0]:
        contentA.append(infoA[0])
        contentB.append(infoB[0])
    else:
        contentA.append(toDiff(infoA[0]))
        contentB.append(toDiff(infoB[0]))

    if infoA[1] == infoB[1]:
        contentA.append(infoA[1])
        contentB.append(infoB[1])
    else:
        contentA.append(toDiff(infoA[1]))
        contentB.append(toDiff(infoB[1]))

    contentA[0] = f"<b>Positive Prompt:</b> {contentA[0]}"
    contentB[0] = f"<b>Positive Prompt:</b> {contentB[0]}"

    contentA[1] = f"<b>Negative Prompt:</b> {contentA[1]}"
    contentB[1] = f"<b>Negative Prompt:</b> {contentB[1]}"

    paramsA = []
    paramsB = []

    for K, V in infoA[2].items():
        if K in infoB[2].keys():
            if V == infoB[2][K]:
                paramsA.append(f"{K}: {V}")
                paramsB.append(f"{K}: {V}")
            else:
                paramsA.append(toDiff(f"{K}: {V}"))
                paramsB.append(toDiff(f"{K}: {infoB[2][K]}"))
            del infoB[2][K]
        else:
            paramsA.append(toDiff(f"{K}: {V}"))

    for K, V in infoB[2].items():
        paramsB.append(toDiff(f"{K}: {V}"))

    contentA.append(f'<b>Params:</b> {", ".join(paramsA)}')
    contentB.append(f'<b>Params:</b> {", ".join(paramsB)}')

    return [
        gr.update(
            value=f"""
            <h5 align="left">Infotext</h5>
            <p>{'<br>'.join(contentA)}</p>
            """
        ),
        gr.update(
            value=f"""
            <h5 align="right">Infotext</h5>
            <p>{'<br>'.join(contentB)}</p>
            """
        ),
    ]


def img_ui():
    dummy = Image.new("RGB", (16, 16), "dimgrey")

    with gr.Blocks() as IMG_COMP:
        with gr.Row(elem_id="img_comp_row"):
            gr.Image(
                value=dummy,
                image_mode="RGB",
                type="pil",
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id="img_comp_A",
            )

            gr.Image(
                value=dummy,
                image_mode="RGB",
                type="pil",
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id="img_comp_B",
            )

        with gr.Column(elem_classes="img_comp_buttons"):
            ToolButton(
                value="\U00002795",
                elem_id="icomp_in",
                tooltip="Zoom In",
            )
            ToolButton(
                value="\U0001F504",
                elem_id="icomp_reset",
                tooltip="Reset to Default Scale",
            )
            ToolButton(
                value="\U00002796",
                elem_id="icomp_out",
                tooltip="Zoom Out",
            )

        with gr.Row(elem_id="img_comp_utils"):
            swap_btn = gr.Button("Swap", elem_id="img_comp_swap", scale=1)
            gr.Slider(
                label="Opacity",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=1.0,
                elem_id="img_comp_alpha",
                scale=3,
            )
            dir_cb = gr.Checkbox(
                label="Horizontal Slider",
                value=True,
                elem_id="img_comp_horizontal",
                scale=1,
            )

        with gr.Row(elem_id="img_comp_tools"):
            upload_A = gr.Image(
                image_mode="RGB",
                label="Image A",
                type="pil",
                sources="upload",
                show_download_button=False,
                interactive=True,
                height=256,
                elem_id="img_comp_input_A",
            )

            with gr.Column():
                comp_btn = gr.Button("Compare Upload", elem_id="img_comp_btn")
                i2i_btn = gr.Button("Compare img2img", elem_id="img_comp_i2i")
                inp_btn = gr.Button("Compare Inpaint", elem_id="img_comp_inpaint")
                ex_btn = gr.Button("Compare Extras", elem_id="img_comp_extras")

            upload_B = gr.Image(
                image_mode="RGB",
                label="Image B",
                type="pil",
                sources="upload",
                show_download_button=False,
                interactive=True,
                height=256,
                elem_id="img_comp_input_B",
            )

            def js(mode: str) -> str:
                return f'() => {{ ImgCompLoader.loadImage("{mode}"); }}'

            comp_btn.click(fn=None, _js=js("upload"))
            i2i_btn.click(fn=None, _js=js("i2i"))
            inp_btn.click(fn=None, _js=js("inpaint"))
            ex_btn.click(fn=None, _js=js("extras"))

        with gr.Row(elem_id="img_comp_info"):
            infotextA = gr.HTML()
            infotextB = gr.HTML()

        upload_A.change(img2info, [upload_A, upload_B], [infotextA, infotextB])
        upload_B.change(img2info, [upload_A, upload_B], [infotextA, infotextB])

        swap_btn.click(fn=None, _js="() => { ImgCompLoader.swapImage(); }")
        dir_cb.change(fn=None, _js="() => { ImageComparator.reset(); }")

    return [(IMG_COMP, "Comparison", "sd-webui-image-comparison")]


def on_settings():
    section = ("icomp", "Image Comparison")
    btn = ("Off", "Text", "Icon")

    opts.add_option(
        "comp_send_btn",
        OptionInfo(
            "Off",
            'Add a "Send to Comparison" button under img2img and Extras generation result',
            gr.Radio,
            lambda: {"choices": btn},
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )

    opts.add_option(
        "comp_send_btn_t2i",
        OptionInfo(
            "Off",
            'Add a "Send to Comparison" button under txt2img generation result to compare against previous generation',
            gr.Radio,
            lambda: {"choices": btn},
            section=section,
            category_id="ui",
        ).needs_reload_ui(),
    )


on_ui_tabs(img_ui)
on_ui_settings(on_settings)
