import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Segment, Dropdown, Input } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSvgEdit, getImageUrl, postProblemSvg } from '../api';
import { parseReadOnlySvgs, parsePath } from '../utils/svg-utils';
import { LoadingAndRestoreScroll, InsufficientPrivileges } from './common/widgets/widgets';
import { useHistory, useParams, useLocation } from 'react-router-dom';

interface ProblemIdMediaIdParams {
  problemIdMediaId: string;
}
const SvgEdit = () => {
  const { accessToken, isAuthenticated, loading, loginWithRedirect } = useAuth0();
  const [mediaId, setMediaId] = useState(null);
  const [crc32, setCrc32] = useState(null);
  const [w, setW] = useState(null);
  const [h, setH] = useState(null);
  const [ctrl, setCtrl] = useState(false);
  const [svgId, setSvgId] = useState(null);
  const [path, setPath] = useState(null);
  const [pathTxt, setPathTxt] = useState(null);
  const [points, setPoints] = useState(null);
  const [anchors, setAnchors] = useState(null);
  const [texts, setTexts] = useState(null);
  const [readOnlySvgs, setReadOnlySvgs] = useState(null);
  const [activePoint, setActivePoint] = useState(null);
  const [draggedPoint, setDraggedPoint] = useState(null);
  const [draggedCubic, setDraggedCubic] = useState(false);
  const [hasAnchor, setHasAnchor] = useState(false);
  const [id, setId] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [addAnchor, setAddAnchor] = useState(false);
  const [addText, setAddText] = useState(false);
  const imageRef = useRef(null);
  let { problemIdMediaId } = useParams<ProblemIdMediaIdParams>();
  let history = useHistory();
  let location = useLocation();
  const { outerWidth, outerHeight } = window;
  const minWindowScale = Math.min(outerWidth, outerHeight);
  const black = "#000000";
  useEffect(() => {
    if (problemIdMediaId && accessToken) {
      getSvgEdit(accessToken, problemIdMediaId).then((data) => {
        setMediaId(data.mediaId);
        setCrc32(data.crc32);
        setW(data.w);
        setH(data.h);
        setCtrl(data.ctrl);
        setSvgId(data.svgId);
        setPath(data.path);
        setPathTxt(data.path);
        setPoints(parsePath(data.path));
        setAnchors(data.anchors);
        setTexts(data.texts);
        setReadOnlySvgs(data.readOnlySvgs);
        setActivePoint(data.activePoint);
        setDraggedPoint(data.draggedPoint);
        setDraggedCubic(data.draggedCubic);
        setHasAnchor(data.hasAnchor);
        setId(data.id);
        setMetadata(data.metadata);
      });
    }
  }, [accessToken, problemIdMediaId]);
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

  function onAddAnchor() {
    setAddAnchor(!addAnchor);
    setAddText(false);
  }

  function onAddText() {
    setAddAnchor(false);
    setAddText(!addText);
  }

  function save(event) {
    event.preventDefault();
    postProblemSvg(accessToken, id, mediaId, points.length<2, svgId, path, hasAnchor, JSON.stringify(anchors), JSON.stringify(texts))
    .then(() => {
      history.push("/problem/" + id);
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
    const dx = w/dim.width;
    const dy = h/dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    return {x, y};
  };

  function handleOnClick(e) {
    if (ctrl) {
      points.push(getMouseCoords(e));
      if (points.length > 1) {
        const a = points[points.length-2];
        const b = points[points.length-1];
        const distance = Math.abs((b.x-a.x)^2 + (b.y-a.y)^2);
        if (distance > 130) { // Convert from 'Line to' to 'Curve to'
          const deltaX = (b.x-a.x)/3;
          const deltaY = (b.y-a.y)/3;
          // Update points
          points[points.length-1] = {
            x: b.x,
            y: b.y,
            c: [
                {
                  x: a.x+deltaX,
                  y: a.y+deltaY
                },
                {
                  x: b.x-deltaX,
                  y: b.y-deltaY
                }
            ]
          };
        }
      }
      const p = generatePath();
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
      setActivePoint(points.length - 1);
    } else if (addText) {
      let coords = getMouseCoords(e);
      let txt = prompt("Enter text", "");
      texts.push({txt: txt, x: coords.x, y: coords.y});
      setAddText(false);
      setTexts(texts);
    } else if (addAnchor) {
      let coords = getMouseCoords(e);
      anchors.push(coords);
      setAddAnchor(false);
      setAnchors(anchors);
    }
  };

  function generatePath() {
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
    if (!ctrl && !addAnchor && !addText) {
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
    points[active].x = coords.x;
    points[active].y = coords.y;
    const p = generatePath();
    setPath(p);
    setPathTxt(p);
    setPoints([...points]);
  };

  function setCubicCoords(coords, anchor) {
    const active = activePoint;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    const p = generatePath();
    setPath(p);
    setPathTxt(p);
    setPoints([...points]);
  };

  function setCurrDraggedPoint(index) {
    if (!ctrl && !addAnchor && !addText) {
      setActivePoint(index);
      setDraggedPoint(true);
    }
  };

  function setCurrDraggedCubic(index, anchor) {
    if (!ctrl && !addAnchor && !addText) {
      setActivePoint(index);
      setDraggedCubic(anchor);
    }
  };

  function setPointType(e, { value }) {
    const active = activePoint;
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
      const p = generatePath();
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
    }
  };

  function removeActivePoint(e) {
    let active = activePoint;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      const p = generatePath();
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
      setActivePoint(points.length-1);
    }
  };

  function reset(e) {
    setCtrl(false);
    setPath(null);
    setPathTxt(null);
    setPoints([]);
    setAnchors([]);
    setTexts([]);
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
    setHasAnchor(false);
  };

  if (loading || (isAuthenticated && !metadata)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!metadata.isAdmin) {
    return <InsufficientPrivileges />
  }

  if (!id || !metadata) {
    return <LoadingAndRestoreScroll />;
  } else if (!metadata.isAdmin) {
    return <span><h3>Not logged in</h3></span>;
  }
  var circles = points.map((p, i, a) => {
    var anchors = [];
    if (p.c) {
      const stroke = "#FFFFFF";
      anchors.push(
        <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: black}} x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.003*w} strokeDasharray={0.003*w}/>
          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: black}} x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.003*w} strokeDasharray={0.003*w}/>
          <circle className={"buldreinfo-svg-pointer"} fill={black} cx={p.c[0].x} cy={p.c[0].y} r={0.003*w} onMouseDown={() => setCurrDraggedCubic(i, 0)}/>
          <circle className={"buldreinfo-svg-pointer"} fill={black} cx={p.c[1].x} cy={p.c[1].y} r={0.003*w} onMouseDown={() => setCurrDraggedCubic(i, 1)}/>

          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: stroke}} x1={a[i-1].x} y1={a[i-1].y} x2={p.c[0].x} y2={p.c[0].y} strokeWidth={0.0015*w} strokeDasharray={0.003*w}/>
          <line className={"buldreinfo-svg-pointer"} style={{fill: "none", stroke: stroke}} x1={p.x} y1={p.y} x2={p.c[1].x} y2={p.c[1].y} strokeWidth={0.0015*w} strokeDasharray={0.003*w}/>
          <circle className={"buldreinfo-svg-pointer"} fill={stroke} cx={p.c[0].x} cy={p.c[0].y} r={0.002*w} onMouseDown={() => setCurrDraggedCubic(i, 0)}/>
          <circle className={"buldreinfo-svg-pointer"} fill={stroke} cx={p.c[1].x} cy={p.c[1].y} r={0.002*w} onMouseDown={() => setCurrDraggedCubic(i, 1)}/>
        </g>
      );
    }
    const fill = activePoint && activePoint === i? "#0000FF" : "#FF0000";
    return (
      <g key={i}>
        {anchors}
        <circle className={"buldreinfo-svg-pointer"} fill={black} cx={p.x} cy={p.y} r={0.004*w} onMouseDown={() => setCurrDraggedPoint(i)}/>
        <circle className={"buldreinfo-svg-pointer"} fill={fill} cx={p.x} cy={p.y} r={0.003*w} onMouseDown={() => setCurrDraggedPoint(i)}/>
      </g>
    );
  });
  anchors.map((a, i) => {
    circles.push(<circle key={i} fill="#E2011A" cx={a.x} cy={a.y} r={0.006*w} />);
  });
  const myTexts = texts.map((t, i) => (<text key={i} x={t.x} y={t.y} fontSize="5em" fill={"red"}>{t.txt}</text>));
  return (
    <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <Segment style={{minHeight: '130px'}}>
        <Button.Group floated="right">
          <Button negative disabled={points.length===0 && anchors.length===0 && myTexts.length===0} onClick={reset}>Reset</Button>
          <Button.Or />
          <Button onClick={() => history.push(`/problem/${problemIdMediaId.split("-")[0]}`)}>Cancel</Button>
          <Button.Or />
          <Button positive onClick={save}>Save</Button>
        </Button.Group>
        <Button.Group size="tiny">
          <Button onClick={onAddText}>{addText? "Click on image to add text" : "Add text"}</Button>
          <Button.Or />
          <Button disabled={myTexts.length===0} onClick={() => setTexts([])}>Remove all texts</Button>
        </Button.Group>
        {metadata.gradeSystem==='CLIMBING' &&
          <>
            {' '}
            <Button.Group size="tiny">
              <Button onClick={onAddAnchor}>{addAnchor? "Click on image to add extra anchor" : "Add extra anchor"}</Button>
              <Button.Or />
              <Button disabled={anchors.length===0} onClick={() => setAnchors([])}>Remove all extra anchors</Button>
            </Button.Group>
            {' '}
            <Dropdown selection value={hasAnchor} disabled={points.length===0} onChange={() => setHasAnchor(!hasAnchor)} options={[
              {key: 1, value: false, text: 'No anchor on route'},
              {key: 2, value: true, text: 'Route has anchor'}
            ]}/>
          </>
        }<br/>
        <strong>CTRL + CLICK</strong> to add a point | <strong>CLICK</strong> to select a point | <strong>CLICK AND DRAG</strong> to move a point<br/>
        {activePoint !== 0 && (
          <Dropdown selection value={!!points[activePoint].c? "C" : "L"} onChange={setPointType} options={[
            {key: 1, value: "L", text: 'Selected point: Line to'},
            {key: 2, value: "C", text: 'Selected point: Curve to'}
          ]}/>
        )}
        {activePoint !== 0 && <Button disabled={activePoint===0} onClick={removeActivePoint}>Remove this point</Button>}
      </Segment>
      <svg viewBox={"0 0 " + w + " " + h} onClick={handleOnClick} onMouseMove={handleMouseMove} width="100%" height="100%">
        <image ref={imageRef} xlinkHref={getImageUrl(mediaId, crc32, null)} width="100%" height="100%"/>
        {parseReadOnlySvgs(readOnlySvgs, w, h, minWindowScale)}
        <path style={{fill: "none", stroke: black}} d={path} strokeWidth={0.003*w}/>
        <path style={{fill: "none", stroke: "#FF0000"}} d={path} strokeWidth={0.002*w}/>
        {circles}
        {myTexts}
      </svg><br/>
      <Input
        label="SVG Path:"
        action={{
          labelPosition: 'right',
          color: path===pathTxt? 'gray': 'blue',
          icon: 'sync',
          content: 'Update',
          onClick: () => {
            setPath(pathTxt);
            setPoints(parsePath(pathTxt));
          }
        }}
        fluid placeholder='SVG Path' value={pathTxt} onChange={(e, { value }) => {
          setPathTxt(value);
        }}
      />
    </Container>
  )
}

export default SvgEdit;
