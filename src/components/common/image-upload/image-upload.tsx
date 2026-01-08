import {
  useEffect,
  useState,
  useCallback,
  type ComponentProps,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import heic2any from 'heic2any';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Card,
  Image,
  Input,
  Checkbox,
  Loader,
  type InputOnChangeData,
  type CheckboxProps,
} from 'semantic-ui-react';
import VideoEmbedder from './video-embedder';
import { UserSelector } from '../user-selector/user-selector';
import { UsersSelector } from '../../common/user-selector/user-selector';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../../common/meta/context';

export type UploadedMedia = {
  file?: File;
  preview?: string;
} & components['schemas']['NewMedia'];

type Props = {
  onMediaChanged: (newMedia: UploadedMedia[]) => void;
  isMultiPitch: boolean;
};

const different = (a: UploadedMedia, b: UploadedMedia) => {
  return a.preview !== b.preview || a.embedThumbnailUrl !== b.embedThumbnailUrl;
};

const ImageUpload = ({ onMediaChanged, isMultiPitch }: Props) => {
  const meta = useMeta();
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    onMediaChanged(media as UploadedMedia[]);
  }, [media, onMediaChanged]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsConverting(true);
      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            if (file.type === 'image/heic' || file.type === 'image/heif') {
              const result = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8,
              });
              const jpegBlobs = Array.isArray(result) ? result : [result];
              const newFile = new File(jpegBlobs, file.name.replace(/\.heic|\.heif/i, '.jpeg'), {
                type: 'image/jpeg',
              });
              return newFile;
            }
            return file;
          }),
        );

        setMedia((existing) => [
          ...existing,
          ...processedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            photographer: meta?.authenticatedName,
          })),
        ]);
      } finally {
        setIsConverting(false);
      }
    },
    [meta],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/heic': [],
      'image/heif': [],
    },
    noClick: isConverting,
    noKeyboard: isConverting,
  });

  const addMedia = useCallback<ComponentProps<typeof VideoEmbedder>['addMedia']>(
    ({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds }) => {
      setMedia((old) => [...old, { embedVideoUrl, embedThumbnailUrl, embedMilliseconds }]);
    },
    [],
  );

  return (
    <>
      <div
        {...getRootProps()}
        style={{
          padding: '15px',
          borderWidth: '1px',
          borderColor: '#666',
          borderStyle: 'dashed',
          borderRadius: '5px',
          backgroundColor: 'white',
        }}
      >
        <input {...getInputProps()} />
        {isConverting ? (
          <Loader active inline size='small' style={{ margin: 'auto' }}>
            Converting HEIC files...
          </Loader>
        ) : isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <p>Drop images here, or click to select files to upload.</p>
        )}
      </div>
      <br />
      <VideoEmbedder addMedia={addMedia} />
      {media.length > 0 && (
        <>
          <br />
          <br />
          <Card.Group itemsPerRow={4} stackable>
            {media.map((m) => {
              const key = m.preview ?? m.embedThumbnailUrl;

              const updateItem = (patch: Partial<typeof m>) =>
                setMedia((oldValue) =>
                  oldValue.map((item) => (different(item, m) ? item : { ...item, ...patch })),
                );

              let min = 0;
              let sec = 0;
              if (m.embedThumbnailUrl && m.embedMilliseconds && m.embedMilliseconds > 0) {
                min = Math.floor((m.embedMilliseconds / 1000 / 60) << 0);
                sec = Math.floor((m.embedMilliseconds / 1000) % 60);
              }

              return (
                <Card key={key}>
                  <Image size='medium' src={m.preview ?? m.embedThumbnailUrl} />
                  <Card.Content>
                    {isMultiPitch && (
                      <Input
                        size='mini'
                        icon='hashtag'
                        iconPosition='left'
                        fluid
                        placeholder='Pitch'
                        value={m.pitch ?? ''}
                        onChange={(
                          _: ChangeEvent<HTMLInputElement>,
                          { value }: InputOnChangeData,
                        ) => {
                          updateItem({ pitch: +value });
                        }}
                      />
                    )}
                    <Input
                      size='mini'
                      icon='comment'
                      iconPosition='left'
                      fluid
                      placeholder='Description'
                      value={m.description ?? ''}
                      onChange={(
                        _: ChangeEvent<HTMLInputElement>,
                        { value }: InputOnChangeData,
                      ) => {
                        updateItem({ description: value as string });
                      }}
                    />
                    <Checkbox
                      label='Trivia'
                      toggle
                      checked={!!m.trivia}
                      onChange={(_: FormEvent<HTMLInputElement>, data: CheckboxProps) => {
                        updateItem({ trivia: !!data.checked });
                      }}
                    />
                    <UsersSelector
                      placeholder='In photo/video'
                      users={m.inPhoto ?? []}
                      onUsersUpdated={(newUsers) => {
                        const inPhoto = newUsers.map((u) => {
                          return {
                            id: typeof u.value === 'string' ? -1 : u.value,
                            name: u.label,
                          };
                        });
                        updateItem({ inPhoto });
                      }}
                    />
                    <UserSelector
                      placeholder='Photographer'
                      defaultValue={m.photographer ?? ''}
                      onUserUpdated={(u) => {
                        updateItem({ photographer: u?.label });
                      }}
                    />
                    {m.embedThumbnailUrl && (
                      <>
                        <label>Start video at:</label>
                        <Input
                          size='mini'
                          label='Min'
                          value={min}
                          onChange={(
                            _: ChangeEvent<HTMLInputElement>,
                            { value }: InputOnChangeData,
                          ) => {
                            const val = +value;
                            const ms = (val * 60 + sec) * 1000;
                            updateItem({ embedMilliseconds: ms });
                          }}
                        />
                        <Input
                          size='mini'
                          label='Sec'
                          value={sec}
                          onChange={(
                            _: ChangeEvent<HTMLInputElement>,
                            { value }: InputOnChangeData,
                          ) => {
                            const val = +value;
                            const ms = (min * 60 + val) * 1000;
                            updateItem({ embedMilliseconds: ms });
                          }}
                        />
                      </>
                    )}
                  </Card.Content>
                  <Card.Content extra>
                    <Button
                      fluid
                      basic
                      negative
                      onClick={() => {
                        setMedia((old) => old.filter((item) => different(m, item)));
                      }}
                    >
                      Remove
                    </Button>
                  </Card.Content>
                </Card>
              );
            })}
          </Card.Group>
        </>
      )}
    </>
  );
};

export default ImageUpload;
