const React = require('react');

class Reference extends React.Component {
    constructor(props) {
        // TODO: Make this a reference that pops up a div?
        // And it keeps track of its number automatically too?
        super(props);
        const that = this;
        this.onClick = function(){
            alert(that.props.content);
        }
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <span className="reference" onClick={this.onClick}>{props.children}</span>
        );
    }
}

module.exports = Reference;
