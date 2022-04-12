import React, { useState, useEffect } from 'react';
import { Step, Dropdown, List, Segment, Checkbox } from 'semantic-ui-react';
import AccordionContainer from './accordion-container';
import { useLocalStorage } from '../../../utils/use-local-storage';

interface Row {
  element: any,
  areaName: string, sectorName: string,
  name: string, nr: number, gradeNumber: number, stars: number,
  numTicks: number, ticked: boolean,
  rock: string, subType: string,
  num: number, fa: boolean
}
enum GroupBy {
  rock, type
}
enum OrderBy {
  alphabetical, ascents, date, grade, number, rating
}

const ProblemList = ({ rows, isSectorNotUser, preferOrderByGrade }: { rows: Row[], isSectorNotUser: boolean, preferOrderByGrade: boolean }) => {
  const [data, setData] = useState(rows);
  const [hideTicked, setHideTicked] = useLocalStorage('hideTicked', false);
  const [onlyFa, setOnlyFa] = useLocalStorage('onlyFa', false);
  const [uniqueRocks, setUniqueRocks] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [groupByTitle, setGroupByTitle] = useState(null);
  const [groupBy, setGroupBy] = useLocalStorage('groupBy', null);
  const [orderBy, setOrderBy] = useState(null);
  const [sectorCustomOrderBy, setSectorCustomOrderBy] = useLocalStorage('orderBy', null);

  if (data == null || data.length === 0) {
    return null;
  }

  const orderByOptions = isSectorNotUser?
    [
      {key: OrderBy.alphabetical, text: OrderBy[OrderBy.alphabetical], value: OrderBy[OrderBy.alphabetical]},
      {key: OrderBy.ascents, text: OrderBy[OrderBy.ascents], value: OrderBy[OrderBy.ascents]},
      {key: OrderBy.grade, text: OrderBy[OrderBy.grade], value: OrderBy[OrderBy.grade]},
      {key: OrderBy.number, text: OrderBy[OrderBy.number], value: OrderBy[OrderBy.number]},
      {key: OrderBy.rating, text: OrderBy[OrderBy.rating], value: OrderBy[OrderBy.rating]}
    ]
  :
    [
      {key: OrderBy.alphabetical, text: OrderBy[OrderBy.alphabetical], value: OrderBy[OrderBy.alphabetical]},
      {key: OrderBy.date, text: OrderBy[OrderBy.date], value: OrderBy[OrderBy.date]},
      {key: OrderBy.grade, text: OrderBy[OrderBy.grade], value: OrderBy[OrderBy.grade]},
      {key: OrderBy.rating, text: OrderBy[OrderBy.rating], value: OrderBy[OrderBy.rating]}
    ]
  ;

  useEffect(() => {
    setData(rows);
    let newOrderBy = OrderBy.date;
    if (isSectorNotUser) {
      if (preferOrderByGrade) {
        newOrderBy = OrderBy.grade;
      }
      else {
        newOrderBy = OrderBy.number;
      }
    }
    if (isSectorNotUser && sectorCustomOrderBy !== undefined && sectorCustomOrderBy!=newOrderBy) {
      order(sectorCustomOrderBy); // Sort results and save state
    }
    else {
      setOrderBy(newOrderBy); // Results already sorted by newOrderBy, only update state
    }
    const rocks = rows.filter(p => p.rock).map(p => p.rock).filter((value, index, self) => self.indexOf(value) === index).sort();
    if (rocks.length>0 && rows.filter(p => !p.rock).length>0) {
      rocks.push("<Without rock>");
    }
    setUniqueRocks(rocks);
    let types = rows.map(p => p.subType).filter((value, index, self) => self.indexOf(value) === index).sort();
    setUniqueTypes(types);
    if (isSectorNotUser && rocks.length>0) {
      setGroupByTitle(GroupBy.rock);
      if (groupBy === undefined) {
        setGroupBy(true);
      }
    }
    else if (types && types.length>1) {
      setGroupByTitle(GroupBy.type);
      if (groupBy === undefined) {
        setGroupBy(false);
      }
    }
    else {
      setGroupByTitle(null);
      if (groupBy === undefined) {
        setGroupBy(false);
      }
    }
  }, [rows, isSectorNotUser, preferOrderByGrade]);

  function order(newOrderBy: OrderBy) {
    setOrderBy(newOrderBy);
    if (isSectorNotUser) {
      setSectorCustomOrderBy(newOrderBy);
    }
    let problems = data.sort((a, b) => {
      if (newOrderBy === OrderBy.alphabetical) {
        if (a.areaName != b.areaName) return a.areaName.localeCompare(b.areaName);
        else if (a.sectorName != b.sectorName) return a.sectorName.localeCompare(b.sectorName);
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.ascents) {
        if (a.numTicks != b.numTicks) return b.numTicks-a.numTicks;
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.date) {
        return a.num-b.num;
      } else if (newOrderBy === OrderBy.grade) {
        if (a.gradeNumber != b.gradeNumber) return b.gradeNumber-a.gradeNumber;
        else if (a.num && b.num && a.num!=b.num) return a.num-b.num;
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.number) {
        return a.nr-b.nr;
      } else if (newOrderBy === OrderBy.rating) {
        if (a.stars != b.stars) return b.stars-a.stars;
        else if (a.gradeNumber != b.gradeNumber) return b.gradeNumber-a.gradeNumber;
        else if (a.numTicks != b.numTicks) return b.numTicks-a.numTicks;
        return a.name.localeCompare(b.name);
      }
    });
    setData(problems);
  }

  const containsFa = data.filter(p => p.fa).length>0;
  const containsTicked = data.filter(p => p.ticked).length>0;

  let list;
  if (groupBy && groupByTitle != null && groupByTitle === GroupBy.rock) {
    let accordionRows = uniqueRocks.map(rock => {
      let rows = data.filter(p => ((rock==='<Without rock>' && !p.rock) || p.rock==rock) && (!containsTicked || !hideTicked || !p.ticked) && (!containsFa || !onlyFa || p.fa)).map(p => p.element);
      let label = rock + " (" + rows.length + ")";
      let content = <List selection>{rows}</List>;
      return (
        {label, length: rows.length, content}
      );
    });
    list = <AccordionContainer accordionRows={accordionRows}/>;
  } else if (groupBy && groupByTitle != null && groupByTitle === GroupBy.type) {
    let accordionRows = uniqueTypes.map(subType => {
      let rows = data.filter(p => p.subType==subType && (!containsTicked || !hideTicked || !p.ticked) && (!containsFa || !onlyFa || p.fa)).map(p => p.element);
      let label = subType + " (" + rows.length + ")";
      let content = <List selection>{rows}</List>;
      return (
        {label, length: rows.length, content}
      );
    });
    list = <AccordionContainer accordionRows={accordionRows}/>;
  }
  else {
    let elements = data.filter(p => (!containsTicked || !hideTicked || !p.ticked) && (!containsFa || !onlyFa || p.fa)).map(p => p.element);
    list = (
      <Segment attached="bottom">
        <List selection>
          {elements.length===0? <i>No data</i> : elements}
        </List>
      </Segment>
    )
  }
  
  return (
    <>
      <Step.Group attached="top" size="mini" unstackable fluid>
        <Step link onClick={() => document.getElementById('dropdownOrderBy').focus()}>
          <Step.Content>
            <Step.Title>Order by</Step.Title>
            <Step.Description>
              <Dropdown id="dropdownOrderBy" options={orderByOptions} value={OrderBy[orderBy]} onChange={(e, { value }) => order(OrderBy[value as keyof typeof OrderBy])} />
            </Step.Description>
          </Step.Content>
        </Step>
        {groupByTitle != null && 
          <Step link onClick={() => setGroupBy(!groupBy)}>
            <Step.Content>
              <Step.Title>Group by {GroupBy[groupByTitle]}</Step.Title>
              <Step.Description>
                <Checkbox toggle checked={groupBy} onClick={() => setGroupBy(!groupBy)} />
              </Step.Description>
            </Step.Content>
          </Step>
        }
        {isSectorNotUser && containsTicked && 
          <Step link onClick={() => setHideTicked(!hideTicked) }>
            <Step.Content>
              <Step.Title>Hide ticked</Step.Title>
              <Step.Description>
                <Checkbox toggle checked={hideTicked} onClick={() => setHideTicked(!hideTicked) } />
              </Step.Description>
            </Step.Content>
          </Step>
        }
        {!isSectorNotUser && containsFa && 
          <Step link onClick={() => setOnlyFa(!onlyFa)}>
            <Step.Content>
              <Step.Title>Only FA</Step.Title>
              <Step.Description>
                <Checkbox toggle checked={onlyFa} onClick={() => setOnlyFa(!onlyFa)} />
              </Step.Description>
            </Step.Content>
          </Step>
        }
      </Step.Group>
      {list}
    </>
  );
}

export default ProblemList;