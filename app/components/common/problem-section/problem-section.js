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
      sections: this.props.sections,
      grades: this.props.grades
    };
	},
  onNumberOfSectionsChange(num) {
    var sections = this.state.sections? this.state.sections : [];
    while (num > sections.length) {
      sections.push({id: sections.length*-1, nr: sections.length+1, grade: 'n/a', description: null});
    }
    while (num < sections.length) {
      sections.pop();
    }
    this.setState({sections});
  },
  onNrChanged(id, e) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.nr = e.target.value;
    this.setState({sections});
  },
  onGradeChanged(id, grade) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.grade = grade;
    this.setState({sections});
  },
  onDescriptionChanged(id, e) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.description = e.target.value;
    this.setState({sections});
  },
	render() {
    const sections = this.state.sections && this.state.sections.length > 1 && this.state.sections.map((s, i) => {
      return (
        <Form componentClass="fieldset" inline key={i}>
          <FormGroup controlId="formNr">
            <FormControl type="number" value={s.nr} onChange={this.onNrChanged.bind(this, s.id)} style={{width: '100px'}} />
          </FormGroup>{' '}
          <FormGroup controlId="formGrade">
            <DropdownButton title={s.grade} id="bg-nested-dropdown">
              {this.state.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onGradeChanged.bind(this, s.id, g.grade)}>{g.grade}</MenuItem> })}
            </DropdownButton>
          </FormGroup>{' '}
          <FormGroup controlId="formDescription">
            <FormControl type="text" value={s.description} onChange={this.onDescriptionChanged.bind(this, s.id)} style={{width: '100%'}} />
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
            <MenuItem key={11} eventKey={11} onSelect={this.onNumberOfSectionsChange.bind(this, 11)}>11</MenuItem>
            <MenuItem key={12} eventKey={12} onSelect={this.onNumberOfSectionsChange.bind(this, 12)}>12</MenuItem>
            <MenuItem key={13} eventKey={13} onSelect={this.onNumberOfSectionsChange.bind(this, 13)}>13</MenuItem>
            <MenuItem key={14} eventKey={14} onSelect={this.onNumberOfSectionsChange.bind(this, 14)}>14</MenuItem>
            <MenuItem key={15} eventKey={15} onSelect={this.onNumberOfSectionsChange.bind(this, 15)}>15</MenuItem>
            <MenuItem key={16} eventKey={16} onSelect={this.onNumberOfSectionsChange.bind(this, 16)}>16</MenuItem>
            <MenuItem key={17} eventKey={17} onSelect={this.onNumberOfSectionsChange.bind(this, 17)}>17</MenuItem>
            <MenuItem key={18} eventKey={18} onSelect={this.onNumberOfSectionsChange.bind(this, 18)}>18</MenuItem>
            <MenuItem key={19} eventKey={19} onSelect={this.onNumberOfSectionsChange.bind(this, 19)}>19</MenuItem>
            <MenuItem key={20} eventKey={20} onSelect={this.onNumberOfSectionsChange.bind(this, 20)}>20</MenuItem>
          </DropdownButton>
        </FormGroup>
        {sections}
      </Well>
		);
	}
});

module.exports = ProblemSection;
