const React = require('react');

class TextArea extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(e) {
      const { search, replace, line, editor } = this.props;
      console.log(editor);
      const imageEditor = editor.component.imageEditor;
      let text = imageEditor.editor.getSession().getValue();
      let lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (i == line - 1) {
          lines[i] = lines[i].replace(search, replace);
          break;
        }
      }
      text = lines.join('\n');
      imageEditor.editor.setValue(text, -1);
      imageEditor.editor.scrollToLine(line);
        // this.props.updateProps({ value: e.target.value });
    }
    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <span className="replace-link" onClick={this.onClick}>{props.children}</span>
        );
    }
}

module.exports = TextArea;
