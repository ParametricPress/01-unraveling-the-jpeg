const D3Component = require('idyll-d3-component');

function resetData(editor, originalData, savedComponents) {
  editor.decodedImage.data = originalData;

  editor.fillDecodedComponent('Y', savedComponents['Y']);
  editor.fillDecodedComponent('Cb', savedComponents['Cb']);
  editor.fillDecodedComponent('Cr', savedComponents['Cr']);

  editor.decodedImage._decoder.copyToImageData({
      width: editor.decodedImage.width,
      height: editor.decodedImage.height,
      data: originalData
    });
}

function redrawAll(scale, editor, originalData, savedComponents) {
  // RGB
  editor.canvas = document.querySelector("#R>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('R', scale)

  editor.canvas = document.querySelector("#G>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('G', scale)

  editor.canvas = document.querySelector("#B>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('B', scale)

  // YCbCr
  editor.canvas = document.querySelector("#Y>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('Y', scale)

  editor.canvas = document.querySelector("#Cb>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('Cb', scale)

  editor.canvas = document.querySelector("#Cr>canvas");
  resetData(editor, originalData, savedComponents);
  editor.subsampleAndRedraw('Cr', scale)
}

class SubsampleGrid extends D3Component {

  initialize(node, props) {
    // node is a <div> container,

    const ImageUtilities = require('./utils/ImageUtilities');
    node.className = 'image-editor-container subsample-grid';
    let imageEditor = new ImageUtilities({
      url: props.imageUrl,
      editMode: 'subsample'
    });

    this.imageEditor = imageEditor;
    this.savedComponents = {};
    let that = this;

    imageEditor.readyPromise
      .then(function() {
        // Create 2x3 grid inside `node`
        let outerContainer = node;
        let container = document.createElement('div');
        container.className = 'subsample-container row';
        let html = `<div class="subsample-container row">
    <div class="column">
      <div id="R" class="subsample-image"><canvas></canvas><p>Red</p></div>
      <div id="Y" class="subsample-image"><canvas></canvas><p>Luminance</p></div>
    </div>
    <div class="column">
      <div id="G" class="subsample-image"><canvas></canvas><p>Green</p></div>
      <div id="Cb" class="subsample-image"><canvas></canvas><p>Blue Chrominance</p></div>
    </div>
    <div class="column">
      <div id="B" class="subsample-image"><canvas></canvas><p>Blue</p></div>
      <div id="Cr" class="subsample-image"><canvas></canvas><p>Red Chrominance</p></div>
    </div>
  </div>`;
        container.innerHTML = html;
        node.appendChild(container);
        // TODO if image is big, resize it, because otherwise this is too expensive?

        that.originalData = imageEditor.decodedImage.data.slice();
        that.savedComponents['Y'] = imageEditor.getDecodedComponent('Y');
        that.savedComponents['Cb'] = imageEditor.getDecodedComponent('Cb');
        that.savedComponents['Cr'] = imageEditor.getDecodedComponent('Cr');

        that.update(props);
        //redrawAll(10, imageEditor, that.originalData, that.savedComponents)
      }).catch(e => {
        console.log(e);
      });
      this.imageEditor = imageEditor;
  }

  update(props, oldProps) {
    let subsample = props.subsamplePercent;
    let scaleArray = [1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 30, 40, 50, 80, 100, 0];
    let scale = scaleArray[0 | (subsample * (scaleArray.length - 1))];
    console.log(scale);
    redrawAll(scale, this.imageEditor, this.originalData, this.savedComponents);
  }

}

module.exports = SubsampleGrid;