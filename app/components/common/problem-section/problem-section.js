import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import { Form, FormGroup, FormControl, DropdownButton, MenuItem, Well } from 'react-bootstrap';

var ProblemSection = createClass({
	displayName: 'ProblemSection',
	propTypes: {
		label: PropTypes.string
	},
	getInitialState() {
    return {
      sections: this.props.sections
    };
	},
  onNumberOfSectionsChange(num) {
    var sections = this.state.sections? this.state.sections : [];
    while (num > sections.length) {
      sections.push({id: -1, nr: sections.length+1, grade: null, description: null});
    }
    while (num < sections.length) {
      sections.pop();
    }
    this.setState({sections});
  },
	render() {
    const sections = this.state.sections.map((s, i) => {
      return (
        <Form componentClass="fieldset" inline key={i}>
          <FormGroup controlId="formNr">
            <FormControl type="number" value={s.nr} />
          </FormGroup>{' '}
          <FormGroup controlId="formDescription">
            <FormControl type="text" value={s.description} />
          </FormGroup>
        </Form>
      )
    });

		return (
      <Well>
        <FormGroup controlId="formControlsNumSections">
          <DropdownButton title={this.state.sections? this.state.sections.length : 1} id="bg-nested-dropdown">
            <MenuItem key={1} eventKey={1} onSelect={this.onNumberOfSectionsChange.bind(this, 1)}>1</MenuItem>
            <MenuItem key={2} eventKey={2} onSelect={this.onNumberOfSectionsChange.bind(this, 2)}>2</MenuItem>
            <MenuItem key={3} eventKey={3} onSelect={this.onNumberOfSectionsChange.bind(this, 3)}>3</MenuItem>
            <MenuItem key={4} eventKey={4} onSelect={this.onNumberOfSectionsChange.bind(this, 4)}>4</MenuItem>
            <MenuItem key={5} eventKey={5} onSelect={this.onNumberOfSectionsChange.bind(this, 5)}>5</MenuItem>
            <MenuItem key={6} eventKey={6} onSelect={this.onNumberOfSectionsChange.bind(this, 6)}>6</MenuItem>
            <MenuItem key={7} eventKey={7} onSelect={this.onNumberOfSectionsChange.bind(this, 7)}>7</MenuItem>
            <MenuItem key={8} eventKey={8} onSelect={this.onNumberOfSectionsChange.bind(this, 8)}>8</MenuItem>
            <MenuItem key={9} eventKey={9} onSelect={this.onNumberOfSectionsChange.bind(this, 9)}>9</MenuItem>
            <MenuItem key={10} eventKey={10} onSelect={this.onNumberOfSectionsChange.bind(this, 10)}>10</MenuItem>
          </DropdownButton>
        </FormGroup>
        {sections}
      </Well>
		);
	}
});

module.exports = ProblemSection;
