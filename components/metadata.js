const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div className="parametric-metadata-container">
        <div className="parametric-metadata">
          <div style={{marginBottom: '1em'}}>
            <div className="parametric-metadata-header">Created By</div>
            {props.authors.map(({name, role}) => {
              return <div key={name}>{name}, <span className="parametric-metadata-role">{role}</span></div>
            })}
          </div>
          <div>
          <div className="parametric-metadata-header">Metadata</div>
            <div>Source Code</div>
            <div>Offline Archive</div>
            <div>DOI</div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CustomComponent;
