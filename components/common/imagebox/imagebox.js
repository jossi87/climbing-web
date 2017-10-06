import React, {Component} from 'react';
import Gallery from './../gallery/gallery';
import { Link } from 'react-router-dom';
import config from '../../../utils/config.js';

export default class ImageBox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{
        position: 'relative',
        padding: '45px 15px 15px',
        borderColor: '#e3e3e3',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
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
        <h4><Link to={`/problem/${this.props.data.idProblem}`}>{this.props.data.problem}</Link> {this.props.data.grade}</h4>
        <img style={{maxWidth: '100%', maxHeight: '40vh'}} src={config.getUrl(`images?id=${this.props.data.idMedia}`)}/><br/>
        <i>Photographer: <Link to={`/user/${this.props.data.idCreator}`}>{this.props.data.creator}</Link></i>
      </div>
    );
  }
}
