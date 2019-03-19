const D3Component = require('idyll-d3-component');

class CustomD3Component extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    const ImageUtilities = require('./utils/ImageUtilities');
    node.className = 'image-editor-container';
    console.log(props.imageUrl)
    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      editMode: 'full-dctLuminance'
    });
    imageEditor.readyPromise
      .then(function() {
        console.log('creating image editor');
        imageEditor.createImageEditor(node);
        // if (window.imageEditor == undefined) {
        //   window.imageEditor = imageEditor;
        // }
        console.log('created image editor');

        // Get the decoded luminance values.
        let luminanceValues = imageEditor.getDecodedComponent('Y');
        console.log('got decoded component');
        // Convert them into cosine waves.
        let dctLuminance = imageEditor.forwardDct(luminanceValues, true);
        console.log('got luminance');
        imageEditor.numberOfCoefficients = dctLuminance.length;

        console.log('did some things');
        // Put the coefficients in the editor.
        imageEditor.putValuesInEditor(dctLuminance, imageEditor.decodedImage.width, true);

        setTimeout(() => imageEditor.editor.resize(), 1500)
        console.log('finished');
      }).catch(e => {
        console.log(e);
      });
      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
  }

}

module.exports = CustomD3Component;