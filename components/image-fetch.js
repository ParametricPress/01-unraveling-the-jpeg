const React = require('react');

class ImageFetch extends React.Component {

  componentDidMount() {
		fetch(this.props.src)
			.then((response) => {
				console.log(response);
				return response.arrayBuffer();
      })
      .then((buffer) => {
        console.log('here');
				let bytes = new Uint8Array(buffer);
				let start = false;
				let saveBytes = [];
				let headerBytes = [];
				for (let i = 0; i < bytes.length; ++i) {
					if (i < bytes.length - 1 && bytes[i] == 252 && bytes[i+1] == 255) {
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
