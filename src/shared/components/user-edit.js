import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { FormGroup, ControlLabel, FormControl, HelpBlock, ButtonGroup, Button, Panel, Breadcrumb, Well } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { postUserEdit } from './../api';

class UserEdit extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

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
      this.refresh(this.props.match.params.userId);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.refresh(this.props.match.params.userId);
    }
  }

  refresh(id) {
    const { cookies } = this.props;
    const accessToken = cookies.get('access_token');
    this.props.fetchInitialData(accessToken, id).then((data) => this.setState(() => ({data})));
  }

  save(event) {
    event.preventDefault();
    if (this.validateFirstname(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid firstname.</Panel>});
    } else if (this.validateLastname(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid lastname.</Panel>});
    } else if (this.validateUsername(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid username.</Panel>});
    } else if (this.validateCurrentPassword(null)==='error' || this.validateNewPassword(null)==='error' || this.validateNewPassword2(null)==='error') {
      this.setState({message: <Panel bsStyle='danger'>Invalid password.</Panel>});
    } else {
      const { data } = this.state;
      const { cookies } = this.props;
      const accessToken = cookies.get('access_token');
      postUserEdit(accessToken, data.id, data.username, data.firstname, data.lastname, data.currentPassword, data.newPassword)
      .then((response) => {
        this.setState({pushUrl: "/user"});
      })
      .catch((error) => {
        console.warn(error);
        this.setState({message: <Panel bsStyle='danger'>{error.toString()}</Panel>});
      });
    }
  }

  onCancel() {
    window.history.back();
  }

  onFirstnameChanged(e) {
    const { data } = this.state;
    data.firstname = e.target.value;
    this.setState({data});
  }

  onLastnameChanged(e) {
    const { data } = this.state;
    data.lastname = e.target.value;
    this.setState({data});
  }

  onUsernameChanged(e) {
    const { data } = this.state;
    data.username = e.target.value;
    this.setState({data});
  }

  onCurrentPasswordChanged(e) {
    const { data } = this.state;
    data.currentPassword = e.target.value;
    this.setState({data});
  }

  onNewPasswordChanged(e) {
    const { data } = this.state;
    data.newPassword = e.target.value;
    this.setState({data});
  }

  onConfirmNewPasswordChanged(e) {
    const { data } = this.state;
    data.newPassword2 = e.target.value;
    this.setState({data});
  }

  validateFirstname() {
    if (this.state.data.firstname.length < 1) {
      return 'error';
    }
    return 'success';
  }

  validateLastname() {
    if (this.state.data.lastname.length < 1) {
      return 'error';
    }
    return 'success';
  }

  validateUsername() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(this.state.data.username)) {
      return 'error';
    }
    return 'success';
  }

  validateCurrentPassword() {
    return 'success';
  }

  validateNewPassword() {
    if ((this.state.data.currentPassword || this.state.data.newPassword2) && !this.state.data.newPassword) return 'error';
    else if (this.state.data.newPassword && this.state.data.newPassword.length < 8) return 'error';
    return 'success';
  }

  validateNewPassword2() {
    if ((this.state.data.currentPassword || this.state.data.newPassword) && !this.state.data.newPassword2) return 'error';
    else if (this.state.data.newPassword2 && this.state.data.newPassword2.length < 8) return 'error';
    else if (this.state.data.newPassword2 && this.state.data.newPassword!=this.state.data.newPassword2) return 'error';
    return 'success';
  }

  render() {
    const { data } = this.state;
    if (!data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!data.metadata.isAuthenticated) {
      this.setState({pushUrl: "/login", error: null});
    }

    return (
      <span>
        <MetaTags>
          <title>{data.metadata.title}</title>
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <font color='#777'>User edit</font>
        </Breadcrumb>
        <Well>
          {this.state.message}
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsFirstname" validationState={this.validateFirstname()}>
              <ControlLabel>Firstname</ControlLabel>
              <FormControl type="text" value={data.firstname} placeholder="Enter firstname" onChange={this.onFirstnameChanged.bind(this)} />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="formControlsLastname" validationState={this.validateLastname()}>
              <ControlLabel>Lastname</ControlLabel>
              <FormControl type="text" value={data.lastname} placeholder="Enter lastname" onChange={this.onLastnameChanged.bind(this)} />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="formControlsUsername" validationState={this.validateUsername()}>
              <ControlLabel>Username</ControlLabel>
              <FormControl type="email" value={data.username} placeholder="Enter username" onChange={this.onUsernameChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>You must enter a valid email address.</HelpBlock>
            </FormGroup>
            <hr/>
            <h4>Only fill following fields if you want to change your password</h4>
            <FormGroup controlId="formControlsCurrentPassword" validationState={this.validateCurrentPassword()}>
              <ControlLabel>Current password</ControlLabel>
              <FormControl type="password" placeholder="Enter current password" onChange={this.onCurrentPasswordChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsNewPassword" validationState={this.validateNewPassword()}>
              <ControlLabel>New password</ControlLabel>
              <FormControl type="password" placeholder="Enter new password" onChange={this.onNewPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>At least 8 characters.</HelpBlock>
            </FormGroup>
            <FormGroup controlId="formControlsNewPassword2" validationState={this.validateNewPassword2()}>
              <ControlLabel>Confirm new password</ControlLabel>
              <FormControl type="password" placeholder="Confirm new password" onChange={this.onConfirmNewPasswordChanged.bind(this)} />
              <FormControl.Feedback />
              <HelpBlock>Must match new password.</HelpBlock>
            </FormGroup>

            <ButtonGroup>
              <Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button>
              <Button type="submit" bsStyle="success">Save</Button>
            </ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}

export default withCookies(UserEdit);
