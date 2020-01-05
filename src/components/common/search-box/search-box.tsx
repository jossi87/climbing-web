import React, { useState } from 'react';
import { Search, Image } from 'semantic-ui-react'
import { getImageUrl, postSearch } from './../../../api';
import { LockSymbol } from '../widgets/widgets';
import { useHistory } from 'react-router-dom';
import { useAuth0 } from '../../../utils/react-auth0-spa';

const SearchBox = ({ children, ...searchProps} ) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [value, setValue] = useState('');
  const { accessToken } = useAuth0();
  let history = useHistory();

  return (
    <Search
      id="mySearch"
      loading={loading}
      onResultSelect={(e, { result }) => history.push(result.url)}
      onSearchChange={(e, { value }) => {
        setLoading(true);
        setValue(value);
        postSearch(accessToken, value).then((res) => {
          setResults(res);
          setLoading(false);
        });
      }}
      resultRenderer={({ mediaId, mediaUrl, title, description, visibility }) => {
        var imageSrc = null;
        if (mediaId > 0) {
          imageSrc = getImageUrl(mediaId, 45);
        } else if (mediaUrl) {
          imageSrc = mediaUrl;
        }
        return (
          <>
            <div className='image'>
              {imageSrc && <Image style={{objectFit: 'cover', width: '45px', height: '45px'}} src={imageSrc} />}
            </div>
            <div className='content'>
              {title && <div className='title'>{title} <LockSymbol visibility={visibility} /></div>}
              {description && <div className='description'>{description}</div>}
            </div>
          </>
        )
      }}
      minCharacters={1}
      results={results.map(s => ({ ...s, key: s.url }))}
      value={value}
      {...searchProps}
    />
  );
}

export default SearchBox;
