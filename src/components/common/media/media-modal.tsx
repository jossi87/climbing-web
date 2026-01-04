import { useState, MouseEvent } from 'react';
import { components } from '../../../@types/buldreinfo/swagger';
import { useLocalStorage } from '../../../utils/use-local-storage';
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
} from 'semantic-ui-react';
import { getBuldreinfoMediaUrl, getImageUrl, getImageUrlSrcSet } from '../../../api';
import SvgViewer from '../../SvgViewer';
import VideoPlayer from './video-player';
import { Link, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Descent, Rappel } from '../../../utils/svg-utils';
import { useMeta } from '../meta';

const style = {
  img: {
    height: '100vh',
    width: '100vw',
    objectFit: 'contain',
  },
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: '100vh',
    width: '100vw',
  },
  video: {
    width: '100vw',
    height: '80vh',
    maxHeight: '100vh',
    maxWidth: '100vw',
  },
  actions: {
    zIndex: 2,
    position: 'fixed',
    top: '10px',
    right: '10px',
  },
  prev: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    left: '10px',
    height: '40px',
    marginTop: '-20px' /* 1/2 the height of the button */,
  },
  next: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    right: '10px',
    height: '40px',
    marginTop: '-20px' /* 1/2 the height of the button */,
  },
  play: {
    zIndex: 2,
    position: 'absolute',
    top: '50%',
    left: '50%',
    height: '60px',
    width: '60px',
    marginTop: '-30px' /* 1/2 the height of the button */,
    marginLeft: '-30px' /* 1/2 the width of the button */,
  },
  textLeft: {
    textAlign: 'left',
  },
};

