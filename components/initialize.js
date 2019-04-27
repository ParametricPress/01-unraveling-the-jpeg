
const React = require('react');

class Initialize extends React.Component {
    componentDidMount(e) {
      const body  = document.getElementsByTagName('body')[0];
      body.classList.add('enabled');
    }
    componentWillUnmount(e) {
      const body  = document.getElementsByTagName('body')[0];
      body.classList.remove('enabled');
    }
    render() {
      return null;
    }
}

module.exports = Initialize;
