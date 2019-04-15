const D3Component = require('idyll-d3-component');

class RawEditor extends D3Component {

  initialize(node, props) {
    // node is a <div> container,
    node.className = 'image-editor-container';
    const ImageUtilities = require('./utils/ImageUtilities');

    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      showHeader: props.showHeader,
      corruptedImage: props.corruptedImage,
      editMode: 'raw'
    });
    imageEditor.readyPromise
      .then(function() {
        imageEditor.createImageEditor(node);
        // Get the body.
        let body = imageEditor.body;
        let header = imageEditor.header;
        let total = header.concat(body);
        // Put it in, split by each 16 numbers
        if (imageEditor.showHeader) {
          imageEditor.putValuesInEditor(total, 16, true);
        } else {
          imageEditor.putValuesInEditor(body, 16, true);
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

module.exports = RawEditor;