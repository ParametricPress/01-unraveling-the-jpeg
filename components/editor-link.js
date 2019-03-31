const React = require('react');

class TextArea extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(e) {
      const { search, replace, line, editor, pattern, scale } = this.props;
      const imageEditor = editor.component.imageEditor;
      let text = imageEditor.resetText;
      //let text = imageEditor.editor.getSession().getValue();
      let lines = text.split('\n');
      if (pattern == undefined) {
        for (let i = 0; i < lines.length; i++) {
          if (i == line - 1) {
            lines[i] = lines[i].replace(search, replace);
            break;
          }
        }
      } else if (pattern == "zero-all") {
        for (let i = 0; i < lines.length; i++) {
          let numbers = lines[i].trim().split(" ");
          for (let j = 0; j < numbers.length; j++) {
            numbers[j] = "0";
          }
          lines[i] = numbers.join(" ");
        }
      } else if (pattern == "remove-zeros") {
        // For each line, find the last non-zero value, then remove all remaining zeros
        for (let i = 0; i < lines.length; i++) {
          let reg = /(-?[1-9]0*)+/g;
          let match;
          let lastIndex = 0;
          let lastLength = 1;
          while ((match = reg.exec(lines[i])) != null) {
            lastIndex = match.index;
            lastLength = match[0].length;
          }
          lines[i] = lines[i].slice(0, lastIndex + lastLength);
        }
      } else if (pattern.indexOf("remove-{") != -1) {
        // Remove the last n lines
        let n = pattern.match(/{(\d+)}/)[1];
        lines = lines.slice(0, lines.length-n);
      } else if (pattern.indexOf("zero-{") != -1) {
        // Zero out the first n numbers
        let n = Number(pattern.match(/{(\d+)}/)[1]);
        let first = true;
        for (let i = 0; i < lines.length; i++) {
          let numbers = lines[i].trim().split(" ");
          for (let j = 0; j < numbers.length; j++) {
            if (!first) {
              numbers[j] = "0";
            }
            first = false;
            n --;
            if (n <= 0) break;
          }

          lines[i] = numbers.join(" ");
        }
      } else {
        let count = 0;
        for (let i = 0; i < lines.length; i++) {
          let numbers = lines[i].trim().split(" ");
          for (let j = 0; j < numbers.length; j++) {
            let index = count % (scale + 2);
            count ++;
            if (index > 3 && pattern == "isolate-Y") {
              numbers[j] = "128";
            }
            if (index != 4 && pattern == "isolate-Cb") {
              numbers[j] = (index < scale) ? (numbers[j+(scale-index)]) : "128";
            }
            if (index != 5 && pattern == "isolate-Cr") {
              numbers[j] = (index < scale) ? (numbers[j+(scale+1-index)]) : "128";
            }
          }
          lines[i] = numbers.join(" ");
        }
      }
      
      text = lines.join('\n');
      imageEditor.editor.setValue(text, -1);
      imageEditor.editor.scrollToLine(line - 1);
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
