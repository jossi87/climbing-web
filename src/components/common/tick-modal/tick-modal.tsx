import React, { useState, useCallback } from 'react';
import {
  convertFromDateToString,
  convertFromStringToDate,
  postTicks,
  useAccessToken,
} from './../../../api';
import { Button, Dropdown, Icon, Modal, Form, TextArea, Input } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { components } from '../../../@types/buldreinfo/swagger';

type Repeat = { date?: string; comment?: string };

type TickModalProps = {
  open: boolean;
  onClose: () => void;
  idTick: number;
  idProblem: number;
  grades: components['schemas']['Grade'][];
  comment: string;
  grade: string;
  gradeFa: string;
  gradeConsensus: string;
  stars: number;
  repeats: Repeat[] | undefined;
  date: string | undefined;
  enableTickRepeats: boolean;
};

const TickModal = ({
  open,
  onClose,
  idTick,
  idProblem,
  grades,
  comment: initialComment,
  grade: initialGrade,
  gradeFa,
  gradeConsensus,
  stars: initialStars,
  repeats: initialRepeats,
  date: initialDate,
  enableTickRepeats,
}: TickModalProps) => {
  const accessToken = useAccessToken();
  const [comment, setComment] = useState(initialComment ?? '');
  const [grade, setGrade] = useState(initialGrade);
  const [stars, setStars] = useState(initialStars);
  const [date, setDate] = useState<string | undefined>(
    idTick === -1 ? (convertFromDateToString(new Date()) ?? initialDate) : initialDate,
  );
  const [repeats, setRepeats] = useState(initialRepeats || []);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date();
  const validDate = !date || (convertFromStringToDate(date) ?? new Date()) <= today;

  const handleUpdateRepeat = useCallback(
    (index: number, field: 'date' | 'comment', value: string | Date | null | undefined) => {
      setRepeats((currentRepeats) => {
        const newRepeats = [...currentRepeats];
        const updatedRepeat = { ...newRepeats[index] };

        if (field === 'date') {
          updatedRepeat.date =
            value instanceof Date || value === null
              ? (convertFromDateToString(value as Date | null) ?? updatedRepeat.date)
              : (value as string | undefined);
        } else {
          updatedRepeat.comment = value as string;
        }
        newRepeats[index] = updatedRepeat;
        return newRepeats;
      });
    },
    [],
  );

  const handleDeleteRepeat = useCallback((repeatToDelete: Repeat) => {
    setRepeats((currentRepeats) => currentRepeats.filter((r) => r !== repeatToDelete));
  }, []);

  const handleAddRepeat = useCallback(() => {
    const newRepeat: Repeat = {
      date: convertFromDateToString(new Date()) ?? initialDate,
      comment: '',
    };
    setRepeats((currentRepeats) => [...currentRepeats, newRepeat]);
  }, [initialDate]);

  const saveTick = useCallback(
    (isDelete: boolean) => {
      if (stars === null || !validDate || isSaving) return;

      setApiError(null);
      setIsSaving(true);

      postTicks(accessToken, isDelete, idTick, idProblem, comment, date, stars, grade, repeats)
        .then(() => {
          onClose();
        })
        .catch((error) => {
          console.warn('Tick save/delete failed:', error);
          setApiError(error.toString());
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [
      accessToken,
      idTick,
      idProblem,
      comment,
      date,
      stars,
      grade,
      repeats,
      onClose,
      validDate,
      isSaving,
    ],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Tick</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Form loading={isSaving}>
            {apiError && (
              <div
                style={{
                  color: 'white',
                  backgroundColor: '#db2828',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                }}
              >
                <strong>Error:</strong> {apiError}
              </div>
            )}
            {validDate ? (
              <label>Date</label>
            ) : (
              <label style={{ color: 'red' }}>Date (cannot be in the future)</label>
            )}
            <Form.Group>
              <Form.Field error={!validDate}>
                <DatePicker
                  placeholderText='Click to select a date'
                  dateFormat='dd-MM-yyyy'
                  isClearable
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode='select'
                  selected={date ? convertFromStringToDate(date) : undefined}
                  onChange={(newDate: Date | null) =>
                    setDate(newDate ? convertFromDateToString(newDate) : undefined)
                  }
                />
              </Form.Field>
            </Form.Group>
            <Form.Field>
              <label>Grade</label>
              <Dropdown
                selection
                value={grade}
                onChange={(e, data) => {
                  setGrade(String(data.value));
                }}
                options={[
                  {
                    key: -1,
                    text: <i>I don&apos;t want to grade</i>,
                    value: 'No personal grade',
                  },
                  ...grades.map((g, i) => ({
                    key: i,
                    text: g.grade,
                    value: g.grade,
                  })),
                ]}
              />
              <small>
                <i>
                  FA grade: {gradeFa}, consensus grade: {gradeConsensus}
                </i>
              </small>
            </Form.Field>
            <Form.Field>
              {stars === null ? (
                <label style={{ color: 'red' }}>Rating (required)</label>
              ) : (
                <label>Rating</label>
              )}
              <Dropdown
                selection
                value={stars}
                selectOnBlur={false}
                onChange={(e, data) => {
                  setStars(Number(data.value));
                }}
                options={[
                  {
                    key: -1,
                    value: -1,
                    text: <i>I don&apos;t want to rate</i>,
                  },
                  {
                    key: 0,
                    value: 0,
                    text: (
                      <>
                        <Icon name='star outline' />
                        <Icon name='star outline' />
                        <Icon name='star outline' /> Zero stars
                      </>
                    ),
                  },
                  {
                    key: 1,
                    value: 1,
                    text: (
                      <>
                        <Icon name='star' />
                        <Icon name='star outline' />
                        <Icon name='star outline' /> Nice
                      </>
                    ),
                  },
                  {
                    key: 2,
                    value: 2,
                    text: (
                      <>
                        <Icon name='star' />
                        <Icon name='star' />
                        <Icon name='star outline' /> Very nice
                      </>
                    ),
                  },
                  {
                    key: 3,
                    value: 3,
                    text: (
                      <>
                        <Icon name='star' />
                        <Icon name='star' />
                        <Icon name='star' /> Fantastic!
                      </>
                    ),
                  },
                ]}
                error={stars === null}
              />
            </Form.Field>
            <Form.Field>
              <label>Comment</label>
              <TextArea
                placeholder='Comment'
                style={{ minHeight: 100 }}
                value={comment ? comment : ''}
                onChange={(e, data) => {
                  setComment(String(data.value));
                }}
              />
            </Form.Field>
            {enableTickRepeats && (
              <Form.Field>
                <label>
                  Repeats (enabled on ice climbing and multi pitches for logging additional ascents)
                </label>
                {repeats.map((r, index) => (
                  <Form.Group key={r.date ?? 'undated'} inline unstackable>
                    <Form.Field width={5}>
                      <DatePicker
                        placeholderText='Click to select a date'
                        dateFormat='dd-MM-yyyy'
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode='select'
                        selected={r.date ? convertFromStringToDate(r.date) : undefined}
                        onChange={(date: Date | null) => {
                          handleUpdateRepeat(index, 'date', date);
                        }}
                      />
                    </Form.Field>
                    <Form.Field width={10}>
                      <Input
                        fluid
                        placeholder='Comment'
                        value={r.comment ? r.comment : ''}
                        onChange={(e, data) => {
                          handleUpdateRepeat(index, 'comment', data.value);
                        }}
                      />
                    </Form.Field>
                    <Form.Field width={1}>
                      <Button
                        size='mini'
                        circular
                        icon='minus'
                        onClick={() => handleDeleteRepeat(r)}
                      />
                    </Form.Field>
                  </Form.Group>
                ))}
                <Button size='mini' circular icon='plus' onClick={handleAddRepeat} />
              </Form.Field>
            )}
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size='tiny'>
          <Button onClick={onClose}>Cancel</Button>
          <Button.Or />
          {idTick > 1 && (
            <>
              <Button
                negative
                icon='trash'
                labelPosition='right'
                content='Delete tick'
                onClick={() => saveTick(true)}
              />
              <Button.Or />
            </>
          )}
          <Button
            positive
            disabled={!!(stars === null || !validDate) || isSaving}
            icon='checkmark'
            labelPosition='right'
            content='Save'
            onClick={() => saveTick(false)}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

export default TickModal;
