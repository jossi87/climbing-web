import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { Container, Form, Button, Message, Dropdown } from 'semantic-ui-react';
import { getImageUrl, postProblemSvg } from '../api';
import { parseReadOnlySvgs } from '../utils/svg';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';

class SvgEdit extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    if (data) {
      this.state = {
        mediaId : data.mediaId,
        nr: data.nr,
        w: data.w,
        h: data.h,
        ctrl: data.ctrl,
        svgId: data.svgId,
        points: data.points,
        readOnlySvgs: data.readOnlySvgs,
        activePoint: data.activePoint,
        draggedPoint: data.draggedPoint,
        draggedCubic: data.draggedCubic,
        hasAnchor: data.hasAnchor,
        areaId: data.areaId,
        areaName: data.areaName,
        areaVisibility: data.areaVisibility,
        sectorId: data.sectorId,
        sectorName: data.sectorName,
        sectorVisibility: data.sectorVisibility,
        id: data.id,
        name: data.name,
        grade: data.grade,
        visibility: data.visibility,
        metadata: data.metadata
      };
    }
  }

  componentDidMount() {
    if (!this.state || !this.state.id) {
      this.refresh(this.props.match.params.problemIdMediaId);
    }
    if (document) {
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.problemIdMediaId !== this.props.match.params.problemIdMediaId) {
      this.refresh(this.props.match.params.problemIdMediaId);
    }
  }

  refresh(problemIdMediaId) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), problemIdMediaId).then((data) => this.setState(() => ({
      mediaId : data.mediaId,
      nr: data.nr,
      w: data.w,
      h: data.h,
      ctrl: data.ctrl,
      svgId: data.svgId,
      points: data.points,
      readOnlySvgs: data.readOnlySvgs,
      activePoint: data.activePoint,
      draggedPoint: data.draggedPoint,
      draggedCubic: data.draggedCubic,
      hasAnchor: data.hasAnchor,
      areaId: data.areaId,
      areaName: data.areaName,
      areaVisibility: data.areaVisibility,
      sectorId: data.sectorId,
      sectorName: data.sectorName,
      sectorVisibility: data.sectorVisibility,
      id: data.id,
      name: data.name,
      grade: data.grade,
      visibility: data.visibility,
      metadata: data.metadata
    })));
  }

  componentWillUnmount() {
    if (document) {
      document.removeEventListener("keydown", this.handleKeyDown);
      document.removeEventListener("keyup", this.handleKeyUp);
    }
  }

  handleKeyDown = (e) => {
    if (e.ctrlKey) this.setState({ctrl: true});
  };

  handleKeyUp = (e) => {
    if (!e.ctrlKey) this.setState({ctrl: false});
  };

  setHasAnchor = (e, { value }) => {
    this.setState({hasAnchor: value});
  }

  onCancel = () => {
    window.history.back();
  }

  save = (event) => {
    event.preventDefault();
    postProblemSvg(this.props.auth.getAccessToken(), this.state.id, this.state.mediaId, this.state.points.length<2, this.state.svgId, this.generatePath(), this.state.hasAnchor)
    .then((response) => {
      this.props.history.push("/problem/" + this.state.id);
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  cancelDragging = (e) => {
    this.setState({
      draggedPoint: false,
      draggedCubic: false
    });
  }

  getMouseCoords(e) {
    const dim = (this.refs["buldreinfo-svg-edit-img"] as any).getBoundingClientRect();
    const dx = this.state.w/dim.width;
    const dy = this.state.h/dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    return {x, y};
  };

  addPoint = (e) => {
    if (this.state.ctrl) {
      let coords = this.getMouseCoords(e);
      let points = this.state.points;
      points.push(coords);
      this.setState({
        points,
        activePoint: points.length - 1
      });
    }
  };

  generatePath() {
    var d = "";
    this.state.points.forEach((p, i) => {
      if (i === 0) { // first point
        d += "M ";
      } else if (p.q) { // quadratic
        d += `Q ${ p.q.x } ${ p.q.y } `;
      } else if (p.c) { // cubic
        d += `C ${ p.c[0].x } ${ p.c[0].y } ${ p.c[1].x } ${ p.c[1].y } `;
      } else if (p.a) { // arc
        d += `A ${ p.a.rx } ${ p.a.ry } ${ p.a.rot } ${ p.a.laf } ${ p.a.sf } `;
      } else {
        d += "L ";
      }
      d += `${ p.x } ${ p.y } `;
    })
    return d;
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    if (!this.state.ctrl) {
      if (this.state.draggedPoint) {
        this.setPointCoords(this.getMouseCoords(e));
      } else if (this.state.draggedCubic !== false) {
        this.setCubicCoords(this.getMouseCoords(e), this.state.draggedCubic);
      }
    }
    return false;
  };

  setPointCoords(coords) {
    const points = this.state.points;
    const active = this.state.activePoint;
    points[active].x = coords.x;
    points[active].y = coords.y;
    this.setState({points});
  };

  setCubicCoords(coords, anchor) {
    const points = this.state.points;
    const active = this.state.activePoint;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    this.setState({ points });
  };

  setDraggedPoint = (index) => {
    if (!this.state.ctrl) {
      this.setState({activePoint: index, draggedPoint: true});
    }
  };

  setDraggedCubic = (index, anchor) => {
    if (!this.state.ctrl) {
      this.setState({activePoint: index, draggedCubic: anchor});
    }
  };

  setPointType = (e, { value }) => {
    const points = this.state.points;
    const active = this.state.activePoint;
    if (active !== 0) { // not the first point
      switch (value) {
        case "L":
          points[active] = {x: points[active].x, y: points[active].y};
          break;
        case "C":
          points[active] = {
            x: points[active].x,
            y: points[active].y,
            c: [
                {
                  x: (points[active].x + points[active - 1].x - 50) / 2,
                  y: (points[active].y + points[active - 1].y) / 2
                },
                {
                  x: (points[active].x + points[active - 1].x + 50) / 2,
                  y: (points[active].y + points[active - 1].y) / 2
                }
            ]
          };
        break;
      }
      this.setState({points});
    }
  };

  removeActivePoint = (e) => {
    let points = this.state.points;
    let active = this.state.activePoint;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      this.setState({points, activePoint: points.length-1});
    }
  };

  reset = (e) => {
    this.setState({
      ctrl: false,
      points: [],
      activePoint: 0,
      draggedPoint: false,
      draggedCubic: false,
      hasAnchor: false
    });
  };

  render() {
    if (!this.state || !this.state.id) {
      return <LoadingAndRestoreScroll />;
    } else if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (!this.state.metadata.isAdmin) {
      this.props.history.push("/login");
    }

    var circles = this.state.points.map((p, i, a) => {
      var anchors = [];
      if (p.c) {
        anchors.push(
          <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[0].x} cy={p.c[0].y} r={0.003*this.state.w} onMouseDown={() => this.setDraggedCubic(i, 0)}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[1].x} cy={p.c[1].y} r={0.003*this.state.w} onMouseDown={() => this.setDraggedCubic(i, 1)}/>
          </g>
        );
      }
      return (
        <g key={i} className={"buldreinfo-svg-ring-group" + (this.state.activePoint === i ? "  is-active" : "")}>
          {anchors}
          <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.x} cy={p.y} r={0.003*this.state.w} onMouseDown={() => this.setDraggedPoint(i)}/>
        </g>
      );
    });
    const path = this.generatePath();
    return (
      <Container onMouseUp={this.cancelDragging} onMouseLeave={this.cancelDragging}>
        <Form>
          <Form.Group>
            <Message>
              <Message.Content>
                <strong>CTRL + CLICK</strong> to add a point | <strong>CLICK</strong> to select a point | <strong>CLICK AND DRAG</strong> to move a point<br/>
                <Dropdown selection value={this.state.hasAnchor} disabled={this.state.points.length===0} onChange={this.setHasAnchor} options={[
                  {key: 1, value: false, text: 'No anchor on route'},
                  {key: 2, value: true, text: 'Route has anchor'}
                ]}/>
                {this.state.activePoint !== 0 && (
                  <Dropdown selection value={!!this.state.points[this.state.activePoint].c? "C" : "L"} onChange={this.setPointType} options={[
                    {key: 1, value: "L", text: 'Selected point: Line to'},
                    {key: 2, value: "C", text: 'Selected point: Curve to'}
                  ]}/>
                )}
                <Button.Group>
                  <Button disabled={this.state.activePoint===0} onClick={this.removeActivePoint}>Remove this point</Button>
                  <Button disabled={this.state.points.length===0} onClick={this.reset}>Reset path</Button>
                  <Button negative onClick={this.onCancel}>Cancel</Button>
                  <Button positive onClick={this.save}>{this.state.points.length>=2? 'Save' : 'Delete path'}</Button>
                </Button.Group>
              </Message.Content>
            </Message>
          </Form.Group>
          <Form.Group>
            <svg viewBox={"0 0 " + this.state.w + " " + this.state.h} onClick={this.addPoint} onMouseMove={this.handleMouseMove} width="100%" height="100%">
              <image ref="buldreinfo-svg-edit-img" xlinkHref={getImageUrl(this.state.mediaId)} width="100%" height="100%"/>
              {parseReadOnlySvgs(this.state.readOnlySvgs, this.state.w, this.state.h)}
              <path className="buldreinfo-svg-route" d={path} strokeWidth={0.002*this.state.w}/>
              {circles}
            </svg>
          </Form.Group>
          <Form.Group>
            {path}
          </Form.Group>
        </Form>
      </Container>
    )
  }
}

export default withRouter(SvgEdit);
