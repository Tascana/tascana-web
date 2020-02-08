import 'react-datepicker/dist/react-datepicker.css'
import '../app.css'

import React, { useEffect, useState, forwardRef } from 'react'
import { connect, useDispatch } from 'react-redux'
import { useDrag } from 'react-use-gesture'
import { useSprings, animated } from 'react-spring'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import TaskBox from '../TaskBox'

import ui from '../../redux/UI'
import styles from './styles.module.scss'

/* eslint-disable default-case, eqeqeq, react-hooks/exhaustive-deps */

function HorzUI({ type, children, num, dispatch, items0, UI }) {
  function extractHeight(parent, dx) {
    var a = []
    parent.current.childNodes.forEach(i => {
      a.push(i.children[0].scrollHeight + 40)
    })
    return dx > 0 ? [a[0], a[1]] : [a[1], a[2]]
  }

  const animatedContainer = React.useRef() // Parent of the 3 task blocks

  const [items, setItems] = React.useState(items0) // Load blocks from Redux into state

  const dragging = React.useRef(false) // Defines which row is being dragged

  const offset = window.innerWidth

  const [springs, set] = useSprings(items.length, i => ({
    // Set up function for react-spring
    from: {
      x: offset * (i - 1),
      scale: 1,
      display: 'block',
      height: 'unset',
    },
  }))

  const bind = useDrag(
    ({ down, first, last, movement: [x, y], direction: [dx], cancel }) => {
      // Set up function for react-use-gestures
      if (UI.sort) return

      if (first) {
        dragging.current = true // set dragging bool for the row that is currently dragged
      }

      if (last) {
        dragging.current = false // disable dragging bool when the gesture is finished
      }

      if ((first || last) && x == 0) {
        animatedContainer.current.setAttribute('class', '') // removes 'noselect' class on click
      }

      if (Math.abs(x) > 0) {
        animatedContainer.current.setAttribute('class', 'noselect') // adds 'noselect' on drag begin
      }

      if (down && Math.abs(x) > window.innerWidth / 3) {
        // 1. when mouse offset is more than 1/3rd of the window
        cancel() // 2. cancel the gesture
        set(i => ({
          // 3. immediately change the current block to either one on the left, or one on the right
          immediate: true,
          x: springs[i].x.value + offset * (dx > 0 ? -1 : 1), // x position takes the current translation of the block and offsets it to the right or left
          height:
            down && Math.abs(x) > 50
              ? Math.max(...extractHeight(animatedContainer, x)) // takes max height from neighbours
              : animatedContainer.current.children[1 + (dx > 0 ? -1 : 1)]
                  .children[0].scrollHeight + 40, // takes height from the current row
        }))
        dispatch(ui.actions.set({ tasktype: type, id: dx > 0 ? -1 : 1 })) // 4. tell Redux to update all task blocks. See also line 287
        return // 8. after return useDrag will be called once more
      }
      set(i => ({
        // 8. this animates row by mouse offset or moves it back to zero
        x: down ? x + offset * (i - 1) : 0 + offset * (i - 1),
        display: i < 1 - 1 || i > 1 + 1 ? 'none' : 'block',
        height:
          down && Math.abs(x) > 50
            ? Math.max(...extractHeight(animatedContainer, x))
            : animatedContainer.current.children[1].children[0].scrollHeight +
              40,
      }))
    },
    { event: { passive: true, capture: false } },
  )

  useEffect(() => {
    setTimeout(() => {
      set(i => {
        return {
          height:
            animatedContainer.current.children[1].children[0].scrollHeight + 40,
        }
      })
    }, 1)
  }, [num]) // updates row height

  useEffect(() => {
    // 5. This function watches Redux to update all task blocks
    setItems(items0) // 5a. Update all blocks with info from Redux (could be a bug)
    console.log(type, ' ', dragging.current)
    animatedContainer.current.setAttribute('class', 'noselect') // add 'noselect' if it was removed

    // 6. on line 150
    // 7. on line 107
    // 8. on line 72-74

    function pos(dx) {
      // 7. this is called from jump year/month/day. This function handles animation of the dependent blocks
      items[dx > 0 ? 2 : 0] = items[1] // sets left or right block of the dependent row to the previous date
      switch (
        type // this sets the central block of the dependent row to the new date. 'type' is prop
      ) {
        case 'YEAR':
          items[1] = { id: { year: UI.year }, name: UI.year } // NB: UI prop is already updated, but the actual task block is not changed until setItems is called
          break
        case 'MONTH':
          items[1] = {
            id: { year: UI.year, month: UI.month }, // NB: Redux only sets year/month/day ID prop of the TaskBox, the actual data is retreived by TaskBox component itself.
            name: translateMonth(UI.month, UI.year),
          }
          break
        case 'DAY':
          items[1] = {
            id: { year: UI.year, month: UI.month, day: UI.day },
            name: translateDay(new Date(UI.year, UI.month - 1, UI.day)), // Naming function
          }
          break
        default:
          break
      }
      setItems([...items]) // update UI with the above changes
      set(i => ({
        // immediately offset the dependent row to the right or left
        immediate: true,
        x: springs[i].x.value + offset * (dx > 0 ? -1 : 1),
      }))
      setTimeout(
        dx => {
          // first timeout animates the dependent row back to 0 offset (i.e. reveals the new date)
          set(i => ({
            x: 0 + offset * (i - 1),
            height:
              animatedContainer.current.children[1].children[0].scrollHeight +
              40,
          }))
          setTimeout(() => {
            // second timeout updates previous and next dates to sequential
            setItems(items0)
          }, 500)
        },
        1,
        dx,
      )
    }

    // 6. Check if current row has changed AND that it is NOT dragged. Then update, if required

    // Jump year
    if (UI.year !== UI.prevyear && !dragging.current) {
      console.log(type, ' jump year ', UI.year)
      const dx = UI.prevyear - UI.year
      pos(dx)
      return
    }

    // Jump month or day
    if (
      UI.month !== UI.prevmonth &&
      !dragging.current &&
      (type === 'MONTH' || type === 'DAY')
    ) {
      console.log(type, ' jump month  ', UI.month)
      const dx = UI.prevmonth - UI.month
      pos(dx)
      return
    }

    if (
      UI.month !== UI.prevmonth &&
      !dragging.current &&
      (type === 'MONTH' || type === 'DAY')
    ) {
      console.log(type, ' jump month  ', UI.month)
      const dx = UI.prevmonth - UI.month
      pos(dx)
      return
    }
  }, [UI.year, UI.month, UI.day, UI.prevyear, UI.prevmonth, UI.prevday]) // handles changes in dates

  function style() {
    var h = springs[0]
    return { height: h.height, width: '630px', margin: 'auto' }
  }

  return (
    <React.Fragment>
      <animated.div {...bind()} ref={animatedContainer} style={style()}>
        {springs.map(({ x, scale, display, height }, i) => (
          <animated.div
            key={i}
            style={{
              position: 'absolute',
              float: 'left',
              width: '630px',
              x,
              scale,
              display,
              height,
            }}
          >
            <div>
              <h1>{items[i].name}</h1>
              <TaskBox type={type} id={items[i].id} />
            </div>
          </animated.div>
        ))}
      </animated.div>
    </React.Fragment>
  )
}

