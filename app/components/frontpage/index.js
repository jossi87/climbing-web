import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Table, Grid, Well, Row, Col, Clearfix } from 'react-bootstrap';
import Request from 'superagent';
import TextBox from './textbox/textbox';
import ImageBox from './imagebox/imagebox';
import LinkBox from './linkbox/linkbox';
import config from '../../utils/config.js';

const style = {padding: 0, textAlign: 'left'};
const styleNw = {padding: 0, textAlign: 'left', whiteSpace: 'nowrap'};

export default class Index extends Component {
  componentDidMount() {
    Request.get(config.getUrl("frontpage?regionId=" + config.getRegion())).withCredentials().end((err, res) => {
      this.setState({
        error: err? err : null,
        data: err? null : res.body
      });
    });
    document.title=config.getTitle();
  }

  render() {
    if (!this.state) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }

    const newestProblems = this.state.data.fas.map((x, i) => {
      var typeImg = null;
      if (config.getRegion()==4) {
        switch (x.typeId) {
          case 2: typeImg = <img height="20" src="/jpg/bolt.jpg"/>; break;
          case 3: typeImg = <img height="20" src="/jpg/trad.jpg"/>; break;
          case 4: typeImg = <img height="20" src="/jpg/mixed.jpg"/>; break;
        }
      }
      return (
        <p key={i}>
          <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link> {x.grade} {typeImg}<br/>
          <small style={{color: '#777'}}><Link to={`/area/${x.idArea}`} style={{color: '#777'}}>{x.area}</Link> / <Link to={`/sector/${x.idSector}`} style={{color: '#777'}}>{x.sector}</Link> {x.date}</small>
        </p>
      )
    });

    const latestAscents = this.state.data.ascents.map((x, i) => {
      var typeImg = null;
      if (config.getRegion()==4) {
        switch (x.typeId) {
          case 2: typeImg = <img height="20" src="/jpg/bolt.jpg"/>; break;
          case 3: typeImg = <img height="20" src="/jpg/trad.jpg"/>; break;
          case 4: typeImg = <img height="20" src="/jpg/mixed.jpg"/>; break;
        }
      }
      return (
        <p key={i}>
          <Link to={`/problem/${x.idProblem}`}>{x.problem}</Link> {x.grade} {typeImg}<br/>
          <small style={{color: '#777'}}><Link to={`/user/${x.idUser}`} style={{color: '#777'}}>{x.user}</Link> {x.date}</small>
        </p>
      )
    });

    const newestMedia = this.state.data.medias.map((x, i) => {
      const icon = x.type === 'image'? <i className="fa fa-camera"/> : <i className="fa fa-video-camera"/>;
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
      <Grid>
        <Row>
          <Well style={{textAlign: 'center'}}>
            Total: {this.state.data.numProblems} | With coordinates: {this.state.data.numProblemsWithCoordinates} | Public ascents: {this.state.data.numTicks} | Images: {this.state.data.numImages} | Ascents on video: {this.state.data.numMovies}
          </Well>
        </Row>
        <Row>
          <Col xs={8} md={9} style={{paddingLeft: '3px', paddingRight: '3px'}}>
            <ImageBox data={this.state.data.randomMedia}/>
          </Col>
          <Col xs={4} md={3} style={{paddingLeft: '3px', paddingRight: '3px'}}>
            <LinkBox/>
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
    );
  }
}
