import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Request from 'superagent';
import { FormGroup, ControlLabel, FormControl, HelpBlock, ButtonGroup, Button, Panel, Breadcrumb, Well } from 'react-bootstrap';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      firstname: '',
      lastname: '',
      username: '',
      password: '',
      password2: ''
    };
  }

  register(event) {
    event.preventDefault();
    if (this.validateFirstname(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid firstname.</Panel>});
    } else if (this.validateLastname(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid lastname.</Panel>});
    } else if (this.validateUsername(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid username.</Panel>});
    } else if (this.validatePassword(null)==='error' || this.validatePassword2(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid password.</Panel>});
    } else {
      Request.post(config.getUrl("users/register"))
      .withCredentials()
      .send({firstname: this.state.firstname, lastname: this.state.lastname, username: this.state.username, password: this.state.password})
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState({message: <Panel bsStyle='danger'>{err.toString()}</Panel>});
        } else {
          this.setState({message: <Panel bsStyle='success'>User registered</Panel>, pushUrl: "/login"});
        }
      });
    }
  }

  onFirstnameChanged(e) {
    this.setState({firstname: e.target.value});
  }

  onLastnameChanged(e) {
    this.setState({lastname: e.target.value});
  }

  onUsernameChanged(e) {
    this.setState({username: e.target.value});
  }

  onPasswordChanged(e) {
    this.setState({password: e.target.value});
  }

  onConfirmPasswordChanged(e) {
    this.setState({password2: e.target.value});
  }

  validateFirstname() {
    if (this.state.firstname.length < 1) {
      return 'error';
    }
    return 'success';
  }

  validateLastname() {
    if (this.state.lastname.length < 1) {
      return 'error';
    }
    return 'success';
  }

  validateUsername() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(this.state.username)) {
      return 'error';
    }
    return 'success';
  }

  validatePassword() {
    if (this.state.password.length < 8) {
      return 'error';
    }
    return 'success';
  }

  validatePassword2() {
    if (this.state.password2.length < 8 || this.state.password!=this.state.password2) {
      return 'error';
    }
    return 'success';
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Register")}</title>
          <meta name="description" content={"Register new user"} />
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <font color='#777'>Register</font>
        </Breadcrumb>
        <Well>
          {this.state.message}
          <form onSubmit={this.register.bind(this)}>
            <FormGroup controlId="formControlsFirstname" validationState={this.validateFirstname()}>
              <ControlLabel>Firstname</ControlLabel>
              <FormControl type="text" placeholder="Enter firstname" onChange={this.onFirstnameChanged.bind(this)} />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="formControlsLastname" validationState={this.validateLastname()}>
              <ControlLabel>Lastname</ControlLabel>
              <FormControl type="text" placeholder="Enter lastname" onChange={this.onLastnameChanged.bind(this)} />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="formControlsUsername" validationState={this.validateUsername()}>
              <ControlLabel>Username</ControlLabel>
              <FormControl type="email" placeholder="Enter username" onChange={this.onUsernameChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>You must enter a valid email address.</HelpBlock>
            </FormGroup>
            <FormGroup controlId="formControlsPassword" validationState={this.validatePassword()}>
              <ControlLabel>Password</ControlLabel>
              <FormControl type="password" placeholder="Enter password" onChange={this.onPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>At least 8 characters.</HelpBlock>
            </FormGroup>
            <FormGroup controlId="formControlsPassword2" validationState={this.validatePassword2()}>
              <ControlLabel>Confirm password</ControlLabel>
              <FormControl type="password" placeholder="Confirm password" onChange={this.onConfirmPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>Must match password field.</HelpBlock>
            </FormGroup>
            <ButtonGroup>
              <Button type="submit" bsStyle="success">Register</Button>
            </ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}