function translateYear(year) {
  return year
}

function translateMonth(month, year) {
  const now = new Date(Date.now())

  if (now.getMonth() + 1 === month && now.getFullYear() === year)
    return 'This month'

  now.setMonth(now.getMonth() - 1)
  if (
    now.getMonth() + 1 === month &&
    now.getFullYear() === (month - 1 < 1 ? year - 1 : year)
  )
    return 'Previous month'

  now.setMonth(now.getMonth() + 2)
  if (
    now.getMonth() + 1 === month &&
    now.getFullYear() === (month + 1 > 12 ? year + 1 : year)
  )
    return 'Next month'
  switch (month) {
    case 1:
      return 'January'
    case 2:
      return 'February'
    case 3:
      return 'March'
    case 4:
      return 'April'
    case 5:
      return 'May'
    case 6:
      return 'June'
    case 7:
      return 'July'
    case 8:
      return 'August'
    case 9:
      return 'September'
    case 10:
      return 'October'
    case 11:
      return 'November'
    case 12:
      return 'December'
  }
}

function translateDay(date: Date) {
  const now = new Date(Date.now())
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Today'

  now.setDate(now.getDate() - 1)
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Yesterday'

  now.setDate(now.getDate() + 2)
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
    return 'Tomorrow'

  return format(date, 'EEEE, d')
}

const mapStateToPropsHorzUI = (state, ownProps) => {
  // Here, prev/current/next sets of tasks are generated for a given date. Called on load and after Redux dispatch
  switch (ownProps.type) {
    case 'YEAR':
      return {
        num: Object.keys(state.tasks).length,
        items0: [
          {
            id: { year: state.UI.year - 1 },
            name: translateYear(state.UI.year - 1),
          },
          { id: { year: state.UI.year }, name: translateYear(state.UI.year) },
          {
            id: { year: state.UI.year + 1 },
            name: translateYear(state.UI.year + 1),
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
            name: translateMonth(date1.getMonth() + 1, date1.getFullYear()),
          },
          {
            id: { year: date2.getFullYear(), month: date2.getMonth() + 1 },
            name: translateMonth(date2.getMonth() + 1, date2.getFullYear()),
          },
          {
            id: { year: date3.getFullYear(), month: date3.getMonth() + 1 },
            name: translateMonth(date3.getMonth() + 1, date3.getFullYear()),
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
  }
}

const CHorzUI = connect(mapStateToPropsHorzUI)(HorzUI)

const DatePickerTrigger = forwardRef(({ onClick }, ref) => (
  <button className={styles.DatePickerTrigger} onClick={onClick} ref={ref}>
    {format(new Date(), 'dd/MM/yyyy')}
  </button>
))

function Lines() {
  const today = new Date()
  const dispatch = useDispatch()

  const [startDate, setStartDate] = useState(today)

  useEffect(() => {
    const date = new Date(startDate)

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    dispatch(
      ui.actions.changeDate({
        year,
        month,
        day,
      }),
    )
  }, [startDate])

  return (
    <main className={styles.Wrapper}>
      <div className={styles.Header}>
        <h2>Today</h2>
        <div>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
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
