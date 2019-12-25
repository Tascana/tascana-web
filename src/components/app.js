import React, { useEffect, useState } from 'react'
import TaskBox from './task-box'
import { useDrag } from 'react-use-gesture'
import { useSpring, animated } from 'react-spring'
import { connect } from 'react-redux'
import './app.css'

function toPx(num) {
  return `${num}px`
}

function HorzUI({ type, num, dispatch, items0, UI }) {
  const animatedContainer = React.useRef()
  const dragging = React.useRef(false)

  const [items, setItems] = useState(items0)

  const offset = window.innerWidth
  //const offset = 630;

  const [{ x, scale, height }, set] = useSpring(() => ({
    from: {
      x: toPx(offset * 0),
      scale: 1,
      height: toPx(0),
    },
  }))

  const bind = useDrag(
    ({ down, first, last, movement: [x, y], direction: [dx], cancel }) => {
      const directionMultiplier = dx > 0 ? -1 : 1

      if (first) {
        animatedContainer.current.classList.add('noselect')
        dragging.current = true
      }

      if (last) {
        dragging.current = false
      }

      // Если свайп дальше трети экрана
      if (down && Math.abs(x) > window.innerWidth / 3) {
        cancel()
        set(i => {
          return {
            immediate: true,
            x: down
              ? toPx(x + offset * (i - 1 + (dx > 0 ? -1 : 1)))
              : toPx(0 + offset * (i - 1 + (dx > 0 ? -1 : 1))),
            scale: down ? 1.02 : 1,
          }
        })
        dispatch({ type: 'SET', tasktype: type, id: directionMultiplier })
        return
      }

      set(() => {
        return {
          x: down ? toPx(x + offset * 0) : toPx(0 + offset * 0),
          scale: down ? 1.02 : 1,
          display: 'block',
        }
      })
    },
    { dragDelay: true, event: { passive: true, capture: false } },
  )

  useEffect(() => {
    setTimeout(() => {
      const taskBoxHeight = toPx(
        animatedContainer.current.children[0].children[0].scrollHeight + 40,
      )
      set(() => ({
        height: taskBoxHeight,
      }))
    }, 1)
  }, [num, set])

  useEffect(() => {
    setItems(items0)
    console.log(type, ' ', dragging.current)

    function pos(dx) {
      items[dx > 0 ? 2 : 0] = items[1]
      switch (type) {
        case 'YEAR':
          items[1] = { id: { year: UI.year }, name: UI.year }
          break
        case 'MONTH':
          items[1] = {
            id: { year: UI.year, month: UI.month },
            name: translateMonth(UI.month, UI.year),
          }
          break
        case 'DAY':
          items[1] = {
            id: { year: UI.year, month: UI.month, day: UI.day },
            name: translateDay(new Date(UI.year, UI.month - 1, UI.day)),
          }
          break
      }
      setItems([...items])
      set(i => ({
        immediate: true,
        x: toPx(0 + offset * (0 + (dx > 0 ? -1 : 1))),
      }))
      setTimeout(
        dx => {
          set(i => ({
            x: toPx(0 + offset * 0),
          }))
          setTimeout(() => {
            setItems(items0)
          }, 500)
        },
        1,
        dx,
      )
    }

    // Jump year
    if (UI.year !== UI.prevyear && !dragging.current /*&& springs[0].x.done*/) {
      console.log(type, ' jump year ', UI.year)
      const dx = UI.prevyear - UI.year
      pos(dx)
      return
    }

    // Jump month
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
  }, [UI])

  function style() {
    //console.log(animatedContainer.current);
    return { height }
  }

  function tasktype() {
    switch (type) {
      case 'YEAR':
        return 'goals'
      case 'MONTH':
        return 'targets'
      case 'DAY':
        return 'tasks'
    }
  }

  return (
    <React.Fragment>
      <animated.div {...bind()} ref={animatedContainer} style={style()}>
        <animated.div
          style={{
            position: 'absolute',
            float: 'left',
            width: '630px',
            x,
            scale,
            display: 'block',
            height,
          }}
        >
          <div>
            <h1>
              {items[1].name}'s {tasktype()}
            </h1>
            <TaskBox type={type} id={items[1].id} />
          </div>
        </animated.div>
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

  return date.toLocaleDateString()
}

const mapStateToPropsHorzUI = (state, ownProps) => {
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
      break
    case 'MONTH':
      {
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
      break
    case 'DAY':
      {
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
      break
  }
}

export default function App() {
  const CHorzUI = connect(mapStateToPropsHorzUI)(HorzUI)
  //dispatch({type: 'ADD_TASK', text: "Testing", tasktype: 'YEAR', date: Date.now(), year: 0});
  return (
    <React.Fragment>
      <CHorzUI type={'YEAR'} />
      <CHorzUI type={'MONTH'} />
      <CHorzUI type={'DAY'} />
      {/*<h1>October's targets</h1>
            <HorzUI type={'MONTH'} />
            <h1>Today's tasks</h1>
    <HorzUI type={'DAY'}/>*/}
    </React.Fragment>
  )
}
