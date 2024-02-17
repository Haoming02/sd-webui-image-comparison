from modules import script_callbacks
import gradio as gr

def img_ui():
    with gr.Blocks() as IMG_COMP:
        with gr.Row(elem_id='img_comp_row'):
            img_A = gr.Image(
                image_mode='RGB',
                type='pil',
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id='img_comp_A'
            )

            img_B = gr.Image(
                image_mode='RGB',
                type='pil',
                show_download_button=False,
                interactive=False,
                container=False,
                height=768,
                elem_id='img_comp_B'
            )

        with gr.Row(elem_id='img_comp_tools'):
            inp_A = gr.Image(
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
                comp_btn = gr.Button('Compare', variant='primary', elem_id='img_comp_btn')
                i2i_btn = gr.Button('Load from img2img', elem_id='img_comp_i2i')
                ex_btn = gr.Button('Load from Extras', elem_id='img_comp_extras')

            inp_B = gr.Image(
                image_mode='RGB',
                label='Image B',
                sources='upload',
                type='pil',
                show_download_button=False,
                interactive=True,
                height=256,
                elem_id='img_comp_input_B'
            )

            def load_img(a, b):
                return [a, b]

            comp_btn.click(
                load_img,
                inputs=[inp_A, inp_B],
                outputs=[img_A, img_B]
            ).success(None, None, None, _js='() => { load_ImageComparison(); }')

            i2i_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("i2i"); }')
            ex_btn.click(None, None, None, _js='() => { ImgCompLoader.loadImage("extras"); }')

    return [(IMG_COMP, 'Comparison', 'sd-webui-image-comparison')]

script_callbacks.on_ui_tabs(img_ui)
