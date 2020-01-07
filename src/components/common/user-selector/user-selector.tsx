import React, { useState, useEffect } from 'react';
import { useAuth0 } from '../../../utils/react-auth0-spa';
import CreatableSelect from 'react-select/creatable';
import { getUserSearch } from './../../../api';

const UserSelector = ({ users, onUsersUpdated, identity, placeholder, isMulti }) => {
	const { loading, accessToken } = useAuth0();
	const [options, setOptions] = useState([]);
	const [multiValue, setMultiValue] = useState(users);
  useEffect(() => {
    if (!loading) {
      getUserSearch(accessToken, "").then((res) => setOptions(res.map(u => ({value: u.id, label: u.name}))));
    }
	}, []);
	
	function handleChange(newValue: any, actionMeta: any) {
		if (!newValue) {
			newValue = [];
		}
    onUsersUpdated(newValue, identity);
		setMultiValue(newValue);
	}

	function isValidNewOption(inputValue) {
		return options.filter(u => u.label && inputValue.toLowerCase() === u.label.toLowerCase()).length == 0;
	}

	return (
		<div style={{position: 'relative', width: '100%'}}>
			<div style={{width: '100%'}}>
				<CreatableSelect
					isClearable
					placeholder={placeholder}
					isMulti={isMulti}
					options={options}
					onChange={handleChange}
					isValidNewOption={isValidNewOption}
					value={multiValue}
				/>
			</div>
		</div>
	);
}

export default UserSelector;
