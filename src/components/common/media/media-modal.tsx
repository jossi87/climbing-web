import React, { act, useRef, useState } from "react";
import { components } from "../../../@types/buldreinfo/swagger";
import { useLocalStorage } from "../../../utils/use-local-storage";
import {
  Dimmer,
  Button,
  Icon,
  Image,
  Modal,
  Header,
  ButtonGroup,
  Embed,
  Container,
  Dropdown,
  List,
  Sidebar,
  Menu,
} from "semantic-ui-react";
import {
  getBuldreinfoMediaUrlSupported,
  getBuldreinfoMediaUrl,
  getImageUrl,
} from "../../../api";
import ReactPlayer from "react-player";
import SvgViewer from "../../SvgViewer";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Descent, Rappel } from "../../../utils/svg-utils";
import { useMeta } from "../meta";

const style = {
  img: {
    maxHeight: "100vh",
    maxWidth: "100vw",
    objectFit: "scale-down",
  },
  video: {
    maxHeight: "100vh",
    maxWidth: "100vw",
  },
  actions: {
    opacity: 0.7,
    zIndex: 2,
    position: "fixed",
    top: "0px",
    right: "0px",
  },
  prev: {
    zIndex: 2,
    position: "fixed",
    top: "50%",
    left: "2px",
    height: "40px",
    marginTop: "-20px" /* 1/2 the height of the button */,
  },
  next: {
    zIndex: 2,
    position: "fixed",
    top: "50%",
    right: "2px",
    height: "40px",
    marginTop: "-20px" /* 1/2 the height of the button */,
  },
  play: {
    zIndex: 2,
    position: "fixed",
    top: "50%",
    left: "50%",
    height: "60px",
    width: "60px",
    marginTop: "-30px" /* 1/2 the height of the button */,
    marginLeft: "-30px" /* 1/2 the width of the button */,
  },
  textLeft: {
    textAlign: "left",
  },
};

type Props = {
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRotate: (deg: number) => void;
  onMoveImageLeft: () => void;
  onMoveImageRight: () => void;
  onMoveImageToArea: () => void;
  onMoveImageToSector: () => void;
  onMoveImageToProblem: () => void;
  m: components["schemas"]["Media"];
  pitch: number;
  pitches: components["schemas"]["ProblemSection"][];
  orderableMedia: components["schemas"]["Media"][];
  carouselIndex: number;
  carouselSize: number;
  showLocation: boolean;
  gotoPrev: () => void;
  gotoNext: () => void;
  playVideo: () => void;
  autoPlayVideo: boolean;
  optProblemId: number | null;
};

