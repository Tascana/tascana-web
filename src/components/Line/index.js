import React, { useState, useRef, useEffect } from 'react'
import { useSprings, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { useDispatch } from 'react-redux'
import TaskBox from '../TaskBox'
import { translateDay, translateMonth, extractHeight } from './utils'
import ui from '../../redux/ui'
import classes from './styles.module.scss'

const offset = window.innerWidth

function Line({ type, children, num, itemsOnPage, UI }) {
  const [items, setItems] = useState(itemsOnPage)

  const dispatch = useDispatch()

  const animatedRef = useRef()
  const draggingRef = useRef(false)

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
      const directionMultiply = dx > 0 ? -1 : 1

      if (first) {
        animatedRef.current.classList.add('noselect')
        draggingRef.current = true
      }

      if (last) {
        draggingRef.current = false
        animatedRef.current.classList.remove('noselect')
      }

      if (down && Math.abs(x) > window.innerWidth / 3) {
        cancel()

        set(i => {
          return {
            immediate: true,
            x: springs[i].x.value + offset * directionMultiply,
            scale: down ? 1.02 : 1,
            height:
              down && Math.abs(x) > 50
                ? Math.max(...extractHeight(animatedRef, x))
                : animatedRef.current.children[1 + directionMultiply]
                    .children[0].scrollHeight + 40,
          }
        })

        dispatch(
          ui.actions.set({
            tasktype: type,
            id: dx > 0 ? -1 : 1,
          }),
        )

        return
      }

      set(i => ({
        x: down ? x + offset * (i - 1) : 0 + offset * (i - 1),
        scale: down ? 1.02 : 1,
        display: i < 1 - 1 || i > 1 + 1 ? 'none' : 'block',
        height:
          down && Math.abs(x) > 50
            ? Math.max(...extractHeight(animatedRef, x))
            : animatedRef.current.children[1].children[0].scrollHeight + 40,
      }))
    },
    { dragDelay: true, event: { passive: true, capture: false } },
  )

  useEffect(() => {
    setTimeout(() => {
      set(i => {
        return {
          height: animatedRef.current.children[1].children[0].scrollHeight + 40,
        }
      })
    }, 1)
  }, [num]) // eslint-disable-line

  useEffect(() => {
    setItems(itemsOnPage)

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
              animatedRef.current.children[1].children[0].scrollHeight + 40,
          }))
          setTimeout(() => {
            setItems(itemsOnPage)
          }, 500)
        },
        1,
        dx,
      )
    }

    // Jump year
    if (UI.year !== UI.prevyear && !draggingRef.current) {
      const dx = UI.prevyear - UI.year
      pos(dx)
      return
    }

    // Jump month
    if (
      UI.month !== UI.prevmonth &&
      !draggingRef.current &&
      (type === 'MONTH' || type === 'DAY')
    ) {
      const dx = UI.prevmonth - UI.month
      pos(dx)
      return
    }
  }, [UI]) // eslint-disable-line

  function getStyle() {
    const h = springs[0]
    return { height: h.height }
  }

  function getTaskType() {
    switch (type) {
      case 'YEAR':
        return 'goals'
      case 'MONTH':
        return 'targets'
      case 'DAY':
        return 'tasks'
      default:
        break
    }
  }

  return (
    <animated.div
      {...bind()}
      ref={animatedRef}
      style={getStyle()}
      className={classes.wrapper}
    >
      {springs.map(({ x, scale, display, height }, index) => (
        <animated.div
          key={index}
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
              {items[index].name}'s {getTaskType()}
            </h1>
            <TaskBox type={type} id={items[index].id} />
          </div>
        </animated.div>
      ))}
    </animated.div>
  )
}

export default Line
