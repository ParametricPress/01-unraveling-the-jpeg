const D3Component = require('idyll-d3-component');

class CustomD3Component extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    node.className = 'image-editor-container';
    const ImageUtilities = require('./utils/ImageUtilities');
    console.log(props.imageUrl)
    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      editMode: 'raw'
    });
    imageEditor.readyPromise
      .then(function() {
        imageEditor.createImageEditor(node);
        // setupEditorLinks(containerSelector, imageEditor);
        // if (window.imageEditor == undefined) {
        //   window.imageEditor = imageEditor;
        // }
        // Get the body.
        let body = imageEditor.body;
        // Put it in, split by each 16 numbers
        imageEditor.putValuesInEditor(body, 16, true);

        setTimeout(() => imageEditor.editor.resize(), 1500)
      }).catch(e => {
        console.log(e);
      });

      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
  }

}

module.exports = CustomD3Component;