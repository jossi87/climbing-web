import React, {Component} from 'react';
import CreatableSelect from 'react-select/creatable';
import { getUserSearch } from './../../../api';

class UserSelector extends Component<any, any> {
  constructor(props) {
		super(props);
		this.state = {multiValue: props.users, options: []};
	}
	
	componentDidMount() {
		getUserSearch(this.props.auth.getAccessToken(), "").then((res) => this.setState({options: res.map(u => {return {value: u.id, label: u.name}})}));
	}

	handleChange = (newValue: any, actionMeta: any) => {
		if (!newValue) {
			newValue = [];
		}
    this.props.onUsersUpdated(newValue);
		this.setState({multiValue: newValue});
	}

	isValidNewOption = (inputValue) => {
		return this.state.options.filter(u => u.label && inputValue.toLowerCase() === u.label.toLowerCase()).length == 0;
	}

	render() {
		return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
  				<CreatableSelect
  					isMulti
  					options={this.state.options}
  					onChange={this.handleChange}
						isValidNewOption={this.isValidNewOption}
  					value={this.state.multiValue}
  				/>
				</div>
			</div>
		);
	}
}

export default UserSelector;
