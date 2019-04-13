const React = require('react');

class TextArea extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick(e) {
      const { search, replace, line, editor, pattern, scale, DCT } = this.props;
      const imageEditor = editor.component.imageEditor;
      let text = imageEditor.resetText;
      //let text = imageEditor.editor.getSession().getValue();
      let lines = text.split('\n');
      let sentValuesToEditor = false;
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
      } else if (pattern == 'animate-DCT') {
        let that = this;

        if (window.currentInterval != undefined && this.interval == window.currentInterval) {
          // Just pause
          clearInterval(window.currentInterval);
          window.currentInterval = undefined;
        } else {
          let values = [];
          let lines = DCT.content.split("\n");
          for (let line of lines) {
            values = values.concat(line.trim().split(" "));
          }

          if (JSON.stringify(values) != JSON.stringify(imageEditor.finalValues)) {
            // This is a new image!
            imageEditor.currentValues = undefined;
          }

          imageEditor.finalValues = values;
                    
          // If it's already been going, and not done yet
          if (imageEditor.currentValues != undefined && imageEditor.currentValues.length < imageEditor.finalValues.length) {
            // No need to reset
          } else {
            // Otherwise, start from beginning
            imageEditor.setResetText(DCT.content);
            imageEditor.currentValues = [];
          }

          imageEditor.putValuesInEditor(imageEditor.currentValues, 64, false);        
          if (window.currentInterval) {
            clearInterval(window.currentInterval);
          }
          window.currentInterval = setInterval(function(){
            if (imageEditor.currentValues.length < imageEditor.finalValues.length) {
              // Add as many non trivial numbers. Non trivial is defined as less than 10. 
              for (let i = imageEditor.currentValues.length; i < imageEditor.finalValues.length; i++) {
                imageEditor.currentValues.push(imageEditor.finalValues[i]);

                if (Math.abs(imageEditor.finalValues[i]) > 10) {
                  break;
                }
              }
              
              imageEditor.putValuesInEditor(imageEditor.currentValues, 64, false);
            } else {
             clearInterval(window.currentInterval);
             window.currentInterval = undefined;
            }
          }, 20);
          this.interval = window.currentInterval;
        }

        sentValuesToEditor = true;
      } else {
        let count = 0;
        let values = imageEditor.getValuesFromEditor(imageEditor.resetText);
        let newValues = [];
        for (let i = 0; i < values.length; i+= scale + 2) {
          for (let j = 0; j < scale; j++) {
            let lookAheadCb = values[i + scale];
            let lookAheadCr = values[i + scale + 1];

            let Y = (pattern == 'isolate-Y') ? values[i + j] : 128;
            newValues.push(Y)
          }

          let Cb = (pattern == 'isolate-Cb') ? (values[i + scale]) : 128;
          let Cr = (pattern == 'isolate-Cr') ? (values[i + scale + 1]) : 128;

          newValues.push(Cb) 
          newValues.push(Cr);
        }

        let samplesPerLine = imageEditor.samplesPerLine;
        imageEditor.putValuesInEditor(newValues, samplesPerLine);
        sentValuesToEditor = true;
      }
      
      if (!sentValuesToEditor) {
        text = lines.join('\n');
        imageEditor.editor.setValue(text, -1);
        imageEditor.editor.scrollToLine(line - 1);  
      }
      

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