const MediaModal = ({
  onClose,
  onEdit,
  onDelete,
  onRotate,
  onMoveImageLeft,
  onMoveImageRight,
  onMoveImageToArea,
  onMoveImageToSector,
  onMoveImageToProblem,
  m,
  pitch,
  pitches,
  orderableMedia,
  carouselIndex,
  carouselSize,
  showLocation,
  gotoPrev,
  gotoNext,
  playVideo,
  autoPlayVideo,
  optProblemId,
}: Props) => {
  const { isAdmin, isBouldering } = useMeta();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useLocalStorage("showSidebar", true);
  const [problemIdHovered, setProblemIdHovered] = useState<number>(null);
  const canShowSidebar =
    m.svgs
      ?.map((v) => v.problemId)
      .filter((value, index, self) => self.indexOf(value) === index).length > 1;
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const playerRef = useRef<ReactPlayer | null>();
  const isImage = m?.idType === 1;

  const content = (() => {
    if (isImage) {
      if (m.svgs || m.mediaSvgs) {
        return (
          <Image style={style.img}>
            <SvgViewer
              thumb={false}
              style={{}}
              m={m}
              pitch={pitch}
              close={onClose}
              optProblemId={optProblemId ?? 0}
              showText={canShowSidebar && !showSidebar}
              problemIdHovered={problemIdHovered}
              setProblemIdHovered={(id) => setProblemIdHovered(id)}
            />
          </Image>
        );
      }
      return (
        <Image
          style={style.img}
          alt={m.mediaMetadata.alt}
          src={getImageUrl(m.id, m.crc32, 1080)}
        />
      );
    }
    if (m.embedUrl) {
      let style;
      if (m.embedUrl.includes("vimeo")) {
        style = {
          minWidth: "640px",
          minHeight: "360px",
          backgroundColor: "transparent",
        };
      } else {
        style = {
          minWidth: "320px",
          minHeight: "200px",
          backgroundColor: "transparent",
        };
      }
      return (
        <Embed
          as={Container}
          style={style}
          url={m.embedUrl}
          defaultActive={true}
          iframe={{ allowFullScreen: true, style: { padding: 10 } }}
        />
      );
    }
    if (autoPlayVideo) {
      return (
        <ReactPlayer
          style={style.video}
          ref={playerRef}
          url={getBuldreinfoMediaUrlSupported(m.id)}
          controls={true}
          playing={true}
          onDuration={(duration) => {
            const amount = parseInt(m.t) / duration;
            if (
              Number.isNaN(amount) ||
              !Number.isFinite(amount) ||
              !playerRef.current
            ) {
              return;
            }
            playerRef.current.seekTo(amount);
          }}
        />
      );
    }
    return (
      <>
        <Image
          style={style.img}
          alt={m.mediaMetadata?.description}
          src={getImageUrl(m.id, 360)}
        />
        <Button
          size="massive"
          color="youtube"
          circular
          style={style.play}
          icon="play"
          onClick={playVideo}
        />
      </>
    );
  })();
  const canEdit = isAdmin && isImage;
  const canDelete = isAdmin && isImage;
  const canRotate =
    (isAdmin || m.uploadedByMe) && isImage && !m.svgs && !m.mediaSvgs;
  const canDrawTopo = isAdmin && isImage && optProblemId;
  const canDrawMedia = isAdmin && isImage && !isBouldering;
  const canOrder = isAdmin && isImage && orderableMedia?.includes(m);
  const canMove = isAdmin && isImage;
  const activePitch =
    pitch &&
    pitches &&
    pitches.some((p) => p.nr === pitch) &&
    pitches.filter((p) => p.nr === pitch)[0];
  return (
    <Dimmer active={true} onClickOutside={onClose} page>
      <Sidebar.Pushable style={{ minWidth: "360px" }}>
        <Sidebar
          style={{ opacity: 0.7 }}
          as={Menu}
          size="small"
          direction="left"
          animation="overlay"
          inverted
          onHide={() => setShowSidebar(false)}
          vertical
          visible={canShowSidebar && showSidebar}
        >
          {canShowSidebar &&
            m.svgs
              .slice(0) // Create copy, dont change svgs-order (used to draw topo in correct order)
              .sort((a, b) => a.nr - b.nr)
              .map((svg) => {
                const url = `/problem/${svg.problemId}/${m.id}`;
                return (
                  <Menu.Item
                    key={url}
                    fitted="horizontally"
                    style={style.textLeft}
                    as={Link}
                    to={url}
                    active={
                      problemIdHovered === svg.problemId ||
                      optProblemId === svg.problemId
                    }
                    color="blue"
                    onMouseEnter={() => setProblemIdHovered(svg.problemId)}
                    onMouseLeave={() => setProblemIdHovered(null)}
                  >
                    {`#${svg.nr} ${svg.problemName}`} <i>{svg.problemGrade}</i>
                    {svg.ticked && (
                      <Icon color="green" inverted={true} name="check" />
                    )}
                    {svg.todo && (
                      <Icon color="blue" inverted={true} name="bookmark" />
                    )}
                  </Menu.Item>
                );
              })}
        </Sidebar>

        <Sidebar.Pusher>
          <ButtonGroup secondary size="mini" style={style.actions}>
            {m.url && (
              <Button
                icon="external"
                onClick={() => window.open(m.url, "_blank")}
              />
            )}
            {canShowSidebar && (
              <Button
                icon="numbered list"
                inverted={showSidebar}
                onClick={() => setShowSidebar(true)}
              />
            )}
            <Modal trigger={<Button icon="info" />}>
              <Modal.Content image>
                <Image wrapped size="medium" src={getImageUrl(m.id, 150)} />
                <Modal.Description>
                  <Header>Info</Header>
                  <b>Location: </b> {m.mediaMetadata.location}
                  <br />
                  {m.mediaMetadata.dateCreated && (
                    <>
                      <b>Date uploaded:</b> {m.mediaMetadata.dateCreated}
                      <br />
                    </>
                  )}
                  {m.mediaMetadata.dateTaken && (
                    <>
                      <b>Date taken:</b> {m.mediaMetadata.dateTaken}
                      <br />
                    </>
                  )}
                  {m.mediaMetadata.capturer && (
                    <>
                      <b>
                        {m.idType === 1 ? "Photographer" : "Video created by"}:
                      </b>{" "}
                      {m.mediaMetadata.capturer}
                      <br />
                    </>
                  )}
                  {m.mediaMetadata.tagged && (
                    <>
                      <b>In {m.idType === 1 ? "photo" : "video"}:</b>{" "}
                      {m.mediaMetadata.tagged}
                      <br />
                    </>
                  )}
                  {m.height != 0 && m.width != 0 && (
                    <>
                      <b>Image dimensions:</b> {m.width}x{m.height}
                      <br />
                    </>
                  )}
                  {m.mediaMetadata.description && (
                    <i>{m.mediaMetadata.description}</i>
                  )}
                </Modal.Description>
              </Modal.Content>
            </Modal>
            {!isBouldering && (m.mediaSvgs || m.svgs) && (
              <Modal trigger={<Button icon="help" />}>
                <Modal.Content image>
                  <Modal.Description>
                    <Header>Topo</Header>
                    <List divided relaxed>
                      <List.Item>
                        <List.Header>Line shapes:</List.Header>
                        <List bulleted>
                          <List.Item>
                            <List.Content>
                              <List.Header>Dotted line</List.Header>
                              <List.Description>
                                Bolted sport route
                              </List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Unbroken line</List.Header>
                              <List.Description>
                                Traditionally protected route
                              </List.Description>
                            </List.Content>
                          </List.Item>
                        </List>
                      </List.Item>
                      <List.Item>
                        <List.Header>Line colors:</List.Header>
                        <List bulleted>
                          <List.Item>
                            <List.Content>
                              <List.Header>White</List.Header>
                              <List.Description>Project</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Green</List.Header>
                              <List.Description>
                                Grade 3, 4 and 5
                              </List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Blue</List.Header>
                              <List.Description>Grade 6</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Yellow</List.Header>
                              <List.Description>Grade 7</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Red</List.Header>
                              <List.Description>Grade 8</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Magenta</List.Header>
                              <List.Description>
                                Grade 9 and 10
                              </List.Description>
                            </List.Content>
                          </List.Item>
                        </List>
                      </List.Item>
                      <List.Item>
                        <List.Header>Number colors:</List.Header>
                        <List bulleted>
                          <List.Item>
                            <List.Content>
                              <List.Header>Green</List.Header>
                              <List.Description>Ticked</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Blue</List.Header>
                              <List.Description>In todo-list</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>Red</List.Header>
                              <List.Description>
                                Flagged as dangerous
                              </List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>White</List.Header>
                              <List.Description>Default color</List.Description>
                            </List.Content>
                          </List.Item>
                        </List>
                      </List.Item>
                      <List.Item>
                        <List.Header>Other symbols:</List.Header>
                        <List bulleted>
                          <List.Item>
                            <List.Content>
                              <List.Header>
                                <svg width="100" height="26">
                                  <Descent
                                    scale={0.8}
                                    path={"M 0 10 C 100 10 0 0 200 20"}
                                    whiteNotBlack={false}
                                    thumb={false}
                                    key={"descent"}
                                  />
                                </svg>
                              </List.Header>
                              <List.Description>Descent</List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>
                                <svg width="20" height="26">
                                  <Rappel
                                    scale={0.8}
                                    x={8}
                                    y={8}
                                    bolted={true}
                                    thumb={false}
                                    backgroundColor={"black"}
                                    color={"white"}
                                    key={"bolted-rappel"}
                                  />
                                </svg>
                              </List.Header>
                              <List.Description>
                                Bolted rappel anchor
                              </List.Description>
                            </List.Content>
                          </List.Item>
                          <List.Item>
                            <List.Content>
                              <List.Header>
                                <svg width="20" height="26">
                                  <Rappel
                                    x={8}
                                    y={8}
                                    bolted={false}
                                    scale={0.8}
                                    thumb={false}
                                    backgroundColor={"black"}
                                    color={"white"}
                                    key={"not-bolted-rappel"}
                                  />
                                </svg>
                              </List.Header>
                              <List.Description>
                                Traditional rappel anchor (not bolted)
                              </List.Description>
                            </List.Content>
                          </List.Item>
                        </List>
                      </List.Item>
                    </List>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
            )}
            {(!m.embedUrl ||
              canRotate ||
              canEdit ||
              canDelete ||
              canDrawTopo ||
              canDrawMedia ||
              canOrder ||
              canMove) && (
              <Dropdown direction="left" icon="ellipsis vertical" button>
                <Dropdown.Menu>
                  {canDrawTopo && (
                    <Dropdown.Item
                      icon="paint brush"
                      text="Draw topo line"
                      onClick={() =>
                        navigate(`/problem/svg-edit/${optProblemId}/0/${m.id}`)
                      }
                    />
                  )}
                  {canDrawMedia && (
                    <Dropdown.Item
                      icon="paint brush"
                      text="Draw on image"
                      onClick={() => navigate(`/media/svg-edit/${m.id}`)}
                    />
                  )}
                  {canOrder && (
                    <Dropdown.Item
                      icon="arrow left"
                      text="Move image to the left"
                      onClick={onMoveImageLeft}
                    />
                  )}
                  {canOrder && (
                    <Dropdown.Item
                      icon="arrow right"
                      text="Move image to the right"
                      onClick={onMoveImageRight}
                    />
                  )}
                  {canMove && m.enableMoveToIdArea > 0 && (
                    <Dropdown.Item
                      icon="move"
                      text={"Move image to area"}
                      onClick={onMoveImageToArea}
                    />
                  )}
                  {canMove && m.enableMoveToIdSector > 0 && (
                    <Dropdown.Item
                      icon="move"
                      text={"Move image to sector"}
                      onClick={onMoveImageToSector}
                    />
                  )}
                  {canMove && m.enableMoveToIdProblem > 0 && (
                    <Dropdown.Item
                      icon="move"
                      text={
                        "Move image to " + (isBouldering ? "problem" : "route")
                      }
                      onClick={onMoveImageToProblem}
                    />
                  )}
                  {(canDrawTopo || canDrawMedia || canOrder || canMove) &&
                    (!m.embedUrl || canRotate || canEdit || canDelete) && (
                      <Dropdown.Divider />
                    )}
                  {!m.embedUrl && (
                    <Dropdown.Item
                      icon="download"
                      text="Download original"
                      onClick={() => {
                        const isMovie = m.idType !== 1;
                        const ext = isMovie ? "mp4" : "jpg";
                        saveAs(
                          getBuldreinfoMediaUrl(m.id, ext),
                          "buldreinfo_brattelinjer_" + m.id + "." + ext,
                        );
                      }}
                    />
                  )}
                  {canRotate && (
                    <Dropdown.Item
                      icon="redo"
                      text="Rotate 90 degrees CW"
                      onClick={() => onRotate(90)}
                    />
                  )}
                  {canRotate && (
                    <Dropdown.Item
                      icon="undo"
                      text="Rotate 90 degrees CCW"
                      onClick={() => onRotate(270)}
                    />
                  )}
                  {canRotate && (
                    <Dropdown.Item
                      icon="sync"
                      text="Rotate 180 degrees"
                      onClick={() => onRotate(180)}
                    />
                  )}
                  {canEdit && (
                    <Dropdown.Item
                      icon="edit"
                      text="Edit image"
                      onClick={() => onEdit()}
                    />
                  )}
                  {canDelete && (
                    <Dropdown.Item
                      icon="trash"
                      text="Delete image"
                      onClick={onDelete}
                    />
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
            <Button icon="close" onClick={onClose} />
          </ButtonGroup>
          {carouselSize > 1 && (
            <>
              <Icon
                onMouseEnter={() => setPrevHover(true)}
                onMouseLeave={() => setPrevHover(false)}
                size="big"
                style={style.prev}
                name={prevHover ? "chevron circle left" : "angle left"}
                link
                onClick={gotoPrev}
              />
              <Icon
                onMouseEnter={() => setNextHover(true)}
                onMouseLeave={() => setNextHover(false)}
                as={Icon}
                size="big"
                style={style.next}
                name={nextHover ? "chevron circle right" : "angle right"}
                link
                onClick={gotoNext}
              />
            </>
          )}
          {content}
          {showLocation && (
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              {m.mediaMetadata.location}
            </div>
          )}
          {m.mediaMetadata.description && (
            <div
              style={{
                position: "absolute",
                bottom: "0px",
                left: "0px",
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              {m.mediaMetadata.description}
            </div>
          )}
          {(carouselSize > 1 || m.pitch > 0 || activePitch) && (
            <div
              style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              {[
                activePitch &&
                  `${activePitch.grade} | ${activePitch.description}`,
                m.pitch > 0 && `Pitch ${m.pitch}`,
                carouselSize > 1 && `${carouselIndex}/${carouselSize}`,
              ]
                .filter(Boolean)
                .join(" | ")}
            </div>
          )}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Dimmer>
  );
};

export default MediaModal;
