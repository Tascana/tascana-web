import React, { useEffect, useState, forwardRef } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { translateMonth, translateDay } from './util'
import { HorizontalUI } from './HorizontalUI'
import ui from '../../redux/UI'
import styles from './styles.module.scss'
import 'react-datepicker/dist/react-datepicker.css'
import '../app.css'

const mapStateToPropsHorzUI = (state, ownProps) => {
  // Here, prev/current/next sets of tasks are generated for a given date. Called on load and after Redux dispatch
  switch (ownProps.type) {
    case 'YEAR':
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: { year: state.UI.year - 1 },
            name: state.UI.year - 1,
          },
          { id: { year: state.UI.year }, name: state.UI.year },
          {
            id: { year: state.UI.year + 1 },
            name: state.UI.year + 1,
          },
        ],
        UI: state.UI,
      }
    case 'MONTH': {
      const date1 = new Date(state.UI.year, state.UI.month - 2, state.UI.day)
      const date2 = new Date(state.UI.year, state.UI.month - 1, state.UI.day)
      const date3 = new Date(state.UI.year, state.UI.month, state.UI.day)
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: { year: date1.getFullYear(), month: date1.getMonth() + 1 },
            name: translateMonth(date1),
          },
          {
            id: { year: date2.getFullYear(), month: date2.getMonth() + 1 },
            name: translateMonth(date2),
          },
          {
            id: { year: date3.getFullYear(), month: date3.getMonth() + 1 },
            name: translateMonth(date3),
          },
        ],
        UI: state.UI,
      }
    }
    case 'DAY': {
      const date1 = new Date(
        state.UI.year,
        state.UI.month - 1,
        state.UI.day - 1,
      )
      const date2 = new Date(state.UI.year, state.UI.month - 1, state.UI.day)
      const date3 = new Date(
        state.UI.year,
        state.UI.month - 1,
        state.UI.day + 1,
      )
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: {
              year: date1.getFullYear(),
              month: date1.getMonth() + 1,
              day: date1.getDate(),
            },
            name: translateDay(date1),
          },
          {
            id: {
              year: date2.getFullYear(),
              month: date2.getMonth() + 1,
              day: date2.getDate(),
            },
            name: translateDay(date2),
          },
          {
            id: {
              year: date3.getFullYear(),
              month: date3.getMonth() + 1,
              day: date3.getDate(),
            },
            name: translateDay(date3),
          },
        ],
        UI: state.UI,
      }
    }
    default:
      throw new Error('Line not specified')
  }
}

const CHorzUI = connect(mapStateToPropsHorzUI)(HorizontalUI)

const DatePickerTrigger = forwardRef(({ onClick, value }, ref) => {
  const uiState = useSelector(state => state.UI)
  const date = new Date(uiState.year, uiState.month - 1, uiState.day)

  return (
    <button className={styles.DatePickerTrigger} onClick={onClick} ref={ref}>
      {format(date, 'dd/MM/yyyy')}
    </button>
  )
})

function Lines() {
  const today = new Date()
  const dispatch = useDispatch()

  const [startDate, setStartDate] = useState(today)
  const [isChanged, setIsChanged] = useState(false)

  const uiState = useSelector(state => state.UI)
  const date = new Date(uiState.year, uiState.month - 1, uiState.day)

  useEffect(() => {
    if (!isChanged) return

    const date = new Date(startDate)

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    function getPrevMonth() {
      if (month === 1) return 12
      return month - 1
    }

    dispatch(
      ui.actions.changeDate({
        year,
        month,
        prevmonth: getPrevMonth(),
        day,
      }),
    )
  }, [startDate, isChanged]) // eslint-disable-line

  return (
    <main className={styles.Wrapper}>
      <div className={styles.Header}>
        <h2>{translateDay(date, 'MMMM d, yyyy')}</h2>
        <div>
          <DatePicker
            selected={startDate}
            onChange={date => {
              setStartDate(date)
              if (!isChanged) setIsChanged(true)
            }}
            customInput={<DatePickerTrigger />}
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>
      <CHorzUI type={'YEAR'} />
      <CHorzUI type={'MONTH'} />
      <CHorzUI type={'DAY'} />
    </main>
  )
}

export default Lines
