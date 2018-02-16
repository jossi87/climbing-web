import React, {Component} from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Request from 'superagent';
import { MenuItem, ButtonGroup, Button, FormGroup, FormControl } from 'react-bootstrap';
import config from '../../../utils/config.js';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';

export default class UserSelecter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: props.users,
      searchInputValue: ''
    };
  }

  inputChange(e) {
    var value = e.target.value;
    if (value.length>0) {
      Request.get(config.getUrl("users/search?value=" + value)).withCredentials().end((err, res) => {
        if (err) {
          console.log(err);
        }
        const sr = res.body.filter(u => this.state.users.filter(v => u.id==v.id).length==0);
        if (sr.filter(u => u.name.toUpperCase()===value.toUpperCase()).length==0 && this.state.users.filter(u => u.name.toUpperCase()===value.toUpperCase()).length==0) {
          sr.push({id: -1, name: value});
        }
        this.setState({searchInputValue: value, searchResults: sr});
      });
    }
    else {
      this.setState({searchInputValue: value, searchResults: null});
    }
  }

  validateInput() {
    if (this.state.searchResults) {
      return 'error';
    }
    return 'success';
  }

  removeUser(idUser) {
    const users = this.state.users.filter(u => u.id!=idUser);
    this.setState({users: users});
    this.props.onUsersUpdated(users);
  }

  menuItemSelect(user, event) {
    this.state.users.push(user);
    this.setState({searchInputValue: '', searchResults: null});
    this.props.onUsersUpdated(this.state.users);
  }

  render() {
    var searchResults = null;
    if (this.state && this.state.searchResults && this.state.searchResults.length>0) {
      const rows = this.state.searchResults.map((u, i) => {
        const extra = u.id==-1? <b> [New user]</b> : <b> [Existing user]</b>
        return (
          <MenuItem key={i} href="#" onSelect={this.menuItemSelect.bind(this, u)}>{u.name} {extra}</MenuItem>
        )
      });
      searchResults=(
        <div>
          <ul className="dropdown-menu open" style={{position: 'absolute', display: 'inline'}}>
            {rows}
          </ul>
        </div>
      );
    }

    const users = this.state.users.map((u, i) => (<Button key={i} onClick={this.removeUser.bind(this, u.id)}><FontAwesomeIcon icon="times" /> {u.name}{u.id==-1? " (new user)" : ""}</Button>));

    return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
          {users? <ButtonGroup>{users}</ButtonGroup> : null}
          <FormGroup controlId="formControlsSearchInput" validationState={this.validateInput()}>
            <FormControl style={{display: "inline-block"}} type="text" placeholder="Search users" value={this.state.searchInputValue} onChange={this.inputChange.bind(this)} />
            <FormControl.Feedback />
          </FormGroup>
        </div>
        {searchResults}
      </div>
    );
  }
}
