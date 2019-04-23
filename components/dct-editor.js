const D3Component = require('idyll-d3-component');

class DctEditor extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    const ImageUtilities = require('./utils/ImageUtilities');
    node.className = 'image-editor-container';
    let editMode = 'dctLuminance';
    let comp = props.comp;

    if(comp == undefined) comp = 'Y';
    if (props.comp == 'Cb') editMode = 'dctBlue';
    if (props.comp == 'Cr') editMode = 'dctRed';

    let that = this;

    function done(imageEditor) {
      imageEditor.createImageEditor(node, 'Discrete Cosine Transform Editor');

      if (props.override != undefined) {
        let values = [];
        let lines = props.override.content.split("\n");
        for (let line of lines) {
          values = values.concat(line.trim().split(" "));
        }
        imageEditor.putValuesInEditor(values, 64, true);

      } else {
        // Get the DCT coefficients out.
        let dctCoefficients = imageEditor.getDctComponent(comp);

        // Put each block in a line, since each block has 64 numbers.
        imageEditor.putValuesInEditor(dctCoefficients, 64, true);
      }

      that.imageEditor = imageEditor;
      setTimeout(() => imageEditor.editor.resize(), 1500)
    }

    new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      highlightPixelOnClick: true,
      editMode: editMode,
      maxWidth: props.maxWidth,
      isUrlExempt: props.isUrlExempt,
      callback: done
    });
  }

  update(props, oldProps) {
  }

}

module.exports = DctEditor;