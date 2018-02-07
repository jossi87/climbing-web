import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Well, FormGroup, FormControl, MenuItem, ButtonToolbar, ButtonGroup, Button, DropdownButton, ControlLabel } from 'react-bootstrap';

export default class SvgEdit extends Component {
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    document.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    this.setState({
        w: 3072,
        h: 2048,
        ctrl: false,
        points: [
            { x: 100, y: 300 },
            { x: 250, y: 700 },
            { x: 1000, y: 600, c: [{ x: 650, y: 650 }, { x: 950, y: 200 }] }
        ],
        activePoint: 2,
        draggedPoint: false,
        draggedCubic: false
    });
  }

  componentWillUnmount() {
    document.removeEventListener("keydown");
    document.removeEventListener("keyup");
  }

  handleKeyDown(e) {
    if (e.ctrlKey) this.setState({ctrl: true});
  };

  handleKeyUp(e) {
    if (!e.ctrlKey) this.setState({ctrl: false});
  };

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
    if (!this.state.ctrl) {
      if (this.state.draggedPoint) {
        this.setPointCoords(this.getMouseCoords(e));
      } else if (this.state.draggedCubic !== false) {
        this.setCubicCoords(this.getMouseCoords(e), this.state.draggedCubic);
      }
    }
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

  render() {
    if (!this.state) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    var circles = this.state.points.map((p, i, a) => {
      var anchors = [];
      if (p.c) {
        anchors.push(
          <g>
            <line className="buldreinfo-svg-edit-anchor-line" x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} />
            <line className="buldreinfo-svg-edit-anchor-line" x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} />
            <circle className="buldreinfo-svg-edit-anchor-point" cx={p.c[0].x} cy={p.c[0].y} r={14} onMouseDown={this.setDraggedCubic.bind(this, i, 0)}/>
            <circle className="buldreinfo-svg-edit-anchor-point" cx={p.c[1].x} cy={p.c[1].y} r={14} onMouseDown={this.setDraggedCubic.bind(this, i, 1)}/>
          </g>
        );
      }
      return (
        <g className={"buldreinfo-svg-edit-circle-group" + (this.state.activePoint === i ? "  is-active" : "")}>
          {anchors}
          <circle className="buldreinfo-svg-edit-circle" cx={p.x} cy={p.y} r={18} onMouseDown={this.setDraggedPoint.bind(this, i)}/>
        </g>
      );
    });

    return (
      <Well onMouseUp={this.cancelDragging.bind(this)}>
        <svg viewBox={"0 0 " + this.state.w + " " + this.state.h} className="buldreinfo-svg" onClick={this.addPoint.bind(this)} onMouseMove={this.handleMouseMove.bind(this)}>
          <image ref="buldreinfo-svg-edit-img" xlinkHref="https://brattelinjer.no/com.buldreinfo.jersey.jaxb/v1/images?id=20264" x="0" y="0" width="100%" height="100%"/>
          <path className="buldreinfo-svg-edit-route" d={this.generatePath()} />
          <g>{circles}</g>
        </svg>
      </Well>
    )
  }
}
