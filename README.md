# SD Webui Image Comparison
This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which adds a new tab for image comparison.

> Also supports both old & new [Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge)

<p align="center">
<img src="./tab.gif"><br>
<code>Draggable Image Slider</code>
</p>

## Features

Wanna check how your **img2img** went? Simply compare the results in the brand new **Comparison** tab!

### How to Use

> This Extension comes with a few ways to load images; and a few utilities to compare details

- <b><ins>Load Images</ins></b>
    - Manually upload two images to the **Comparison** tab, then click on the `Compare Upload` button
    - Click on the `Compare img2img` / `Compare Inpaint` button to automatically pull from the `img2img` input and output images
    - Click on the `Compare Extras` button to automatically pull from the `Extras` input and output images

- <b><ins>Settings</ins></b>

    > These options are in the `Image Comparison` section under the <ins>User Interface</ins> category in the **Settings** tab

    - Add new buttons to the `img2img` and `Extras` tabs, that send the input and output images to the `Comparison` tab when clicked
    - Add a new button to the `txt2img` tab, that sends the current result image along with the cached previous result image to the `Comparison` tab when clicked

- <b><ins>Controls</ins></b>
    - <b>Default</b>
        - Use `left click` to drag the comparison bar
        - Press the `backspace` key or click the `🔄` button to reset the scale and position
        - Press the `+` key or click the `➕` button to zoom in
        - Press the `-` key or click the `➖` button to zoom out
        - Use `arrow keys` to pan around
    - <b>Holding Shift</b>
        - Use `left click` to pan around
        - Use `scrollwheel` to zoom in & out
        - Press the `0` key to reset the scale and position
    - <b>Buttons</b>
        - Use the `Horizontal Slider` checkbox to toggle between *side-by-side* and *top-to-bottom* comparisons
        - Use the `Opacity` slider to alter the transparency of the 2nd image
        - Click on the `Swap` button to quickly exchange the two images

### Infotext

At the bottom of the **Comparison** tab, there is also an `Infotext` panel. When you **manually upload** images generated via the Webui, the panel will display the generation parameters for both images. Parameters that are different between the two images will be highlighted in red.

<p align="center">
<img src="./info.jpg">
</p>
