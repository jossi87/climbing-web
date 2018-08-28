import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Well, FormGroup, MenuItem, ButtonGroup, Button, DropdownButton, Alert, Breadcrumb } from 'react-bootstrap';
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getImageUrl, postProblemSvg } from '../api';
import { parseReadOnlySvgs } from '../utils/svg';
import { LockSymbol } from './common/lock-symbol/lock-symbol';

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
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
      document.addEventListener("keyup", this.handleKeyUp.bind(this));
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
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
      document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    }
  }

  handleKeyDown(e) {
    if (e.ctrlKey) this.setState({ctrl: true});
  };

  handleKeyUp(e) {
    if (!e.ctrlKey) this.setState({ctrl: false});
  };

  setHasAnchor(anchor) {
    this.setState({hasAnchor: anchor});
  }

  onCancel() {
    window.history.back();
  }

  save(event) {
    event.preventDefault();
    postProblemSvg(this.props.auth.getAccessToken(), this.state.id, this.state.mediaId, this.state.points.length<2, this.state.svgId, this.generatePath(), this.state.hasAnchor)
    .then((response) => {
      this.setState({pushUrl: "/problem/" + this.state.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  cancelDragging(e) {
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

  addPoint(e) {
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

  handleMouseMove(e) {
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

  setDraggedPoint(index) {
    if (!this.state.ctrl) {
      this.setState({activePoint: index, draggedPoint: true});
    }
  };

  setDraggedCubic(index, anchor) {
    if (!this.state.ctrl) {
      this.setState({activePoint: index, draggedCubic: anchor});
    }
  };

  setPointType(v) {
    const points = this.state.points;
    const active = this.state.activePoint;
    if (active !== 0) { // not the first point
      switch (v) {
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

  removeActivePoint(e) {
    let points = this.state.points;
    let active = this.state.activePoint;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      this.setState({points, activePoint: points.length-1});
    }
  };

  reset(e) {
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
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    } else if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.state.metadata.isAdmin) {
      this.setState({pushUrl: "/login", error: null});
    }

    var circles = this.state.points.map((p, i, a) => {
      var anchors = [];
      if (p.c) {
        anchors.push(
          <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[0].x} cy={p.c[0].y} r={0.003*this.state.w} onMouseDown={this.setDraggedCubic.bind(this, i, 0)}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[1].x} cy={p.c[1].y} r={0.003*this.state.w} onMouseDown={this.setDraggedCubic.bind(this, i, 1)}/>
          </g>
        );
      }
      return (
        <g key={i} className={"buldreinfo-svg-ring-group" + (this.state.activePoint === i ? "  is-active" : "")}>
          {anchors}
          <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.x} cy={p.y} r={0.003*this.state.w} onMouseDown={this.setDraggedPoint.bind(this, i)}/>
        </g>
      );
    });
    const path = this.generatePath();
    return (
      <React.Fragment>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${this.state.areaId}`}>{this.state.areaName}</Link> <LockSymbol visibility={this.state.areaVisibility}/> / <Link to={`/sector/${this.state.sectorId}`}>{this.state.sectorName}</Link> <LockSymbol visibility={this.state.sectorVisibility}/> / <Link to={`/problem/${this.state.id}`}>{this.state.nr} {this.state.name} {this.state.grade}</Link> <LockSymbol visibility={this.state.visibility}/>
        </Breadcrumb>
        <Well bsSize="small" onMouseUp={this.cancelDragging.bind(this)} onMouseLeave={this.cancelDragging.bind(this)}>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsInfo">
              <Alert bsStyle="info">
                <center>
                  <strong>CTRL + CLICK</strong> to add a point | <strong>CLICK</strong> to select a point | <strong>CLICK AND DRAG</strong> to move a point<br/>
                  <ButtonGroup>
                    {this.state.activePoint !== 0 && (
                      <DropdownButton title={!!this.state.points[this.state.activePoint].c? "Selected point: Curve to" : "Selected point: Line to"} id="bg-nested-dropdown">
                        <MenuItem eventKey="0" onSelect={this.setPointType.bind(this, "L")}>Selected point: Line to</MenuItem>
                        <MenuItem eventKey="1" onSelect={this.setPointType.bind(this, "C")}>Selected point: Curve to</MenuItem>
                      </DropdownButton>
                    )}
                    {this.state.activePoint !== 0 && (
                      <Button onClick={this.removeActivePoint.bind(this)}>Remove this point</Button>
                    )}
                    <DropdownButton title={this.state.hasAnchor === true? "Route has anchor" : "No anchor on route"} disabled={this.state.points.length===0} id="bg-nested-dropdown">
                      <MenuItem eventKey="0" onSelect={this.setHasAnchor.bind(this, false)}>No anchor on route</MenuItem>
                      <MenuItem eventKey="1" onSelect={this.setHasAnchor.bind(this, true)}>Route has anchor</MenuItem>
                    </DropdownButton>
                    <Button bsStyle="warning" disabled={this.state.points.length===0} onClick={this.reset.bind(this)}>Reset path</Button>
                    <Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button>
                    <Button type="submit" bsStyle="success">{this.state.points.length>=2? 'Save' : 'Delete path'}</Button>
                  </ButtonGroup>
                </center>
              </Alert>
            </FormGroup>
            <FormGroup controlId="formControlsImage">
              <svg viewBox={"0 0 " + this.state.w + " " + this.state.h} onClick={this.addPoint.bind(this)} onMouseMove={this.handleMouseMove.bind(this)}>
                <image ref="buldreinfo-svg-edit-img" xlinkHref={getImageUrl(this.state.mediaId, null)} width="100%" height="100%"/>
                {parseReadOnlySvgs(this.state.readOnlySvgs, this.state.w, this.state.h)}
                <path className="buldreinfo-svg-route" d={path} strokeWidth={0.002*this.state.w}/>
                {circles}
              </svg>
            </FormGroup>
            <FormGroup controlId="formControlsPath">
              {path}
            </FormGroup>
          </form>
        </Well>
      </React.Fragment>
    )
  }
}

export default SvgEdit;
