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

    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      highlightPixelOnClick: true,
      editMode: editMode
    });
    imageEditor.readyPromise
      .then(function() {
        imageEditor.createImageEditor(node);

        if (props.override != undefined) {
          let values = [];
          let lines = props.override.split("\n");
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
        

        setTimeout(() => imageEditor.editor.resize(), 1500)
      }).catch(e => {
        console.log(e);
      });
      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
  }

}

module.exports = DctEditor;