import React from 'react';
import ReactDOM from 'react-dom';

class Comment extends React.PureComponent {
  componentDidMount() {
      let el = ReactDOM.findDOMNode(this);
      ReactDOM.unmountComponentAtNode(el);
      el.outerHTML = this.createComment();
  }

  createComment() {
      let text = this.props.value;

      if (this.props.trim) {
          text = text.trim();
      }

      return `<!-- ${text} -->`;
  }

  render() {
      return <div />;
  }
}

module.exports = Comment;
