import React, {Component} from 'react';
import Gallery from './../../common/gallery/gallery';
import { Link } from 'react-router-dom';
import { Well } from 'react-bootstrap';
import config from '../../../utils/config.js';

export default class ImageBox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var txt = null;
    if (!this.props || !this.props.data) {
      return (
        <Well style={{
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          No data
        </Well>
      )
    }
    if (this.props.data.inPhoto) {
      txt = <i>Photographer: <Link to={`/user/${this.props.data.idCreator}`}>{this.props.data.creator}</Link>, in photo: {this.props.data.inPhoto}</i>
    } else {
      txt = <i>Photographer: <Link to={`/user/${this.props.data.idCreator}`}>{this.props.data.creator}</Link></i>
    }
    return (
      <Well style={{
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <h4><Link to={`/problem/${this.props.data.idProblem}`}>{this.props.data.problem}</Link> {this.props.data.grade}</h4>
        <Link to={`/problem/${this.props.data.idProblem}`}>
          <img style={{maxWidth: '100%'}} src={config.getUrl(`images?id=${this.props.data.idMedia}&targetHeight=480`)}/>
        </Link><br/>
        {txt}
      </Well>
    );
  }
}
