import React, { useState, useEffect, forwardRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns/esm'
import ui from '../../redux/UI'
import { swipeSlice } from '../../redux/swipe'

import classes from './styles.module.scss'

const DatePickerTrigger = forwardRef(({ onClick }, ref) => {
  const uiState = useSelector(state => state.UI)
  const date = new Date(uiState.year, uiState.month - 1, uiState.day)

  return (
    <button className={classes.DatePickerTrigger} onClick={onClick} ref={ref}>
      {format(date, 'dd/MM/yyyy')}
    </button>
  )
})

function Datepicker() {
  const today = new Date()
  const dispatch = useDispatch()
  const dateFromStore = useSelector(state => new Date(state.swipe.date))

  const [startDate, setStartDate] = useState(today)
  const [isChanged, setIsChanged] = useState(false)

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
      swipeSlice.actions.swipe({
        virtualPrevDate: format(dateFromStore, 'yyyy-MM-dd'),
        virtualDate: format(date, 'yyyy-MM-dd'),
      }),
    )

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
    <DatePicker
      selected={startDate}
      onChange={date => {
        setStartDate(date)
        if (!isChanged) setIsChanged(true)
      }}
      customInput={<DatePickerTrigger />}
      dateFormat="dd/MM/yyyy"
    />
  )
}

export default Datepicker
