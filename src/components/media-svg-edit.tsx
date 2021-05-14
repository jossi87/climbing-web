import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Label, Icon, Segment, Dropdown } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getMediaSvg, getImageUrl, postMediaSvg } from '../api';
import { parseReadOnlySvgs, parsePath } from '../utils/svg';
import { LoadingAndRestoreScroll, InsufficientPrivileges } from './common/widgets/widgets';
import { useHistory, useParams, useLocation } from 'react-router-dom';

interface MediaIdParams {
  mediaId: number;
}
const SvgEdit = () => {
  const { accessToken, isAuthenticated, loading, loginWithRedirect } = useAuth0();
  const [data, setData] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [activeElementIndex, setActiveElementIndex] = useState(-1);
  const [ctrl, setCtrl] = useState(false);
  const [activePoint, setActivePoint] = useState(null);
  const [draggedPoint, setDraggedPoint] = useState(null);
  const [draggedCubic, setDraggedCubic] = useState(false);
  const imageRef = useRef(null);
  let { mediaId } = useParams<MediaIdParams>();
  let history = useHistory();
  let location = useLocation();
  useEffect(() => {
    if (mediaId && accessToken) {
      getMediaSvg(accessToken, mediaId).then((data) => {
        setData(data);
      });
    }
  }, [accessToken, mediaId]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    }
  }, []);

  function handleKeyDown(e) {
    if (e.ctrlKey) setCtrl(true);
  };

  function handleKeyUp(e) {
    if (!e.ctrlKey) setCtrl(false);
  };

  function save(event) {
    event.preventDefault();
    postMediaSvg(accessToken, data)
    .then(() => {
      history.goBack();
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function cancelDragging(e) {
    setDraggedPoint(false);
    setDraggedCubic(false);
  }

  function getMouseCoords(e) {
    const dim = imageRef.current.getBoundingClientRect();
    const dx = data.m.width/dim.width;
    const dy = data.m.height/dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    return {x, y};
  };

  function handleOnClick(e) {
    if (ctrl) {
      let coords = getMouseCoords(e);
      let points = data.m.mediaSvgs[activeElementIndex].points
      points.push(coords);
      const p = generatePath(points);
      data.m.mediaSvgs[activeElementIndex].path = p;
      data.m.mediaSvgs[activeElementIndex].points = points;
      setData(data);
      setActivePoint(points.length - 1);
      setForceUpdate(forceUpdate+1);
    }
    else if (activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex].t==='RAPPEL') {
      let coords = getMouseCoords(e);
      data.m.mediaSvgs[activeElementIndex].rappelX = coords.x;
      data.m.mediaSvgs[activeElementIndex].rappelY = coords.y;
      setData(data);
      setForceUpdate(forceUpdate+1);
    }
  };

  function generatePath(points) {
    var d = "";
    points.forEach((p, i) => {
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

  function handleMouseMove(e) {
    e.preventDefault();
    if (!ctrl) {
      if (draggedPoint) {
        setPointCoords(getMouseCoords(e));
      } else if (draggedCubic !== false) {
        setCubicCoords(getMouseCoords(e), draggedCubic);
      }
    }
    return false;
  };

  function setPointCoords(coords) {
    const active = activePoint;
    let points = data.m.mediaSvgs[activeElementIndex].points;
    points[active].x = coords.x;
    points[active].y = coords.y;
    const p = generatePath(points);
    data.m.mediaSvgs[activeElementIndex].path = p;
    data.m.mediaSvgs[activeElementIndex].points = points;
    setData(data);
    setForceUpdate(forceUpdate+1);
  };

  function setCubicCoords(coords, anchor) {
    const active = activePoint;
    let points = data.m.mediaSvgs[activeElementIndex].points;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    const p = generatePath(points);
    data.m.mediaSvgs[activeElementIndex].path = p;
    data.m.mediaSvgs[activeElementIndex].points = points;
    setData(data);
    setForceUpdate(forceUpdate+1);
  };

  function setCurrDraggedPoint(index) {
    if (!ctrl) {
      setActivePoint(index);
      setDraggedPoint(true);
    }
  };

  function setCurrDraggedCubic(index, anchor) {
    if (!ctrl) {
      setActivePoint(index);
      setDraggedCubic(anchor);
    }
  };

  function setPointType(e, { value }) {
    const active = activePoint;
    let points = data.m.mediaSvgs[activeElementIndex].points;
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
      const p = generatePath(points);
      data.m.mediaSvgs[activeElementIndex].path = p;
      data.m.mediaSvgs[activeElementIndex].points = points;
      setData(data);
      setForceUpdate(forceUpdate+1);
    }
  };

  function removeActivePoint(e) {
    let active = activePoint;
    let points = data.m.mediaSvgs[activeElementIndex].points;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      const p = generatePath(points);
      data.m.mediaSvgs[activeElementIndex].path = p;
      data.m.mediaSvgs[activeElementIndex].points = points;
      setActivePoint(data.m.mediaSvgs[activeElementIndex].points.length-1);
      setData(data);
    }
  };

  function reset(e) {
    data.m.mediaSvgs = [];
    setData(data);
    setActiveElementIndex(-1);
    setCtrl(false);
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
  };

  if (loading || (isAuthenticated && !data)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }

  const circles = activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex] && data.m.mediaSvgs[activeElementIndex].t==='PATH' && data.m.mediaSvgs[activeElementIndex].points.map((p, i, a) => {
    var anchors = [];
    if (p.c) {
      anchors.push(
        <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: "#E2011A"}} x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.0026*data.m.width} strokeDasharray={0.003*data.m.width}/>
          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: "#E2011A"}} x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.0026*data.m.width} strokeDasharray={0.003*data.m.width}/>
          <circle className={"buldreinfo-svg-pointer"} fill="#E2011A" cx={p.c[0].x} cy={p.c[0].y} r={0.003*data.m.width} onMouseDown={() => setCurrDraggedCubic(i, 0)}/>
          <circle className={"buldreinfo-svg-pointer"} fill="#E2011A" cx={p.c[1].x} cy={p.c[1].y} r={0.003*data.m.width} onMouseDown={() => setCurrDraggedCubic(i, 1)}/>
        </g>
      );
    }
    return (
      <g key={i}>
        {anchors}
        <circle className={"buldreinfo-svg-pointer"} fill="#FF0000" cx={p.x} cy={p.y} r={0.003*data.m.width} onMouseDown={() => setCurrDraggedPoint(i)}/>
      </g>
    );
  });

  let rappels = null;
  if (activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex] && data.m.mediaSvgs[activeElementIndex].t==='RAPPEL') {
    const x = data.m.mediaSvgs[activeElementIndex].rappelX;
    const y = data.m.mediaSvgs[activeElementIndex].rappelY;
    const strokeWidth = 0.0026*data.m.width;
    const r = 0.01*data.m.height;
    rappels = (
      <g strokeLinecap="round">
        <circle cx={x} cy={y} r={r} fill="none" strokeWidth={strokeWidth} stroke="red" />
        <line x1={x-r} y1={y} x2={x+r} y2={y} strokeWidth={strokeWidth} stroke="red" />
        <line x1={x} y1={y+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke="red" />
        <line x1={x-r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke="red" />
        <line x1={x+r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke="red" />
      </g>
    );
  }

  return (
    <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <Segment style={{minHeight: '130px'}}>
        <Button.Group floated="right">
          <Button negative disabled={!data.m.mediaSvgs || data.m.mediaSvgs.length===0} onClick={reset}>Reset</Button>
          <Button.Or />
          <Button onClick={() => history.goBack()}>Cancel</Button>
          <Button.Or />
          <Button positive onClick={save}>Save</Button>
        </Button.Group>
        <Button.Group size="mini">
          <Button size="mini" onClick={() => {
            let element = {t: "PATH", id: -1, path: "", points: []};
            if (!data.m.mediaSvgs) {
              data.m.mediaSvgs = [];
            }
            data.m.mediaSvgs.push(element);
            setData(data);
            setActiveElementIndex(data.m.mediaSvgs.length-1);
            setActivePoint(0);
            setDraggedPoint(false);
            setDraggedCubic(false);
          }}>Add descent</Button>
          <Button.Or />
          <Button size="mini" onClick={() => {
            let element = {t: "RAPPEL", id: -1, rappelX: data.m.width/2, rappelY: data.m.height/2};
            if (!data.m.mediaSvgs) {
              data.m.mediaSvgs = [];
            }
            data.m.mediaSvgs.push(element);
            setData(data);
            setActiveElementIndex(data.m.mediaSvgs.length-1);
            setActivePoint(0);
            setDraggedPoint(false);
            setDraggedCubic(false);
          }}>Add rappel</Button>
        </Button.Group>
        <Label.Group>
          {data.m.mediaSvgs && data.m.mediaSvgs.map((svg, index) => (
            <Label as="a" image key={index} color={activeElementIndex===index? "green" : "grey"} onClick={() => {
              if (svg.t==='PATH' && !data.m.mediaSvgs[index].points) {
                data.m.mediaSvgs[index].points = parsePath(data.m.mediaSvgs[index].path);
                setData(data);
              }
              setActiveElementIndex(index);
              setActivePoint(0);
              setDraggedPoint(false);
              setDraggedCubic(false);
            }}>
              {svg.t} #{svg.id}
              <Icon name='delete' onClick={() => {
                data.m.mediaSvgs.splice(index, 1);
                setData(data);
                setActiveElementIndex(-1);
                setActivePoint(0);
                setDraggedPoint(false);
                setDraggedCubic(false);
              }}/>
            </Label>
          ))}
        </Label.Group>
        <br/>
        {activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex] && data.m.mediaSvgs[activeElementIndex].t==='PATH' && (
          <>
            <strong>CTRL + CLICK</strong> to add a point | <strong>CLICK</strong> to select a point | <strong>CLICK AND DRAG</strong> to move a point<br/>
            {activePoint !== 0 && (
              <Dropdown selection value={!!data.m.mediaSvgs[activeElementIndex].points[activePoint].c? "C" : "L"} onChange={setPointType} options={[
                {key: 1, value: "L", text: 'Selected point: Line to'},
                {key: 2, value: "C", text: 'Selected point: Curve to'}
              ]}/>
            )}
            {activePoint !== 0 && <Button disabled={activePoint===0} onClick={removeActivePoint}>Remove this point</Button>}
          </>
        )}
        {activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex] && data.m.mediaSvgs[activeElementIndex].t==='RAPPEL' && (
          <><strong>CLICK</strong> to move anchor</>
        )}
      </Segment>
      <svg viewBox={"0 0 " + data.m.width + " " + data.m.height} onClick={handleOnClick} onMouseMove={handleMouseMove} width="100%" height="100%">
        <image ref={imageRef} xlinkHref={getImageUrl(data.m.id, null)} width="100%" height="100%"/>
        {activeElementIndex>=0 && data.m.mediaSvgs[activeElementIndex] && <path style={{fill: "none", stroke: "#FF0000"}} d={data.m.mediaSvgs[activeElementIndex].path} strokeWidth={0.002*data.m.width}/>}
        {circles}
        {rappels}
        {data.m.mediaSvgs && parseReadOnlySvgs(data.m.mediaSvgs.filter((svg, index) => index!=activeElementIndex), data.m.width, data.m.height)}
      </svg>
    </Container>
  )
}

export default SvgEdit;