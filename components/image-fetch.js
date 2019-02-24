const React = require('react');

class ImageFetch extends React.Component {

  componentDidMount() {
		fetch(this.props.src)
			.then((response) => {
				return response.arrayBuffer();
      })
      .then((buffer) => {
				let bytes = new Uint8Array(buffer);
				let start = false;
				let saveBytes = [];
				let headerBytes = [];
				for (let i = 0; i < bytes.length; ++i) {
					// From:
					// Start is FFDA (255 218)
					// End is FFD9 (255 217)
					// If there exists a thumbnail, it will trip this up
					// Maybe find a way to check for a thumbnail and ignore it?
					if (i < bytes.length - 1 && bytes[i] == 255 && bytes[i+1] == 218) {
						start = true;
					}
					if (start) {
						//bytes[i] = parseInt(replacement[index++], 16);
						saveBytes.push(bytes[i]);
					} else {
						headerBytes.push(bytes[i]);
					}
        }
        this.props.updateProps({
          header: headerBytes.join(' '),
          body: saveBytes.join(' ')
        })
			});
  }

  render() {
    return null;
  }
}

module.exports = ImageFetch;
