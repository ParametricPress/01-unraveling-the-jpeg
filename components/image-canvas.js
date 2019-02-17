const React = require('react');
const D3Component = require('idyll-d3-component');

const size = 600;

class CustomD3Component extends D3Component {

  initialize(node, props) {
    this.node = node;
    this.canvas = document.createElement('canvas');
    this.node.appendChild(this.canvas);
    this.createImage = this.createImage.bind(this);
  }

  createImage (header, body) {
    const byteArray = new Uint8Array((header + ' ' + body).split(' ').map(parseFloat));
    let blob = new Blob([byteArray.buffer], {type: 'image/jpeg'});

    createImageBitmap(blob)
    .then((imageBitmap) => {
      console.log(imageBitmap);
      const ctx = this.canvas.getContext('2d');
      try {
        console.log(this.canvas.width, this.canvas.height)
      } catch (e) {
        console.log(e);
      }
      console.log('ctx', ctx);
      this.canvas.width = imageBitmap.width;
      this.canvas.height = imageBitmap.height;
      ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
    })
  }

  update(props, oldProps) {
    if (props.body !== oldProps.body) {
      this.createImage(props.header, props.body);
    }
  }
}

module.exports = CustomD3Component;
