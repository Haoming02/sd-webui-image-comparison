from modules.script_callbacks import on_ui_tabs, on_ui_settings
from modules.images import read_info_from_image
from modules.ui_components import ToolButton
from modules.shared import OptionInfo, opts

from typing import Callable
from PIL import Image
import gradio as gr
import re

COMMA = r'(?!\B"[^"]*),(?![^"]*"\B)'


def parsePrompts(info: str) -> tuple[list[str], list[str], dict[str, str]]:
    info = info.replace("<", "&lt;").replace(">", "&gt;")

    positive: list[str] = []
    negative: list[str] = []
    params: dict[str, str] = {}

    if "Negative prompt:" in info:
        p_chunk, chunk = info.split("Negative prompt:")
        if "Steps" in chunk:
            n_chunk, args = chunk.split("Steps")
        else:
            n_chunk = chunk
            args = ""

    else:
        n_chunk = ""
        if "Steps" in info:
            p_chunk, args = info.split("Steps")
        else:
            p_chunk = info
            args = ""

    if p_chunk:
        positive = [tag.strip() for tag in p_chunk.split(",") if tag.strip()]

    if n_chunk:
        negative = [tag.strip() for tag in n_chunk.split(",") if tag.strip()]

    if args:
        chunks = re.split(COMMA, (f"Steps{args}"))
        for c in chunks:
            k, v = c.split(":", 1)
            params[k.strip()] = v.strip()

    return positive, negative, params


def toDiff(s: str) -> str:
    return f'<span class="comp-diff">{s}</span>' if s else ""


def img2info(imgA: Image.Image, imgB: Image.Image) -> list[Callable, Callable]:
    if (imgA is None) or (imgB is None):
        return [gr.update(value=""), gr.update(value="")]

    infoA, _ = read_info_from_image(imgA)
    infoB, _ = read_info_from_image(imgB)

    if (infoA is None) or (infoB is None):
        return [gr.update(value=""), gr.update(value="")]

    contentA: list[str] = []
    contentB: list[str] = []

    posA, negA, argsA = parsePrompts(infoA)
    posB, negB, argsB = parsePrompts(infoB)

    # === Positive Prompt === #

    if posA and posB:
        common_pos: list[str] = list(set(posA) & set(posB))

        lineA: list[str] = []
        lineB: list[str] = []
        for tag in posA:
            lineA.append(tag if tag in common_pos else toDiff(tag))
        for tag in posB:
            lineB.append(tag if tag in common_pos else toDiff(tag))

        contentA.append(", ".join(lineA))
        contentB.append(", ".join(lineB))

    else:
        contentA.append(toDiff(", ".join(posA)))
        contentB.append(toDiff(", ".join(posB)))

    contentA[0] = f"<b>Positive:</b> {contentA[0]}"
    contentB[0] = f"<b>Positive:</b> {contentB[0]}"

    # === Negative Prompt === #

    if negA and negB:
        common_neg: list[str] = list(set(negA) & set(negB))

        lineA: list[str] = []
        lineB: list[str] = []
        for tag in negA:
            lineA.append(tag if tag in common_neg else toDiff(tag))
        for tag in negB:
            lineB.append(tag if tag in common_neg else toDiff(tag))

        contentA.append(", ".join(lineA))
        contentB.append(", ".join(lineB))

    else:
        contentA.append(toDiff(", ".join(negA)))
        contentB.append(toDiff(", ".join(negB)))

    contentA[1] = f"<b>Negative Prompt:</b> {contentA[1]}"
    contentB[1] = f"<b>Negative Prompt:</b> {contentB[1]}"

    # === Parameters === #

    paramsA: list[str] = []
    paramsB: list[str] = []

    for key, val in argsA.items():
        if key in argsB:
            if val == argsB[key]:
                paramsA.append(f"{key}: {val}")
                paramsB.append(f"{key}: {val}")
            else:
                paramsA.append(toDiff(f"{key}: {val}"))
                paramsB.append(toDiff(f"{key}: {argsB[key]}"))
            del argsB[key]
        else:
            paramsA.append(toDiff(f"{key}: {val}"))

    for key, val in argsB.items():
        paramsB.append(toDiff(f"{key}: {val}"))

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
                elem_id="img_comp_alpha",
                minimum=0.0,
                maximum=1.0,
                step=0.1,
                value=1.0,
                interactive=True,
                scale=3,
            )
            dir_cb = gr.Checkbox(
                label="Horizontal Slider",
                elem_id="img_comp_horizontal",
                interactive=True,
                value=True,
                scale=1,
            )

        with gr.Row(elem_id="img_comp_tools"):
            upload_a = gr.Image(
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

            upload_b = gr.Image(
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

        upload_a.change(img2info, [upload_a, upload_b], [infotextA, infotextB])
        upload_b.change(img2info, [upload_a, upload_b], [infotextA, infotextB])

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
