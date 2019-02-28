import React from 'react';

class Nav extends React.PureComponent {

  constructor(props) {
    super(props);
    this.handleContents = this.handleContents.bind(this);
    this.state = {
      showContent: false
    }
  }

  handleContents() {
    this.setState({
      showContent: !this.state.showContent
    });
  }

  render() {
    return (
      <div style={{
        marginTop: 25,
        marginLeft: 50,
        marginRight: 50,
        zIndex: 1000}}>
          <div>
            {/* <div style={{fontFamily:'Bluu', textDecoration: 'none'}}>Parametric Press</div> */}
            <img src="static/images/logo.png" style={{display: 'inline', width:238}} />
          </div>
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            fontSize: 32,
            fontFamily: 'Graphik',
            textDecoration: 'underline',
            marginTop: '0.5em',
            lineHeight: '32px'
          }}>
            <div>
              Issue 01<br/>
              Science + Society
            </div>
            <div style={{cursor: 'pointer', zIndex: 1000}} onClick={this.handleContents}>
              Table of Contents
            </div>

          </div>
          <div style={{
            display: this.state.showContent ? 'block' : 'none',
            position: 'fixed',
            width: 500,
            right: 0,
            top: 0,
            bottom: 0,
            padding: '2em',
            paddingTop: '8em',
            background: '#FFE533',
            overflow: 'auto',
            zIndex: 999
            }}>
            <div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  01
                </div>
              </div>
            </div><div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  02
                </div>
              </div>
            </div><div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  03
                </div>
              </div>
            </div><div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  04
                </div>
              </div>
            </div><div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  05
                </div>
              </div>
            </div><div style={{textAlign: 'right', fontSize: 32}}>
              <div style={{marginBottom: '2em', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <div>
                  <div style={{fontFamily: 'Graphik'}}>
                    Decoding the JPEG
                  </div>
                  <div style={{fontStyle: 'italic', fontWeight: 300, fontFamily: 'Graphik'}}>
                    By Omar Shehata
                  </div>
                </div>
                <div style={{marginLeft: '1em', fontFamily: 'Graphik'}}>
                  06
                </div>
              </div>
            </div>
          </div>
      </div>
    )
  }
}
export default Nav;
