import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Request from 'superagent';
import { LinkContainer } from 'react-router-bootstrap';
import { FormGroup, ControlLabel, FormControl, ButtonGroup, Button, Panel, Breadcrumb, Well } from 'react-bootstrap';
import auth from '../utils/auth.js'
import config from '../utils/config.js';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      username: '',
      password: ''
    };
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  forgotPasswordClick(event) {
    if (!this.state.username) {
      this.setState({message: <Panel bsStyle='danger'>Please fill username and click Forgot password again.</Panel>});
    } else if (!this.validateEmail(this.state.username)) {
      this.setState({message: <Panel bsStyle='danger'>No email address registered on &quot;{this.state.username}&quot;. Contact Jostein (jostein.oygarden@gmail.com) to recover password.</Panel>});
    } else {
      Request.get(config.getUrl("users/forgotPassword?username=" + this.state.username + "&hostname=" + window.location.hostname)).withCredentials().end((err, res) => {
        if (err) {
          this.setState({message: <Panel bsStyle='danger'>{err.toString()}</Panel>});
        } else {
          this.setState({message: <Panel bsStyle='success'>An e-mail with instructions to reset your password is sent to &quot;{this.state.username}&quot;.</Panel>});
        }
      });
    }
  }

  login(event) {
    event.preventDefault();
    auth.login(this.state.username, this.state.password, (loggedIn) => {
      const { location } = this.props
      if (!loggedIn) {
        return this.setState({message: <Panel bsStyle='danger'>Invalid username and/or password.</Panel>});
      } else {
        return this.setState({message: null, pushUrl: "/"});
      }
    });
  }

  onUsernameChanged(e) {
    this.setState({username: e.target.value});
  }

  onPasswordChanged(e) {
    this.setState({password: e.target.value});
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Login")}</title>
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <font color='#777'>Sign in</font>
        </Breadcrumb>
        <Well>
          {this.state.message}
          <form onSubmit={this.login.bind(this)}>
            <FormGroup controlId="formControlsText">
              <ControlLabel>Username</ControlLabel>
              <FormControl type="text" placeholder="Enter username" onChange={this.onUsernameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsPassword">
              <ControlLabel>Password</ControlLabel>
              <FormControl type="password" placeholder="Enter password" onChange={this.onPasswordChanged.bind(this)} />
            </FormGroup>
            <ButtonGroup>
              <LinkContainer to={`/register`}><Button bsStyle="default">Register new user</Button></LinkContainer>
              <Button bsStyle="default" onClick={this.forgotPasswordClick.bind(this)}>Forgot password</Button>
              <Button type="submit" bsStyle="success">Login</Button>
            </ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}

Login.contextTypes = {
  router: PropTypes.object
}