type Props = {
  isSaving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRotate: (deg: number) => void;
  onMoveImageLeft: () => void;
  onMoveImageRight: () => void;
  onMoveImageToArea: () => void;
  onMoveImageToSector: () => void;
  onMoveImageToProblem: () => void;
  onSetMediaAsAvatar: () => void;
  m: components['schemas']['Media'];
  pitch: number;
  pitches: components['schemas']['ProblemSection'][];
  orderableMedia: components['schemas']['Media'][];
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
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onRotate,
  onMoveImageLeft,
  onMoveImageRight,
  onMoveImageToArea,
  onMoveImageToSector,
  onMoveImageToProblem,
  onSetMediaAsAvatar,
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
  const { isAuthenticated, isAdmin, isBouldering } = useMeta();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useLocalStorage('showSidebar', true);
  const [problemIdHovered, setProblemIdHovered] = useState<number | null>(null);
  const canShowSidebar =
    (m.svgs ?? m.mediaSvgs ?? [])
      .filter((svg): svg is components['schemas']['Svg'] => 'problemId' in svg)
      .map((v) => v.problemId)
      .filter((value, index, self) => self.indexOf(value) === index).length > 1;
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const isImage = m?.idType === 1;

  if (isSaving) {
    return (
      <Dimmer active={true} onClickOutside={onClose} page>
        <Icon name='spinner' size='huge' loading />
      </Dimmer>
    );
  }

  const handleDimmerClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const content = (() => {
    if (isImage) {
      if ((m.svgs ?? m.mediaSvgs ?? []).length > 0) {
        return (
          <div key={`${m.id}-${carouselIndex}`} style={style.imgContainer} onClick={onClose}>
            <div
              style={style.img as React.CSSProperties}
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <SvgViewer
                key={`${m.id}-${carouselIndex}`}
                thumb={false}
                m={m}
                pitch={pitch}
                close={onClose}
                optProblemId={optProblemId ?? null}
                showText={canShowSidebar && !showSidebar}
                problemIdHovered={problemIdHovered}
                setProblemIdHovered={(id) => setProblemIdHovered(id)}
              />
            </div>
          </div>
        );
      }
      const fallbackWidth = Math.min(1920, m.width ?? 1920);
      return (
        <div key={`${m.id}-${carouselIndex}`} style={style.imgContainer} onClick={onClose}>
          <Image
            key={`${m.id}-${carouselIndex}`}
            style={style.img}
            alt={m.mediaMetadata?.alt ?? ''}
            src={getImageUrl(m.id ?? 0, m.crc32 ?? 0, { targetWidth: fallbackWidth })}
            srcSet={getImageUrlSrcSet(m.id ?? 0, m.crc32 ?? 0, m.width ?? 0)}
            sizes='100vw'
            onClick={(e: MouseEvent) => e.stopPropagation()}
          />
        </div>
      );
    }
    if (m.embedUrl) {
      let style;
      if (m.embedUrl.includes('vimeo')) {
        style = {
          minWidth: '640px',
          minHeight: '360px',
          backgroundColor: 'transparent',
        };
      } else {
        style = {
          minWidth: '320px',
          minHeight: '200px',
          backgroundColor: 'transparent',
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
        <div
          key={`${m.id}-${carouselIndex}`}
          style={style.imgContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <VideoPlayer media={m} />
        </div>
      );
    }
    return (
      <>
        <Image
          key={`${m.id}-${carouselIndex}`}
          style={style.img}
          alt={m.mediaMetadata?.description ?? ''}
          src={getImageUrl(m.id ?? 0, m.crc32 ?? 0, { targetWidth: 1080 })}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        />
        <Button
          size='massive'
          color='youtube'
          circular
          style={style.play}
          icon='play'
          onClick={(e) => {
            e.stopPropagation();
            playVideo();
          }}
        />
      </>
    );
  })();
  const canSetMediaAsAvatar = isAuthenticated && isImage;
  const canEdit = isAdmin && isImage;
  const canDelete = isAdmin;
  const canRotate =
    (isAdmin || m.uploadedByMe) &&
    isImage &&
    (m.svgs ?? []).length === 0 &&
    (m.mediaSvgs ?? []).length === 0;
  const canDrawTopo = isAdmin && isImage && !!optProblemId;
  const canDrawMedia = isAdmin && isImage && !isBouldering;
  const canOrder = isAdmin && isImage && (orderableMedia ?? []).some((om) => om.id === (m.id ?? 0));
  const canMove = isAdmin && isImage;
  const activePitch =
    (!!pitch &&
      (pitches ?? []) &&
      (pitches ?? []).some((p) => p.nr === pitch) &&
      (pitches ?? []).filter((p) => p.nr === pitch)[0]) ||
    null;
  return (
    <Dimmer
      active={true}
      onClick={handleDimmerClick}
      page
      style={{ backgroundColor: 'rgba(0,0,0,1)', padding: 0 }}
    >
      <ButtonGroup secondary size='mini' style={style.actions}>
        {m.url && <Button icon='external' onClick={() => window.open(m.url, '_blank')} />}
        {canShowSidebar && (
          <Button
            icon='numbered list'
            inverted={showSidebar}
            onClick={(e) => {
              e.stopPropagation();
              setShowSidebar((prev) => !prev);
            }}
          />
        )}
        <Modal trigger={<Button icon='info' onClick={(e) => e.stopPropagation()} />}>
          <Modal.Content image scrolling>
            <Image
              wrapped
              size='medium'
              src={getImageUrl(m.id ?? 0, m.crc32 ?? 0, { targetWidth: 150 })}
            />
            <Modal.Description>
              <Header>Info</Header>
              <b>Location: </b> {m.mediaMetadata?.location ?? ''}
              <br />
              {m.mediaMetadata?.dateCreated && (
                <>
                  <b>Date uploaded:</b> {m.mediaMetadata?.dateCreated}
                  <br />
                </>
              )}
              {m.mediaMetadata?.dateTaken && (
                <>
                  <b>Date taken:</b> {m.mediaMetadata?.dateTaken}
                  <br />
                </>
              )}
              {m.mediaMetadata?.capturer && (
                <>
                  <b>{m.idType === 1 ? 'Photographer' : 'Video created by'}:</b>{' '}
                  {m.mediaMetadata?.capturer}
                  <br />
                </>
              )}
              {m.mediaMetadata?.tagged && (
                <>
                  <b>In {m.idType === 1 ? 'photo' : 'video'}:</b> {m.mediaMetadata?.tagged}
                  <br />
                </>
              )}
              {m.height != 0 && m.width != 0 && (
                <>
                  <b>Image dimensions:</b> {m.width}x{m.height}
                  <br />
                </>
              )}
              {m.mediaMetadata?.description && <i>{m.mediaMetadata?.description}</i>}
            </Modal.Description>
          </Modal.Content>
        </Modal>
        {!isBouldering && (m.mediaSvgs || m.svgs) && (
          <Modal trigger={<Button icon='help' onClick={(e) => e.stopPropagation()} />}>
            <Modal.Content image scrolling>
              <Modal.Description>
                <Header>Topo</Header>
                <List divided relaxed>
                  <List.Item>
                    <List.Header>Line shapes:</List.Header>
                    <List bulleted>
                      <List.Item>
                        <List.Content>
                          <List.Header>Dotted line</List.Header>
                          <List.Description>Bolted sport route</List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Header>Unbroken line</List.Header>
                          <List.Description>Traditionally protected route</List.Description>
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
                          <List.Description>Grade 3, 4 and 5</List.Description>
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
                          <List.Description>Grade 9 and 10</List.Description>
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
                          <List.Description>Flagged as dangerous</List.Description>
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
                            <svg width='100' height='26'>
                              <Descent
                                scale={0.8}
                                path={'M 0 10 C 100 10 0 0 200 20'}
                                whiteNotBlack={false}
                                thumb={false}
                                key={'descent'}
                              />
                            </svg>
                          </List.Header>
                          <List.Description>Descent</List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Header>
                            <svg width='20' height='26'>
                              <Rappel
                                scale={0.8}
                                x={8}
                                y={8}
                                bolted={true}
                                thumb={false}
                                backgroundColor={'black'}
                                color={'white'}
                                key={'bolted-rappel'}
                              />
                            </svg>
                          </List.Header>
                          <List.Description>Bolted rappel anchor</List.Description>
                        </List.Content>
                      </List.Item>
                      <List.Item>
                        <List.Content>
                          <List.Header>
                            <svg width='20' height='26'>
                              <Rappel
                                x={8}
                                y={8}
                                bolted={false}
                                scale={0.8}
                                thumb={false}
                                backgroundColor={'black'}
                                color={'white'}
                                key={'not-bolted-rappel'}
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
          canSetMediaAsAvatar ||
          canRotate ||
          canEdit ||
          canDelete ||
          canDrawTopo ||
          canDrawMedia ||
          canOrder ||
          canMove) && (
          <Dropdown direction='left' icon='ellipsis vertical' button>
            <Dropdown.Menu>
              {canDrawTopo && (
                <Dropdown.Item
                  icon='paint brush'
                  text='Draw topo line'
                  onClick={() =>
                    navigate(`/problem/svg-edit/${optProblemId}/${pitch || 0}/${m.id ?? 0}`)
                  }
                />
              )}
              {canDrawMedia && (
                <Dropdown.Item
                  icon='paint brush'
                  text='Draw on image'
                  onClick={() => navigate(`/media/svg-edit/${m.id ?? 0}`)}
                />
              )}
              {canOrder && (
                <Dropdown.Item
                  icon='arrow left'
                  text='Move image to the left'
                  onClick={onMoveImageLeft}
                />
              )}
              {canOrder && (
                <Dropdown.Item
                  icon='arrow right'
                  text='Move image to the right'
                  onClick={onMoveImageRight}
                />
              )}
              {canMove && (m.enableMoveToIdArea ?? 0) > 0 && (
                <Dropdown.Item
                  icon='move'
                  text={'Move image to area'}
                  onClick={onMoveImageToArea}
                />
              )}
              {canMove && (m.enableMoveToIdSector ?? 0) > 0 && (
                <Dropdown.Item
                  icon='move'
                  text={'Move image to sector'}
                  onClick={onMoveImageToSector}
                />
              )}
              {canMove && (m.enableMoveToIdProblem ?? 0) > 0 && (
                <Dropdown.Item
                  icon='move'
                  text={'Move image to ' + (isBouldering ? 'problem' : 'route')}
                  onClick={onMoveImageToProblem}
                />
              )}
              {canSetMediaAsAvatar && (
                <Dropdown.Item icon='user' text='Set as avatar' onClick={onSetMediaAsAvatar} />
              )}
              {(canDrawTopo || canDrawMedia || canOrder || canMove || canSetMediaAsAvatar) &&
                (!m.embedUrl || canRotate || canEdit || canDelete) && <Dropdown.Divider />}
              {!m.embedUrl && (
                <Dropdown.Item
                  icon='download'
                  text='Download original'
                  onClick={() => {
                    const isMovie = m.idType !== 1;
                    const ext = isMovie ? 'mp4' : 'jpg';
                    saveAs(
                      getBuldreinfoMediaUrl(m.id ?? 0, ext),
                      'buldreinfo_brattelinjer_' + (m.id ?? 0) + '.' + ext,
                    );
                  }}
                />
              )}
              {canRotate && (
                <Dropdown.Item
                  icon='redo'
                  text='Rotate 90 degrees CW'
                  onClick={() => onRotate(90)}
                />
              )}
              {canRotate && (
                <Dropdown.Item
                  icon='undo'
                  text='Rotate 90 degrees CCW'
                  onClick={() => onRotate(270)}
                />
              )}
              {canRotate && (
                <Dropdown.Item
                  icon='sync'
                  text='Rotate 180 degrees'
                  onClick={() => onRotate(180)}
                />
              )}
              {canEdit && <Dropdown.Item icon='edit' text='Edit image' onClick={() => onEdit()} />}
              {canDelete && (
                <Dropdown.Item
                  icon='trash'
                  text={isImage ? 'Delete image' : 'Delete video'}
                  onClick={onDelete}
                />
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <Button icon='close' onClick={onClose} />
      </ButtonGroup>
      {carouselSize > 1 && (
        <>
          <Icon
            onMouseEnter={() => setPrevHover(true)}
            onMouseLeave={() => setPrevHover(false)}
            size='big'
            style={style.prev}
            name={prevHover ? 'chevron circle left' : 'angle left'}
            link
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              gotoPrev();
            }}
          />
          <Icon
            onMouseEnter={() => setNextHover(true)}
            onMouseLeave={() => setNextHover(false)}
            as={Icon}
            size='big'
            style={style.next}
            name={nextHover ? 'chevron circle right' : 'angle right'}
            link
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              gotoNext();
            }}
          />
        </>
      )}
      {showLocation && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1,
          }}
        >
          {m.mediaMetadata?.location}
        </div>
      )}
      {m.mediaMetadata?.description && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1,
          }}
        >
          {m.mediaMetadata?.description}
        </div>
      )}
      {(carouselSize > 1 || (m.pitch ?? 0) > 0 || activePitch) && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1,
          }}
        >
          {[
            activePitch && `${activePitch.grade} | ${activePitch.description}`,
            (m.pitch ?? 0) > 0 && `Pitch ${m.pitch ?? 0}`,
            carouselSize > 1 && `${carouselIndex}/${carouselSize}`,
          ]
            .filter(Boolean)
            .join(' | ')}
        </div>
      )}
      <Sidebar.Pushable style={{ minWidth: '360px' }} onClick={onClose}>
        <Sidebar
          as={Menu}
          size='small'
          direction='left'
          animation='overlay'
          inverted
          onHide={() => setShowSidebar(false)}
          vertical
          visible={canShowSidebar && showSidebar}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          {canShowSidebar &&
            [...(m.svgs ?? m.mediaSvgs ?? [])]
              .filter((svg): svg is components['schemas']['Svg'] => 'problemId' in svg)
              .filter((svg) => (svg.pitch ?? 0) === 0 || (svg.pitch ?? 0) === 1)
              .sort((a, b) => {
                if ((a.nr ?? 0) !== (b.nr ?? 0)) {
                  return (a.nr ?? 0) - (b.nr ?? 0);
                }
                return (a.problemName ?? '').localeCompare(b.problemName ?? '');
              })
              .map((svg) => {
                const url = `/problem/${svg.problemId}/${m.id ?? 0}`;
                return (
                  <Menu.Item
                    key={url}
                    fitted='horizontally'
                    style={style.textLeft}
                    as={Link}
                    to={url}
                    active={problemIdHovered === svg.problemId || optProblemId === svg.problemId}
                    color='blue'
                    onMouseEnter={() => setProblemIdHovered(svg.problemId ?? null)}
                    onMouseLeave={() => setProblemIdHovered(null)}
                  >
                    {svg.pitch === 0
                      ? `#${svg.nr} ${svg.problemName} [${svg.problemGrade}]`
                      : svg.problemName}

                    {svg.ticked && <Icon color='green' inverted={true} name='check' />}
                    {svg.todo && <Icon color='blue' inverted={true} name='bookmark' />}
                  </Menu.Item>
                );
              })}
        </Sidebar>

        <Sidebar.Pusher>
          <div style={{ position: 'relative' }}>{content}</div>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Dimmer>
  );
};

export default MediaModal;
