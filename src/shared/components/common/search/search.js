import React, {Component} from 'react';
import Async from 'react-select/lib/Async';
import { components } from 'react-select';
import { Redirect } from 'react-router';
import Avatar from 'react-avatar';
import { postSearch } from './../../../api';
import { LockSymbol } from '../lock-symbol/lock-symbol';

const CustomOption = (props) => {
  var bg = "#4caf50";
  if (props.value.avatar==='A') {
    bg = "#ff5722";
  } else if (props.value.avatar==='S') {
    bg = "#673ab7";
  }
  return (
    <components.Option {...props}>
      <div>
        <Avatar value={props.value.avatar? props.value.avatar : "7A"} size={25} color={bg} round={true} textSizeRatio={2.25} style={{marginRight: '10px'}} />
        {props.label} <LockSymbol visibility={props.value.visibility}/>
      </div>
    </components.Option>
  );
};

class Search extends Component {
  componentDidUpdate(prevProps) {
    if (this.state && this.state.pushUrl) {
      this.setState({pushUrl: null});
    }
  }

  search(input, callback) {
    if (input) {
      postSearch(this.props.auth.getAccessToken(), input).then((res) => {
        var options = res.map(s => {return {value: s, label: s.value}});
        callback(options);
      });
    } else {
      callback(null);
    }
  }

  onChange(props) {
    if (props && props.value && props.value.url) {
      this.setState({pushUrl: props.value.url});
    }
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return (
      <Async
        instanceId="buldreinfo-navigation-search"
        placeholder="Search"
        loadOptions={this.search.bind(this)}
        filterOptions={(options, filter, currentValues) => {
          // Do no filtering, just return all options
          return options;
        }}
        ignoreAccents={false} // Keep special characters ae, oe, aa. Don't substitute...
        onChange={this.onChange.bind(this)}
        components={{ Option: CustomOption }}
      />
    );
  }
}

export default Search;
