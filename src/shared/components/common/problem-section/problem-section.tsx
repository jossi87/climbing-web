import React, {Component} from 'react';
import { Form, Segment, Input, Dropdown } from 'semantic-ui-react';

class ProblemSection extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {sections: props.sections, grades: props.grades};
  }
  
  onNumberOfSectionsChange(e, { value }) {
    const num = parseInt(value);
    var sections = null;
    if (num > 1) {
      sections = this.state.sections? this.state.sections : [];
      while (num > sections.length) {
        sections.push({id: sections.length*-1, nr: sections.length+1, grade: 'n/a', description: null});
      }
      while (num < sections.length) {
        sections.pop();
      }
    }
    this.props.onSectionsUpdated(sections);
    this.setState({sections});
  }

  onNrChanged(id, e, { value }) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.nr = parseInt(value);
    this.props.onSectionsUpdated(sections);
    this.setState({sections});
  }

  onGradeChanged(id, e, { value }) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.grade = value;
    this.props.onSectionsUpdated(sections);
    this.setState({sections});
  }

  onDescriptionChanged(id, e, { value }) {
    const sections = this.state.sections;
    const section = sections.find(s => s.id === id);
    section.description = value;
    this.props.onSectionsUpdated(sections);
    this.setState({sections});
  }

	render() {
		return (
      <Segment>
        <Dropdown selection value={this.state.sections? this.state.sections.length : 1} onChange={this.onNumberOfSectionsChange.bind(this)} options={[
          {key: 1, value: 1, text: 1},
          {key: 2, value: 2, text: 2},
          {key: 3, value: 3, text: 3},
          {key: 4, value: 4, text: 4},
          {key: 5, value: 5, text: 5},
          {key: 6, value: 6, text: 6},
          {key: 7, value: 7, text: 7},
          {key: 8, value: 8, text: 8},
          {key: 9, value: 9, text: 9},
          {key: 10, value: 10, text: 10},
          {key: 11, value: 11, text: 11},
          {key: 12, value: 12, text: 12},
          {key: 13, value: 13, text: 13},
          {key: 14, value: 14, text: 14},
          {key: 15, value: 15, text: 15},
          {key: 16, value: 16, text: 16},
          {key: 17, value: 17, text: 17},
          {key: 18, value: 18, text: 18},
          {key: 19, value: 19, text: 19},
          {key: 20, value: 20, text: 20},
        ]}/>
        {this.state.sections && this.state.sections.length > 1 && this.state.sections.map((s, i) => (
          <Form.Group widths='equal' key={i} inline>
            <Form.Field>
              <Input size="mini" icon="hashtag" iconPosition="left" fluid placeholder='Number' value={s.nr} onChange={this.onNrChanged.bind(this, s.id)} />
            </Form.Field>
            <Form.Field>
              <Dropdown size="mini" icon="dropdown" fluid selection value={s.grade} onChange={this.onGradeChanged.bind(this, s.id)}
                options={this.state.grades.map((g, i) => ({key: i, value: g.grade, text: g.grade}))}/>
            </Form.Field>
            <Form.Field>
              <Input size="mini" icon="info" iconPosition="left" fluid placeholder='Description' value={s.description? s.description : ""} onChange={this.onDescriptionChanged.bind(this, s.id)} />
            </Form.Field>
          </Form.Group>
        ))}
      </Segment>
		);
	}
}

export default ProblemSection;
