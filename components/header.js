import React from 'react';

class Header extends React.PureComponent {
  render() {
    return (
      <div className={'article-header'} style={{marginTop: 30}}>
        <div className="hed-container">
        <h1 className={'hed'}>
        {this.props.title} {this.props.title} {this.props.title} <br/>
          Decoding the Jpeg <span className="header-highlight">Decoding</span> the Jpeg Decoding <br />
          the Jpeg Decoding <span className="header-highlight">the Jpeg</span> Decoding the Jpeg <br />
{this.props.title} {this.props.title} {this.props.title}        </h1>
        {
          this.props.subtitle && (
            <h2 className={'dek'}>
              {this.props.subtitle}
            </h2>
          )
        }
        {
          this.props.author && (
            <div className={'byline'}>
              By: <a href={this.props.authorLink}>{this.props.author}</a>
            </div>
          )
        }
        {
          this.props.authors ? (
            <div className={'byline'}>
              By: {
                this.props.authors.map((author, i) => {
                  if (typeof author === 'string') {
                    return author;
                  }
                  return author.link ? (
                    <span key={author.name}>
                      <a href={author.link} >{author.name}</a>{
                        i < this.props.authors.length -1 ? (
                          i === this.props.authors.length - 2 ? ' and ' :  ', ' )
                        : ''}
                    </span>
                  ) : author.name;
                })
              }
              {}
            </div>
          ) : null
        }
        {
          this.props.date && (
          <div className={'idyll-pub-date'}>
            {this.props.date}
          </div>
          )
        }
      </div>
      </div>
    );
  }
}

Header._idyll = {
  name: "Header",
  tagType: "closed",
  props: [{
    name: "title",
    type: "string",
    example: '"Article Title"'
  }, {
    name: 'subtitle',
    type: 'string',
    example: '"Article subtitle."'
  }, {
    name: 'author',
    type: 'string',
    example: '"Author Name"'
  }, {
    name: 'authorLink',
    type: 'string',
    example: '"author.website"'
  }]
}

export default Header;