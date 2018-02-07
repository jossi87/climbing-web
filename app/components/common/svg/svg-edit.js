import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Well, FormGroup, MenuItem, ButtonGroup, Button, DropdownButton, Alert } from 'react-bootstrap';
import {parseSVG, makeAbsolute} from 'svg-path-parser';
import config from '../../../utils/config.js';

export default class SvgEdit extends Component {
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    document.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    const points = []; // this.parsePath("M1337.2489,154.67413c-10.081575,60.867134-33.125175,669.53845-36.005627,738.2825c-2.88045,68.74406-53.288326,1019.7034-56.168777,1050.4951");
    const svgs = [
      {nr:"1",hasAnchor:true,path:"M0.0,1232.3805c53.288326-134.62376,173.54712-342.28812,196.59071-385.96924c23.0436-42.965034,36.005627-129.61119,226.83545-200.5035c191.54993-70.8923,352.13504-167.56363,545.84534-202.65173c193.71027-35.804195,403.263-106.6965,446.46976-121.73427c43.20675-15.037762,484.63574-159.6867,484.63574-159.6867"},
      {nr:"2",hasAnchor:true,path:"M554.48663,1920.5371c30.96484-152.52586,102.255974-654.50073,107.29676-725.393c5.0407877-70.8923,86.4135-481.9245,102.255974-560.6937c15.122362-78.769226,56.168777-363.05453,56.168777-363.05453"},
      {nr:"3",hasAnchor:false,path:"M1337.2489,154.67413c-10.081575,60.867134-33.125175,669.53845-36.005627,738.2825c-2.88045,68.74406-53.288326,1019.7034-56.168777,1050.4951"},
      {nr:"4",hasAnchor:false,path:"M1684.3431,1925.5496c-30.96484-136.77203-104.41631-887.94403-104.41631-920.884c0.0-32.939857-46.0872-580.744-58.329117-621.56085c-12.962025-40.81678-23.0436-246.33287-23.0436-246.33287"},
      {nr:"5",hasAnchor:true,path:"M1667.0604,154.67413c23.0436,60.867134,193.71027,842.1147,198.75105,923.7482c5.0407877,80.91748,186.50914,890.8084,193.71027,918.73566"},
      {nr:"6",hasAnchor:false,path:"M2575.1223,1910.5117c-51.127987-149.66153-352.13504-971.7258-372.2982-1017.5553c-20.16315-45.829372-150.50351-363.05453-158.42476-408.16782c-7.921238-45.829372-109.4571-289.2979-112.337555-299.32306"},
      {nr:"7",hasAnchor:true,path:"M2424.619,403.15524c33.125175,40.81678,181.46835,370.2154,196.59071,401.007s370.13785,875.0545,398.22223,907.99445"},
      {nr:"99",hasAnchor:true,path:"M2503.8313,448.98462c56.168777,30.791609,257.80026,162.55106,272.92267,172.57622c15.122362,10.025174,120.2588,85.93007,150.50351,223.41818c30.96484,136.77203,48.247536,211.96085,92.1744,270.67972"}
    ];
    this.setState({
        mediaId: 20264,
        nr: 47,
        w: 3072,
        h: 2048,
        ctrl: false,
        points: points,
        readOnlySvgs: svgs,
        activePoint: 0,
        draggedPoint: false,
        draggedCubic: false,
        hasAnchor: false
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

  toggleAnchor() {
    this.setState({hasAnchor: !this.state.hasAnchor});
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
      shapes.push(<path key={shapes.length} d={svg.path} className="buldreinfo-svg-opacity buldreinfo-svg-route"/>);
      const commands = parseSVG(svg.path);
      makeAbsolute(commands); // Note: mutates the commands in place!
      shapes.push(this.generateSvgNrAndAnchor(commands, svg.nr, svg.hasAnchor, false));
    }
    return shapes;
  }

  generateSvgNrAndAnchor(path, nr, hasAnchor, isNew) {
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
    const r = 45;
    if (x < r) x = r;
    if (x > (this.state.w-r)) x = this.state.w-r;
    if (y < r) y = r;
    if (y > (this.state.h-r)) y = this.state.h-r;
    var anchor = null;
    if (hasAnchor && !isNew) {
      anchor = <circle className="buldreinfo-svg-ring" cx={path[ixAnchor].x} cy={path[ixAnchor].y} r="20"/>
    }
    else if (isNew) {
      anchor = <text className="buldreinfo-svg-routenr" x={path[ixAnchor].x} y={path[ixAnchor].y+70}>{hasAnchor? "With anchor" : "Without anchor"}</text>
    }
    return (
      <g className={isNew? "" : "buldreinfo-svg-opacity"}>
        <circle className="buldreinfo-svg-ring" cx={x} cy={y - (isNew? 70 : 0)} r={r}/>
        <text className="buldreinfo-svg-routenr" x={x} y={y - (isNew? 70 : 0)}>{nr}</text>
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
          case "M": return { x: Math.round(c.x), y: Math.round(c.y) };
          case "C": return { x: Math.round(c.x), y: Math.round(c.y), c: [{x: Math.round(c.x1), y: Math.round(c.y1)}, {x: Math.round(c.x2), y: Math.round(c.y2)}] };
        }
      });
    }
    return [];
  }

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
    const path = this.generatePath();
    return (
      <Well onMouseUp={this.cancelDragging.bind(this)}>
        <form>
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
                  <DropdownButton title={!!this.state.hasAnchor? "Route has anchor" : "No anchor on route"} disabled={this.state.points.length===0} id="bg-nested-dropdown">
                    <MenuItem eventKey="0" onSelect={this.toggleAnchor.bind(this)}>No anchor on route</MenuItem>
                    <MenuItem eventKey="1" onSelect={this.toggleAnchor.bind(this)}>Route has anchor</MenuItem>
                  </DropdownButton>
                  <Button bsStyle="warning" disabled={this.state.points.length===0} onClick={this.reset.bind(this)}>Reset path</Button>
                </ButtonGroup>
              </center>
            </Alert>
          </FormGroup>
          <FormGroup controlId="formControlsImage">
            <svg viewBox={"0 0 " + this.state.w + " " + this.state.h} className="buldreinfo-svg" onClick={this.addPoint.bind(this)} onMouseMove={this.handleMouseMove.bind(this)}>
              <image ref="buldreinfo-svg-edit-img" xlinkHref={config.getUrl(`images?id=${this.state.mediaId}`)} x="0" y="0" width="100%" height="100%"/>
              {this.parseReadOnlySvgs()}
              <path className="buldreinfo-svg-edit-route" d={path} />
              {this.state.points.length>1 && this.generateSvgNrAndAnchor(this.state.points, this.state.nr, this.state.hasAnchor, true)}
              {circles}
            </svg>
          </FormGroup>
          <FormGroup controlId="formControlsPath">
            {path}
          </FormGroup>
        </form>
      </Well>
    )
  }
}
