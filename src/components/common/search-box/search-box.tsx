import { useEffect, useState, type ComponentProps } from 'react';
import { Search, Image, Icon } from 'semantic-ui-react';
import { getImageUrl, useSearch } from './../../../api';
import { LockSymbol } from '../widgets/widgets';
import { useNavigate } from 'react-router-dom';

type SearchBoxProps = Omit<
  ComponentProps<typeof Search>,
  | 'children'
  | 'id'
  | 'loading'
  | 'minCharacters'
  | 'onResultSelect'
  | 'onSearchChange'
  | 'resultRenderer'
  | 'results'
  | 'value'
>;

const SearchBox = ({ children: _, ...searchProps }: SearchBoxProps) => {
  const navigate = useNavigate();
  const { search, isPending, data } = useSearch();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (value.trim().length > 0) {
      search({ value });
    }
  }, [search, value]);

  return (
    <Search
      id='mySearch'
      loading={isPending}
      onResultSelect={(_, { result }) => {
        if (result.externalurl) {
          window.open(result.externalurl, '_blank');
        } else {
          navigate(result.url);
        }
      }}
      onSearchChange={(_, { value }) => {
        setValue(String(value ?? ''));
      }}
      placeholder='Search'
      resultRenderer={(data) => {
        const {
          mediaid,
          crc32,
          mediaurl,
          title,
          description,
          lockedadmin,
          lockedsuperadmin,
          externalurl,
          pageViews,
        } = data;
        let imageSrc = null;
        if (mediaid > 0) {
          imageSrc = getImageUrl(mediaid, crc32, { minDimension: 45 });
        } else if (mediaurl) {
          imageSrc = mediaurl;
        }
        if (externalurl) {
          return (
            <>
              <div className='image'>
                <Icon name='external' />
              </div>
              <div className='content'>
                {pageViews && (
                  <div className='price'>
                    <small>{pageViews}</small>
                  </div>
                )}
                {title && (
                  <div className='title'>
                    <i>{title}</i>
                  </div>
                )}
                {description && (
                  <div className='description'>
                    <i>{description}</i>
                  </div>
                )}
              </div>
            </>
          );
        }
        return (
          <>
            <div className='image'>
              {imageSrc && (
                <Image
                  style={{ objectFit: 'cover', width: '45px', height: '45px' }}
                  src={imageSrc}
                />
              )}
            </div>
            <div className='content'>
              {pageViews && (
                <div className='price'>
                  <small>{pageViews}</small>
                </div>
              )}
              {title && (
                <div className='title'>
                  {title}{' '}
                  <LockSymbol
                    lockedAdmin={lockedadmin === 'true'}
                    lockedSuperadmin={lockedsuperadmin === 'true'}
                  />
                </div>
              )}
              {description && <div className='description'>{description}</div>}
            </div>
          </>
        );
      }}
      minCharacters={1}
      results={data.map((s) => ({
        key: s.url || s.externalurl,
        url: s.url,
        externalurl: s.externalurl,
        mediaid: s.mediaid,
        mediaurl: s.mediaurl,
        crc32: s.crc32,
        title: s.title,
        description: s.description,
        lockedadmin: String(s.lockedadmin),
        lockedsuperadmin: String(s.lockedsuperadmin),
        pageViews: s.pageViews,
      }))}
      {...searchProps}
      value={value}
    />
  );
};

export default SearchBox;
