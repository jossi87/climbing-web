import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { FormGroup, ControlLabel, FormControl, HelpBlock, ButtonGroup, Button, Panel, Well } from 'react-bootstrap';
import auth from '../utils/auth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getUserPassword } from './../api';

export default class Recover extends Component {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.props.fetchInitialData().then((data) => this.setState(() => ({data, password: '', password2: ''})));
    }
  }

  componentDidMount() {
    this.setState({token: this.props.match.params.token});
  }

  recover(event) {
    event.preventDefault();
    if (this.validatePassword(null)==='error' || this.validatePassword2(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid password.</Panel>});
    } else {
      getUserPassword(this.state.token, this.state.password)
      .then((response) => {
        this.setState({pushUrl: "/login"});
      })
      .catch ((error) => {
        console.warn(error);
      });
    }
  }

  onPasswordChanged(e) {
    this.setState({password: e.target.value});
  }

  onConfirmPasswordChanged(e) {
    this.setState({password2: e.target.value});
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
    if (!this.state.token) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return (
      <span>
        <MetaTags>
          <title>{this.state.data && this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data && this.state.data.metadata.description} />
        </MetaTags>
        <Well>
          <form onSubmit={this.recover.bind(this)}>
            <FormGroup controlId="formControlsPassword" validationState={this.validatePassword()}>
              <ControlLabel>New password</ControlLabel>
              <FormControl type="password" placeholder="Enter new password" onChange={this.onPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>At least 8 characters.</HelpBlock>
            </FormGroup>
            <FormGroup controlId="formControlsPassword2" validationState={this.validatePassword2()}>
              <ControlLabel>Confirm new password</ControlLabel>
              <FormControl type="password" placeholder="Confirm new password" onChange={this.onConfirmPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>Must match password field.</HelpBlock>
            </FormGroup>
            <ButtonGroup>
              <Button type="submit" bsStyle="success">Reset password</Button>
            </ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}
