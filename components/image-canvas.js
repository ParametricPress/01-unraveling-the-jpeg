const React = require('react');
const D3Component = require('idyll-d3-component');

const size = 600;

class CustomD3Component extends D3Component {

  initialize(node, props) {
    this.node = node;
    this.canvas = document.createElement('canvas');
    this.node.appendChild(this.canvas);
    this.createImage = this.createImage.bind(this);

    // Fetch and save the "Image was corrupted!" placeholder.
    const that = this;
    fetch('static/images/corrupted.png')
      .then(function(response){
        return response.blob();
      })
      .then(createImageBitmap)
      .then(function(imageBitmap) {
        that.corruptedImage = imageBitmap;
      })
  }

  draw(imageBitmap, width, height) {
    const ctx = this.canvas.getContext('2d');
    if (width && height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    ctx.drawImage(imageBitmap, 0, 0, this.canvas.width, this.canvas.height);
  }

  createImage (header, body) {
    const byteArray = new Uint8Array((header + ' ' + body).split(' ').map(parseFloat));
    let blob = new Blob([byteArray.buffer], {type: 'image/jpeg'});
    const that = this;

    createImageBitmap(blob)
    .then((imageBitmap) => {
      that.draw(imageBitmap, imageBitmap.width, imageBitmap.height);
    })
    .catch((error) => {
      that.draw(this.corruptedImage);
    });
  }

  update(props, oldProps) {
    if (props.body !== oldProps.body || props.header !== oldProps.header) {
      this.createImage(props.header, props.body);
    }
  }
}

module.exports = CustomD3Component;
