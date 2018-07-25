import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/lib/Creatable';
import Request from 'superagent';
import config from '../../../utils/config.js';

var UserSelector = createClass({
	displayName: 'UserSelector',
	propTypes: {
		label: PropTypes.string
	},
	getInitialState() {
    Request.get(config.getUrl("users/search?value=")).withCredentials().end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({options: res.body.map(u => {return {value: u.id, label: u.name}})});
      }
    });
    return {
      multiValue: this.props.users,
      options: []
    };
	},
	handleOnChange(value) {
		console.log(value);
    this.props.onUsersUpdated(value);
		this.setState({multiValue: value});
	},
	isValidNewOption(inputValue) {
		return this.state.options.filter(u => inputValue.toLowerCase() === u.label.toLowerCase()).length == 0;
	},
	render() {
		return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
  				<CreatableSelect
  					isMulti
  					options={this.state.options}
  					onChange={this.handleOnChange}
						isValidNewOption={this.isValidNewOption}
  					value={this.state.multiValue}
  				/>
				</div>
			</div>
		);
	}
});

module.exports = UserSelector;
