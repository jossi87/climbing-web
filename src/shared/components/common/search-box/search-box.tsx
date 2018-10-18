import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { Search, Image } from 'semantic-ui-react'
import { getImageUrl, postSearch } from './../../../api';
import { LockSymbol } from '../widgets/widgets';

class SearchBox extends Component<any, any> {
  state = { isLoading: false, results: [], value: '' };

  handleResultSelect = (e, { result }) => this.props.history.push(result.url)

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    postSearch(this.props.auth.getAccessToken(), value).then((res) => {
      this.setState({ isLoading: false, results: res });
    });
  }

  resultRenderer = ({ mediaId, mediaUrl, title, description, visibility }) => {
    var imageSrc = null;
    if (mediaId > 0) {
      imageSrc = getImageUrl(mediaId, 45);
    } else if (mediaUrl) {
      imageSrc = mediaUrl;
    }
    return (
      <>
        <div key='image' className='image'>
          {imageSrc && <Image style={{objectFit: 'cover', width: '45px', height: '45px'}} src={imageSrc} />}
        </div>
        <div key='content' className='content'>
          {title && <div className='title'>{title} <LockSymbol visibility={visibility} /></div>}
          {description && <div className='description'>{description}</div>}
        </div>
      </>
    )
  }

  render() {
    const { isLoading, value, results } = this.state;
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

export default withRouter(SearchBox);
