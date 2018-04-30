import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';
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
        return {
    			multiValue: [],
    			options: res.body.map(u => {return {value: u.id, label: u.name}})
    		};
      }
    });
	},
	handleOnChange(value) {
		this.setState({ multiValue: value });
	},
	render() {
		return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
  				<Select.Creatable
  					multi={true}
  					options={this.state.options}
  					onChange={this.handleOnChange}
  					value={this.state.multiValue}
  				/>
				</div>
			</div>
		);
	}
});

module.exports = UserSelector;
