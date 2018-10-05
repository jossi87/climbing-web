import React, {Component} from 'react';
import { Search } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import Avatar from 'react-avatar';
import { postSearch } from './../../../api';
import { LockSymbol } from '../widgets/widgets';

class SearchBox extends Component<any, any> {
  state = { isLoading: false, results: [], value: '' };

  handleResultSelect = (e, { result }) => console.log(result.title);

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })
    postSearch(this.props.auth.getAccessToken(), value).then((res) => {
      var results = res.map(s => ({value: s, label: s.value}));
      this.setState({ isLoading: false, results });
    });
  }

  resultRenderer = ({ label, value }) => {
    var bg = "#4caf50";
    if (value.avatar==='A') {
      bg = "#ff5722";
    } else if (value.avatar==='S') {
      bg = "#673ab7";
    }
    let avatar;
    if (value.avatar==='U') {
      avatar = <Avatar name={label} size="25" round={true} textSizeRatio={2.25} style={{marginRight: '10px'}} />
    } else {
      avatar = <Avatar value={value.avatar} size="25" color={bg} round={true} textSizeRatio={2.25} style={{marginRight: '10px'}} />
    }
    return (
      <Link to={value.url}>
        {avatar}
        {label} <LockSymbol visibility={value.visibility}/>
      </Link>
    );
  }

  render() {
    const { isLoading, value, results } = this.state;
    return (
      <Search
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        minCharacters={1}
        resultRenderer={this.resultRenderer as any}
        results={results}
        value={value}
        {...this.props}
      />
    );
  }
}

export default SearchBox;
