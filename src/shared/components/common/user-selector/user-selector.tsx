import React, {Component} from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import { getUserSearch } from './../../../api';

class UserSelector extends Component<any, any> {
  constructor(props) {
		super(props);
		this.state = {multiValue: props.users, options: []};
	}
	
	componentDidMount() {
		getUserSearch(this.props.auth.getAccessToken(), "").then((res) => this.setState({options: res.map(u => {return {value: u.id, label: u.name}})}));
	}

	handleOnChange(value) {
    this.props.onUsersUpdated(value);
		this.setState({multiValue: value});
	}

	isValidNewOption(inputValue) {
		return this.state.options.filter(u => u.label && inputValue.toLowerCase() === u.label.toLowerCase()).length == 0;
	}

	render() {
		return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
  				<CreatableSelect
  					isMulti
  					options={this.state.options}
  					onChange={this.handleOnChange.bind(this)}
						isValidNewOption={this.isValidNewOption.bind(this)}
  					value={this.state.multiValue}
  				/>
				</div>
			</div>
		);
	}
}

export default UserSelector;
