import React, {Component} from 'react';
import { Redirect } from 'react-router';
import { Search, Image } from 'semantic-ui-react'
import { getImageUrl, postFind } from './../../../api';
import { LockSymbol } from '../widgets/widgets';

class SearchBox extends Component<any, any> {
  state = { isLoading: false, results: [], value: '', pushUrl: null };

  handleResultSelect = (e, { result }) => this.setState({pushUrl: result.url})

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    postFind(this.props.auth.getAccessToken(), value).then((res) => {
      this.setState({ isLoading: false, results: res });
    });
  }

  resultRenderer = ({ mediaId, mediaUrl, title, description, visibility }) => {
    var imageSrc = null;
    if (mediaId > 0) {
      imageSrc = getImageUrl(mediaId, 130);
    } else if (mediaUrl) {
      imageSrc = mediaUrl;
    }
    const image = imageSrc && <Image style={{objectFit: 'cover', width: '100%', height: '100%'}} src={imageSrc} />;
    return (
      <>
        <div key='image' className='image'>
          {image}
        </div>
        <div key='content' className='content'>
          {title && <div className='title'>{title} <LockSymbol visibility={visibility} /></div>}
          {description && <div className='description'>{description}</div>}
        </div>
      </>
    )
  }

  render() {
    const { isLoading, value, results, pushUrl } = this.state;
    if (pushUrl) {
      this.setState({pushUrl: null})
      return (<Redirect to={pushUrl} push />);
    }
    const { children, ...searchProps} = this.props;
    return (
      <Search
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        resultRenderer={this.resultRenderer}
        minCharacters={1}
        results={results}
        value={value}
        {...searchProps}
      />
    );
  }
}

export default SearchBox;
