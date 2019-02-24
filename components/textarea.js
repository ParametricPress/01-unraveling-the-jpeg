const React = require('react');

class TextArea extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        this.props.updateProps({ value: e.target.value });
    }
    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <textarea onChange={this.onChange} {...props}></textarea>
        );
    }
}

module.exports = TextArea;
