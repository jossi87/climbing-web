import React, { useState } from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { convertFromDateToString, convertFromStringToDate, postTicks } from './../../../api';
import { Button, Dropdown, Icon, Modal, Form, TextArea } from 'semantic-ui-react';

function convertDateToString(newDate) {
  var now = new Date();
  if (newDate > now) {
    newDate = now;
  }
  if (newDate) {
    return convertFromDateToString(newDate);
  }
  return null;
}

const TickModal = ({ open, onClose, accessToken, idTick, idProblem, grades, comment: initialComment, grade: initialGrade, stars: initialStars, date: initialDate }) => {
  const [comment, setComment] = useState(initialComment);
  const [grade, setGrade] = useState(initialGrade);
  const [stars, setStars] = useState(initialStars);
  const [date, setDate] = useState(idTick==-1? convertFromDateToString(new Date()) : initialDate);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);

  //@ts-ignore
  let dayPicker = <DayPickerInput
    format="LL"
    onDayChange={(newDate) => {setDate(convertFromDateToString(newDate))}}
    value={date && convertFromStringToDate(date)}
  />

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Tick</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Date (yyyy-mm-dd)</label>
              {dayPicker}<br/>
              <Button.Group>
                <Button onClick={() => setDate(convertDateToString(yesterday))}>Yesterday</Button>
                <Button onClick={() => setDate(convertDateToString(new Date()))}>Today</Button>
              </Button.Group>
            </Form.Field>
            <Form.Field>
              <label>Grade</label>
              <Dropdown selection value={grade} onChange={(e, data) => { setGrade(data.value) }} 
                options={grades.map((g, i) => ({key: i, text: g.grade, value: g.grade}))}
              />
            </Form.Field>
            <Form.Field>
              <label>Stars</label>
              <Dropdown selection value={stars} onChange={(e, data) => { setStars(data.value) }} 
                options={[
                  {key: 0, value: 0, text: <><Icon name="star outline" /><Icon name="star outline" /><Icon name="star outline" /> Zero stars</>},
                  {key: 1, value: 1, text: <><Icon name="star" /><Icon name="star outline" /><Icon name="star outline" /> Nice</>},
                  {key: 2, value: 2, text: <><Icon name="star" /><Icon name="star" /><Icon name="star outline" /> Very nice</>},
                  {key: 3, value: 3, text: <><Icon name="star" /><Icon name="star" /><Icon name="star" /> Fantastic!</>},
                  {key: -1, value: -1, text: <i>No rating (not the same as zero stars, this will not be used to calculate average stars)</i>}
                ]}
              />
            </Form.Field>
            <Form.Field>
              <label>Comment</label>
              <TextArea placeholder='Comment' style={{ minHeight: 100 }} value={comment ? comment : ""} onChange={(e, data) => { setComment(data.value) }} />
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size="tiny">
          <Button color='black' onClick={onClose}>
            Cancel
          </Button>
          <Button.Or />
          {idTick>1 &&
            <>
              <Button
                negative
                icon='delete'
                labelPosition='right'
                content="Delete tick"
                onClick={() => {
                  postTicks(accessToken, true, idTick, idProblem, comment, date, stars, grade)
                  .then((response) => {
                    onClose();
                  })
                  .catch((error) => {
                    console.warn(error);
                    alert(error.toString());
                  });
                }}
              />
              <Button.Or />
            </>
          }
          <Button
            positive
            icon='checkmark'
            labelPosition='right'
            content="Save"
            onClick={() => {
              postTicks(accessToken, false, idTick, idProblem, comment, date, stars, grade)
              .then((response) => {
                onClose();
              })
              .catch((error) => {
                console.warn(error);
                alert(error.toString());
              });
            }}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default TickModal;
