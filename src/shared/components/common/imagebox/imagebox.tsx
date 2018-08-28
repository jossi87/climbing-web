import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../../api.js';

export default class ImageBox extends Component<any, any> {
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
          color: '#959595',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>{this.props.title}</div>
        <h4><Link to={`/problem/${this.props.data.idProblem}`}>{this.props.data.problem}</Link> {this.props.data.grade}</h4>
        <img style={{maxWidth: '100%', maxHeight: '40vh'}} src={getImageUrl(this.props.data.idMedia, null)} alt={this.props.data.problem}/><br/>
        <i>Photographer: <Link to={`/user/${this.props.data.idCreator}`}>{this.props.data.creator}</Link></i>
      </div>
    );
  }
}
