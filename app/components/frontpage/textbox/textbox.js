import React, {Component} from 'react';

export default class TextBox extends Component {
  constructor(props) {
    super(props);
    this.setState({
      showAll: false,
      btnLabel: 'More'
    });
  }

  handleOnClick(e) {
    e.preventDefault();
    if (this.state.showAll===true) {
      this.setState({showAll: false, btnLabel: 'More'});
    } else {
      this.setState({showAll: true, btnLabel: 'Less'});
    }
  }

  render() {
    const content = this.state.showAll===true? this.props.data : this.props.data.map((x, i) => {if (i < 10) return(x)});
    return (
      <div style={{
        backgroundColor: '#FFF',
        position: 'relative',
        padding: '45px 15px 15px',
        borderColor: '#e3e3e3',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        borderBottomLeftRadius: '4px'
      }}>
        {content}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#959595',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>{this.props.title}</div>
        <a style={{
          float: 'right',
          display: 'inline-block',
          position: 'relative',
          right: '-16px',
          top: '15px',
          background: '#FFF',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          border: '1px solid #e3e3e3',
          borderTop: 'none',
          padding: '4px 8px',
          marginBottom: '20px'
        }} href="#" onClick={this.handleOnClick.bind(this)}>{this.state.btnLabel}</a>
      </div>
    );
  }
}
