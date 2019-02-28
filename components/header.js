import React from 'react';
import { TextContainer } from 'idyll-components';

const formatTitle = (title) => {
  return title.reduce((memo, str, i) => {
    if (i < title.length - 1) {
      return memo.concat([<span key={str}>{str}</span>, <br key={i} />]);
    }
    return memo.concat([<span key={str}>{str}</span>]);
  }, [])
}
class Header extends React.PureComponent {
  render() {
    const {longTitle, ...props} = this.props;
    return (
      <div className={'article-header'} style={{marginTop: 0}}>
        <div style={{
          display: 'flex',
          width: '100vw',
          position: 'relative',
          top: '4em'
        }}>
          <div style={{position: 'relative', height: 520, zIndex: 2}}>
            <TextContainer {...props}>
              <div style={{position: 'relative', width: 720}}>
                <div style={{position: 'absolute', width: '100%', left: '-5em'}}>
                    <h1 className={'hed'}>
                      {
                        formatTitle(this.props.title)
                      }
                    </h1>
                    <h1 className={'hed hed-offset'}>
                      {
                        formatTitle(this.props.title)
                      }
                    </h1>
                </div>
                <div style={{width: 720, maxWidth: 720, position: 'relative', top: 120, fontSize: '12px', lineHeight: '20px', color: '#4801FF', fontFamily: 'Silkscreen'}}>
                  <div>
                    <div style={{fontWeight: 900, fontFamily: 'Graphik', fontSize: 48, lineHeight: '64px'}}>
                      {formatTitle(this.props.longTitle)}
                    </div>
                    <div>
                      {props.date}
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div>
                      <div style={{fontWeight: 'bold'}}>
                        Created By
                      </div>
                      <div>
                        {
                          this.props.authors.map(({name, role}) => {
                            return <div key={name}><a>{name}</a> {role}</div>
                          })
                        }
                      </div>
                    </div>
                    <div style={{marginLeft: '4em'}}>
                      <div style={{fontWeight: 'bold'}}>
                        Metadata
                      </div>
                      <div>
                        <a>Source Code</a><br/>
                        <a>Offline Archive</a><br/>
                        {/* <a>DOI</a> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TextContainer>
          </div>
          <div style={{position: 'relative', top: 150}}>
            <img src="static/images/jpeg.png" />
          </div>
          {/* <div style={{position: 'absolute', top: 0, right: 0}}> */}
          {/* </div> */}
          <h1 className="hed-rotate">
            {
              formatTitle(this.props.title)
            }
          </h1>
        </div>
        <TextContainer {...props}>
          <div style={{fontFamily: 'Graphik', fontSize: 32, line: 48}}>
            {this.props.dek}
          </div>
        </TextContainer>
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
