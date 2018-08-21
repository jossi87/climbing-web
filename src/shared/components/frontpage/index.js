import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Table, Grid, Well, Row, Col, Clearfix } from 'react-bootstrap';
import TextBox from './textbox/textbox';
import ImageBox from './imagebox/imagebox';
import LinkBox from './linkbox/linkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const style = {padding: 0, textAlign: 'left'};
const styleNw = {padding: 0, textAlign: 'left', whiteSpace: 'nowrap'};

class Index extends Component {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  render() {
    if (!this.state || !this.state.data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
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
      <React.Fragment>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data.metadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={this.state.data.metadata.description} />
          <meta property="og:url" content={this.state.data.metadata.og.url} />
          <meta property="og:title" content={this.state.data.metadata.title} />
          <meta property="og:image" content={this.state.data.metadata.og.image} />
          <meta property="og:image:width" content={this.state.data.metadata.og.imageWidth} />
          <meta property="og:image:height" content={this.state.data.metadata.og.imageHeight} />
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
      </React.Fragment>
    );
  }
}

export default Index;
