const D3Component = require('idyll-d3-component');

class ChromaEditor extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    const ImageUtilities = require('./utils/ImageUtilities');
    node.className = 'image-editor-container';
    console.log(props.imageUrl)
    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      corruptedImage: props.corruptedImage,
      highlightPixelOnClick: true,
      editMode: 'chroma'
    });
    imageEditor.readyPromise
      .then(function() {
        imageEditor.createImageEditor(node);
        console.log(imageEditor);

        // This assumes Y has a scale 1, and Cb and Cr have the same scale.
        // Interleave the colors based on the h and v of each component
        // Put each scan line on a line
        let colors = [];
        let components = imageEditor.decodedImage._decoder.components;
        let Y = components[0];
        let Cb = components[1];
        let Cr = components[2];
        let scaleY = Math.round(Y.lines.length / Cb.lines.length);
        let scaleX = Math.round(Y.lines[0].length / Cb.lines[0].length);
        let scale = scaleX * scaleY;
        let samplesPerLine = Y.lines[0].length + Cb.lines[0].length + Cr.lines[0].length;
        imageEditor.samplesPerLine = samplesPerLine;
        imageEditor.scale = scale;

        let Cindex = 0;
        Y = imageEditor.getDecodedComponent('Y');
        Cb = imageEditor.getDecodedComponent('Cb');
        Cr = imageEditor.getDecodedComponent('Cr');

        for (let i = 0; i < Y.length; i += scale) {
            // We have more Y than we have Cb and Cr
            // so we put multiple Y for each Cb and Cr
            for (let j = 0; j < scale; j++) {
                colors.push(Y[i + j]);
            }
            colors.push(Cb[Cindex]);
            colors.push(Cr[Cindex]);
            Cindex++;
        }
        imageEditor.putValuesInEditor(colors, samplesPerLine, true);

        setTimeout(() => imageEditor.editor.resize(), 1500)
      }).catch(e => {
        console.log(e);
      });
      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
  }

}

module.exports = ChromaEditor;