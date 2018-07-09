import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { Well, FormGroup, MenuItem, ButtonGroup, Button, DropdownButton, Alert, Breadcrumb } from 'react-bootstrap';
import {parseSVG, makeAbsolute} from 'svg-path-parser';
import config from '../../../utils/config.js';
import Request from 'superagent';
import { Redirect } from 'react-router';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faLock, faUserSecret } from '@fortawesome/fontawesome-free-solid';

export default class SvgEdit extends Component {
  componentDidMount() {
    document.title=config.getTitle("Problem edit (SVG)");
    Request.get(config.getUrl("problems?regionId=" + config.getRegion() + "&id=" + this.props.match.params.problemId)).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        const m = res.body[0].media.filter(x => x.id==this.props.match.params.mediaId)[0];
        const readOnlySvgs = [];
        var svgId = 0;
        var points = [];
        if (m.svgs) {
          for (let svg of m.svgs) {
            if (svg.problemId===res.body[0].id) {
              svgId = svg.id;
              points = this.parsePath(svg.path);
            }
            else {
              readOnlySvgs.push({ nr: svg.nr, hasAnchor: svg.hasAnchor, path: svg.path });
            }
          }
        }
        this.setState({
          mediaId: m.id,
          nr: res.body[0].nr,
          w: m.width,
          h: m.height,
          ctrl: false,
          svgId: svgId,
          points: points,
          readOnlySvgs: readOnlySvgs,
          activePoint: 0,
          draggedPoint: false,
          draggedCubic: false,
          hasAnchor: true,
          areaId: res.body[0].areaId,
          areaName: res.body[0].areaName,
          areaVisibility: res.body[0].areaVisibility,
          sectorId: res.body[0].sectorId,
          sectorName: res.body[0].sectorName,
          sectorVisibility: res.body[0].sectorVisibility,
          id: res.body[0].id,
          name: res.body[0].name,
          grade: res.body[0].grade,
          visibility: res.body[0].visibility
        });
      }
    });
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
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
    Request.post(config.getUrl("problems/svg?problemId=" + this.state.id + "&mediaId=" + this.state.mediaId))
    .withCredentials()
    .send({delete: this.state.points.length<2, id: this.state.svgId, path: this.generatePath(), hasAnchor: this.state.hasAnchor})
    .end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({pushUrl: "/problem/" + this.state.id});
      }
    });
  }

  cancelDragging(e) {
    this.setState({
      draggedPoint: false,
      draggedCubic: false
    });
  }

  getMouseCoords(e) {
    const dim = this.refs["buldreinfo-svg-edit-img"].getBoundingClientRect();
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

  parseReadOnlySvgs() {
    const shapes = [];
    for (let svg of this.state.readOnlySvgs) {
      shapes.push(<path key={shapes.length} d={svg.path} className="buldreinfo-svg-opacity buldreinfo-svg-route" strokeWidth={0.003*this.state.w} strokeDasharray={0.006*this.state.w}/>);
      const commands = parseSVG(svg.path);
      makeAbsolute(commands); // Note: mutates the commands in place!
      shapes.push(this.generateSvgNrAndAnchor(commands, svg.nr, svg.hasAnchor));
    }
    return shapes;
  }

  generateSvgNrAndAnchor(path, nr, hasAnchor) {
    var ixNr;
    var maxY = 0;
    var ixAnchor;
    var minY = 99999999;
    for (var i=0, len=path.length; i < len; i++) {
      if (path[i].y > maxY) {
        ixNr = i;
        maxY = path[i].y;
      }
      if (path[i].y < minY) {
        ixAnchor = i;
        minY = path[i].y;
      }
    }
    var x = path[ixNr].x;
    var y = path[ixNr].y;
    const r = 0.012*this.state.w;
    if (x < r) x = r;
    if (x > (this.state.w-r)) x = this.state.w-r;
    if (y < r) y = r;
    if (y > (this.state.h-r)) y = this.state.h-r;
    var anchor = null;
    if (hasAnchor === true) {
      anchor = <circle className="buldreinfo-svg-ring" cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.006*this.state.w}/>
    }
    return (
      <g className="buldreinfo-svg-opacity">
        <circle className="buldreinfo-svg-ring" cx={x} cy={y} r={r}/>
        <text className="buldreinfo-svg-routenr" x={x} y={y} fontSize={0.02*this.state.w}>{nr}</text>
        {anchor}
      </g>
    );
  }

  parsePath(d) {
    if (d) {
      const commands = parseSVG(d);
      makeAbsolute(commands); // Note: mutates the commands in place!
      return commands.map(c => {
        switch (c.code) {
          case "L": case "M": return { x: Math.round(c.x), y: Math.round(c.y) };
          case "C": return { x: Math.round(c.x), y: Math.round(c.y), c: [{x: Math.round(c.x1), y: Math.round(c.y1)}, {x: Math.round(c.x2), y: Math.round(c.y2)}] };
          case "S": return { x: Math.round(c.x), y: Math.round(c.y), c: [{x: Math.round(c.x0), y: Math.round(c.y0)}, {x: Math.round(c.x2), y: Math.round(c.y2)}] };
        }
      });
    }
    return [];
  }

  render() {
    if (!this.state) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    else if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }

    var circles = this.state.points.map((p, i, a) => {
      var anchors = [];
      if (p.c) {
        anchors.push(
          <g className="buldreinfo-svg-edit-opacity">
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <line className="buldreinfo-svg-pointer buldreinfo-svg-route" x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.0026*this.state.w} strokeDasharray={0.003*this.state.w}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[0].x} cy={p.c[0].y} r={0.003*this.state.w} onMouseDown={this.setDraggedCubic.bind(this, i, 0)}/>
            <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.c[1].x} cy={p.c[1].y} r={0.003*this.state.w} onMouseDown={this.setDraggedCubic.bind(this, i, 1)}/>
          </g>
        );
      }
      return (
        <g className={"buldreinfo-svg-ring-group" + (this.state.activePoint === i ? "  is-active" : "")}>
          {anchors}
          <circle className="buldreinfo-svg-pointer buldreinfo-svg-ring" cx={p.x} cy={p.y} r={0.003*this.state.w} onMouseDown={this.setDraggedPoint.bind(this, i)}/>
        </g>
      );
    });
    const path = this.generatePath();
    return (
      <span>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${this.state.areaId}`}>{this.state.areaName}</Link> {this.state.areaVisibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.areaVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / <Link to={`/sector/${this.state.sectorId}`}>{this.state.sectorName}</Link> {this.state.sectorVisibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.sectorVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / <Link to={`/problem/${this.state.id}`}>{this.state.nr} {this.state.name} {this.state.grade}</Link> {this.state.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
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
                <image ref="buldreinfo-svg-edit-img" xlinkHref={config.getUrl(`images?id=${this.state.mediaId}`)} width="100%" height="100%"/>
                {this.parseReadOnlySvgs()}
                <path className="buldreinfo-svg-route" d={path} strokeWidth={0.002*this.state.w}/>
                {circles}
              </svg>
            </FormGroup>
            <FormGroup controlId="formControlsPath">
              {path}
            </FormGroup>
          </form>
        </Well>
      </span>
    )
  }
}
