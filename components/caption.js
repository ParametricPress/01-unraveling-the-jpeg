const React = require('react');

class Caption extends React.Component {
    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <div className="parametric-caption">{props.children}</div>
        );
    }
}

module.exports = Caption;
