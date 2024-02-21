from modules import script_callbacks
from PIL import Image
import gradio as gr

def img_ui():
    dummy = Image.new('RGB', (1, 1), 'dimgrey')

    with gr.Blocks() as IMG_COMP:
        with gr.Row(elem_id='img_comp_row'):
            gr.Image(
                value=dummy,
                image_mode='RGB',
                type='pil',
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id='img_comp_A'
            )

            gr.Image(
                value=dummy,
                image_mode='RGB',
                type='pil',
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id='img_comp_B'
            )

        with gr.Row():
            swap_btn = gr.Button('Swap', elem_id='img_comp_swap', scale=1)
            gr.Slider(label="Opacity", minimum=0.0, maximum=1.0, step=0.05, value=1.0, elem_id='img_comp_alpha', scale=3)
            dir_cb = gr.Checkbox(label='Horizontal Slider', value=True, elem_id='img_comp_horizontal', scale=1)

        with gr.Row(elem_id='img_comp_tools'):
            gr.Image(
                image_mode='RGB',
                label='Image A',
                sources='upload',
                type='pil',
                show_download_button=False,
                interactive=True,
                height=256,
                elem_id='img_comp_input_A'
            )

            with gr.Column():
                comp_btn = gr.Button('Compare Upload', elem_id='img_comp_btn')
                i2i_btn = gr.Button('Compare img2img', elem_id='img_comp_i2i')
                inp_btn = gr.Button('Compare Inpaint', elem_id='img_comp_inpaint')
                ex_btn = gr.Button('Compare Extras', elem_id='img_comp_extras')

            gr.Image(
                image_mode='RGB',
                label='Image B',
                sources='upload',
                type='pil',
                show_download_button=False,
                interactive=True,
                height=256,
                elem_id='img_comp_input_B'
            )

            comp_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("upload"); }')
            i2i_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("i2i"); }')
            inp_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("inpaint"); }')
            ex_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("extras"); }')

            swap_btn.click(None, None, None, _js='() => { ImgCompLoader.swapImage(); }')
            dir_cb.change(None, None, None, _js='() => { ImageComparator.reset(); }')

    return [(IMG_COMP, 'Comparison', 'sd-webui-image-comparison')]

script_callbacks.on_ui_tabs(img_ui)
