const D3Component = require('idyll-d3-component');

class FullDctEditor extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    const ImageUtilities = require('./utils/ImageUtilities');
    node.className = 'image-editor-container';

    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      editMode: 'full-dctLuminance'
    });
    imageEditor.readyPromise
      .then(function() {
        imageEditor.createImageEditor(node);
        // Get the decoded luminance values.
        let luminanceValues = imageEditor.getDecodedComponent('Y');
        // Convert them into cosine waves.
        let dctLuminance = imageEditor.forwardDct(luminanceValues, true);
        imageEditor.numberOfCoefficients = dctLuminance.length;

        // Put the coefficients in the editor.
        imageEditor.putValuesInEditor(dctLuminance, imageEditor.decodedImage.width, true);

        setTimeout(() => imageEditor.editor.resize(), 1500)
      }).catch(e => {
        console.log(e);
      });
      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
  }

}

module.exports = FullDctEditor;