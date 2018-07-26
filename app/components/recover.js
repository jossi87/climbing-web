import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Request from 'superagent';
import { FormGroup, ControlLabel, FormControl, HelpBlock, ButtonGroup, Button, Panel, Well } from 'react-bootstrap';
import auth from '../utils/auth.js';
import config from '../utils/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Recover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password2: ''
    };
  }

  componentDidMount() {
    this.setState({token: this.props.match.params.token});
  }

  recover(event) {
    event.preventDefault();
    if (this.validatePassword(null)==='error' || this.validatePassword2(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid password.</Panel>});
    } else {
      Request.get(config.getUrl("users/password?token=" + this.state.token + "&password=" + this.state.password)).withCredentials().end((err, res) => {
        if (err) {
          this.setState({error: err});
        } else {
          this.setState({error: null, pushUrl: "/login"});
        }
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
    else if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Reset password")}</title>
          <meta name="description" content={"Recover password"} />
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
