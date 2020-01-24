import React, { useEffect } from 'react'
import TaskBox from '../TaskBox'
import { useDrag } from 'react-use-gesture'
import { useSprings, animated } from 'react-spring'
import { connect } from 'react-redux'
import '../app.css'

import ui from '../../redux/UI'
import classes from './styles.module.scss'

/* eslint-disable default-case, react-hooks/exhaustive-deps */

function HorzUI({ type, children, num, dispatch, items0, UI }) {
  function extractHeight(parent, dx) {
    var a = []
    parent.current.childNodes.forEach(i => {
      a.push(i.children[0].scrollHeight + 40)
    })
    return dx > 0 ? [a[0], a[1]] : [a[1], a[2]]
  }

  const animatedContainer = React.useRef()

  const [items, setItems] = React.useState(items0)

  const dragging = React.useRef(false)

  const offset = window.innerWidth

  const [springs, set] = useSprings(items.length, i => ({
    from: {
      x: offset * (i - 1),
      scale: 1,
      display: 'block',
      height: 'unset',
    },
  }))

  const bind = useDrag(
    ({ down, first, last, movement: [x, y], direction: [dx], cancel }) => {
      if(first) { 
            dragging.current = true; 
      }
      
      if(last) {
            dragging.current = false;
      }
      
      if((first || last) && x==0) {
            animatedContainer.current.setAttribute("class", "");
      }
      
      if(Math.abs(x)>0) {
            animatedContainer.current.setAttribute("class", "noselect");
      }

      if (down && Math.abs(x) > window.innerWidth / 3) {
        cancel()
        set(i => ({
          immediate: true,
          x: springs[i].x.value + offset * (dx > 0 ? -1 : 1),
          scale: down ? 1.02 : 1,
          height:
            down && Math.abs(x) > 50
              ? Math.max(...extractHeight(animatedContainer, x))
              : animatedContainer.current.children[1 + (dx > 0 ? -1 : 1)]
                  .children[0].scrollHeight + 40,
        }))
        dispatch(ui.actions.set({ tasktype: type, id: dx > 0 ? -1 : 1 }))
        return
      }
      set(i => ({
        x: down ? x + offset * (i - 1) : 0 + offset * (i - 1),
        scale: down ? 1.02 : 1,
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
    setItems(items0)
    console.log(type, ' ', dragging.current)
    animatedContainer.current.setAttribute("class", "noselect");
    
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
        default:
          break
      }
      setItems([...items])
      set(i => ({
        immediate: true,
        x: springs[i].x.value + offset * (dx > 0 ? -1 : 1),
      }))
      setTimeout(
        dx => {
          set(i => ({
            x: 0 + offset * (i - 1),
            height:
              animatedContainer.current.children[1].children[0].scrollHeight +
              40,
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
    if (UI.year !== UI.prevyear && !dragging.current) {
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
  }, [UI.year, UI.month, UI.day, UI.prevyear, UI.prevmonth, UI.prevday]) // handles changes in dates

  function style() {
    var h = springs[0]
    return { height: h.height }
  }

  function tasktype() {
    switch (type) {
      case 'YEAR':
        return 'goals'
      case 'MONTH':
        return 'targets'
      case 'DAY':
        return 'tasks'
      default:
        return
    }
  }

  return (
    <React.Fragment>
      <animated.div
        className={classes.wrapper}
        {...bind()}
        ref={animatedContainer}
        style={style()}
      >
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
              <h1>
                {items[i].name}'s {tasktype()}
              </h1>
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

export default function Lines() {
  const CHorzUI = connect(mapStateToPropsHorzUI)(HorzUI)
  return (
    <React.Fragment>
      <CHorzUI type={'YEAR'} />
      <CHorzUI type={'MONTH'} />
      <CHorzUI type={'DAY'} />
    </React.Fragment>
  )
}
