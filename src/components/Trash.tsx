import { Loading } from './common/widgets/widgets';
import { getImageUrl, useTrash } from '../api';
import { useMeta } from './common/meta';
import { Segment, Icon, Header, List, Button, Image } from 'semantic-ui-react';
import { useNavigate } from 'react-router';
import { components } from '../@types/buldreinfo/swagger';

const getKey = ({ idArea, idSector, idProblem, idMedia }: components['schemas']['Trash']) => {
  return [idArea, idSector, idProblem, idMedia].join('/');
};

const getLabel = ({
  idMedia,
  idArea,
  idSector,
  idProblem,
}: components['schemas']['Trash']): string => {
  if (idMedia) {
    return 'Media';
  }

  if (idArea) {
    return 'Area';
  }

  if (idSector) {
    return 'Sector';
  }

  if (idProblem) {
    return 'Problem';
  }

  return '';
};

const Trash = () => {
  const navigate = useNavigate();
  const meta = useMeta();
  const { data, restore } = useTrash();

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <title>{`Trash | ${meta?.title}`}</title>
      <Segment>
        <Header as='h2'>
          <Icon name='trash' />
          <Header.Content>
            Trash
            <Header.Subheader>{data.length} items</Header.Subheader>
          </Header.Content>
        </Header>
        {!data.length ? (
          <i>No data</i>
        ) : (
          <List divided verticalAlign='middle'>
            {data.map((t) => {
              const key = getKey(t);

              return (
                <List.Item key={key}>
                  <List.Content floated='right'>
                    <Button
                      onClick={() => {
                        if (confirm('Are you sure you want to restore item?')) {
                          restore(t).then((url) => {
                            navigate(url);
                          });
                        }
                      }}
                    >
                      Restore
                    </Button>
                  </List.Content>
                  {!!t.idMedia && (
                    <Image
                      alt={t.name}
                      key={t.idMedia}
                      src={getImageUrl(t.idMedia, 0, { minDimension: 50 })}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) =>
                        (e.currentTarget.src = '/png/video_placeholder.png')
                      }
                      rounded
                    />
                  )}
                  <List.Content>
                    <List.Header>{t.name}</List.Header>
                    <List.Description>
                      {`${getLabel(t)} deleted by ${t.by} (${t.when})`}
                    </List.Description>
                  </List.Content>
                </List.Item>
              );
            })}
          </List>
        )}
      </Segment>
    </>
  );
};

export default Trash;
