import React, {Component} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { convertFromDateToString, convertFromStringToDate, postTicks } from './../../../api';
import { Button, Dropdown, Icon, Modal, Form, TextArea } from 'semantic-ui-react';

class TickModal extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  refresh(props) {
    var date = null;
    if (props.date) {
      date = props.date;
    } else if (props.idTick==-1) {
      date = convertFromDateToString(new Date());
    }

    this.setState({
      idTick: props.idTick,
      idProblem: props.idProblem,
      date: date,
      comment: props.comment? props.comment : "",
      grade: props.grade,
      stars: props.stars? props.stars : 0,
      grades: props.grades
    });
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps);
  }

  onDateChanged(newDate) {
    this.setState({date: newDate? convertFromDateToString(newDate) : null});
  }

  onCommentChanged(e, data) {
    this.setState({comment: data.value});
  }

  onStarsChanged(e, data) {
    this.setState({stars: data.value});
  }

  onGradeChanged(e, data) {
    this.setState({grade: data.value});
  }

  delete(e) {
    postTicks(this.props.auth.getAccessToken(), true, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade)
    .then((response) => {
      this.props.onClose();
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  save(e) {
    postTicks(this.props.auth.getAccessToken(), false, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade)
    .then((response) => {
      this.props.onClose();
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  render() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);
    return (
      <Modal open={this.props.open} onClose={this.props.onClose.bind(this)}>
        <Modal.Header>Tick</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form>
              <Form.Field>
                <label>Date (yyyy-mm-dd)</label>
                <DayPickerInput
                  format="LL"
                  onDayChange={this.onDateChanged.bind(this)}
                  value={this.state && this.state.date && convertFromStringToDate(this.state.date)}
                /><br/>
                <Button.Group>
                  <Button onClick={this.onDateChanged.bind(this, yesterday)}>Yesterday</Button>
                  <Button onClick={this.onDateChanged.bind(this, new Date())}>Today</Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <label>Grade</label>
                <Dropdown selection value={this.state && this.state.grade} onChange={this.onGradeChanged.bind(this)} 
                  options={this.state && this.state.grades && this.state.grades.map((g, i) => ({key: i, text: g.grade, value: g.grade}))}
                />
              </Form.Field>
              <Form.Field>
                <label>Stars</label>
                <Dropdown selection value={this.state && this.state.stars} onChange={this.onStarsChanged.bind(this)} 
                  options={[
                    {key: 0, value: 0, text: "No stars"},
                    {key: 1, value: 1, text: <><Icon name="star" /> Nice</>},
                    {key: 2, value: 2, text: <><Icon name="star" /><Icon name="star" /> Very nice</>},
                    {key: 3, value: 3, text: <><Icon name="star" /><Icon name="star" /><Icon name="star" /> Fantastic!</>}
                  ]}
                />
              </Form.Field>
              <Form.Field>
                <label>Comment</label>
                <TextArea placeholder='Comment' style={{ minHeight: 100 }} value={this.state && this.state.comment} onChange={this.onCommentChanged.bind(this)} />
              </Form.Field>
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button.Group compact size="tiny">
            <Button color='black' onClick={this.props.onClose.bind(this)}>
              Cancel
            </Button>
            {this.state && this.state.idTick>1 &&
              <Button
                negative
                icon='delete'
                labelPosition='right'
                content="Delete tick"
                onClick={this.delete.bind(this)}
              />
            }
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content="Save"
              onClick={this.save.bind(this)}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default TickModal;
