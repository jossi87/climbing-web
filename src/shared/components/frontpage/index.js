import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Table, Grid, Well, Row, Col, Clearfix } from 'react-bootstrap';
import Request from 'superagent';
import TextBox from './textbox/textbox';
import ImageBox from './imagebox/imagebox';
import LinkBox from './linkbox/linkbox';
import config from '../../utils/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const style = {padding: 0, textAlign: 'left'};
const styleNw = {padding: 0, textAlign: 'left', whiteSpace: 'nowrap'};

export default class Index extends Component {
  componentDidMount() {
    Request.get(config.getUrl("frontpage")).withCredentials().end((err, res) => {
      this.setState({
        error: err? err : null,
        data: err? null : res.body
      });
    });
  }

  render() {
    if (!this.state) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }

    const newestProblems = this.state.data.fas.map((x, i) => {
      return (
        <p key={i}>
          <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link> {x.grade}<br/>
          <small style={{color: '#777'}}><Link to={`/area/${x.idArea}`} style={{color: '#777'}}>{x.area}</Link> / <Link to={`/sector/${x.idSector}`} style={{color: '#777'}}>{x.sector}</Link> {x.date}</small>
        </p>
      )
    });

    const latestAscents = this.state.data.ascents.map((x, i) => {
      return (
        <p key={i}>
          <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link> {x.grade}<br/>
          <small style={{color: '#777'}}><Link to={`/user/${x.idUser}`} style={{color: '#777'}}>{x.user}</Link> {x.date}</small>
        </p>
      )
    });

    const newestMedia = this.state.data.medias.map((x, i) => {
      const icon = x.type === 'image'? <FontAwesomeIcon icon="camera" /> : <FontAwesomeIcon icon="video" />;
      return (
        <p key={i}>
          <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link> <small>{x.grade}</small> {icon}
        </p>
      )
    });

    const latestComments = this.state.data.comments.map((x, i) => {
      return (
        <p key={i}>
          <small>{x.date}</small> <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link>
        </p>
      )
    });

    return (
      <span>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data.metadata.description} />
        </MetaTags>
        <Grid>
          <Row>
            <Well style={{textAlign: 'center'}}>
              Total: {this.state.data.numProblems} ({this.state.data.numProblemsWithCoordinates} with coordinates{this.state.data.numProblemsWithTopo>0? ", " + this.state.data.numProblemsWithTopo + " on topo" : ""}) | Public ascents: {this.state.data.numTicks} | Images: {this.state.data.numImages} | Ascents on video: {this.state.data.numMovies}
            </Well>
          </Row>
          <Row>
            <Col xs={8} md={9} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <ImageBox data={this.state.data.randomMedia}/>
            </Col>
            <Col xs={4} md={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <LinkBox showLogoPlay={this.state.data.showLogoPlay} showLogoSis={this.state.data.showLogoSis} showLogoBrv={this.state.data.showLogoBrv}/>
            </Col>
          </Row>
          <Row>
            <Col xs={6} lg={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <TextBox title="Newest" data={newestProblems}/>
            </Col>
            <Col xs={6} lg={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <TextBox title="Latest ascents" data={latestAscents}/>
            </Col>
            <Clearfix visibleXsBlock></Clearfix>
            <Col xs={6} lg={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <TextBox title="Newest media" data={newestMedia}/>
            </Col>
            <Col xs={6} lg={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
              <TextBox title="Latest comments" data={latestComments}/>
            </Col>
          </Row>
        </Grid>
      </span>
    );
  }
}
