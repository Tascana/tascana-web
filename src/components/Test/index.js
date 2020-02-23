import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDrag } from 'react-use-gesture'
import { animated, useSpring } from 'react-spring'
import {
  addYears,
  addMonths,
  addDays,
  getYear,
  getMonth,
  getDate,
  format,
  compareAsc,
} from 'date-fns/esm'
import { swipeSlice } from '../../redux/swipe'
import { YEAR, MONTH, DAY } from '../../constants/task-types'

const ANIMATION_TIME = 250
const OFFSET = window.innerWidth

function Swiper({ type, top }) {
  const date = useSelector(state => new Date(state.swipe.date))
  const swipeableLine = useSelector(state => state.swipe.swipeableLine)
  const prevDate = useSelector(state => new Date(state.swipe.prevDate))
  const dispatch = useDispatch()

  const month = getMonth(date)
  const year = getYear(date)
  const day = getDate(date)

  let changeDateFn

  if (type === 'YEAR') changeDateFn = addYears
  if (type === 'MONTH') changeDateFn = addMonths
  if (type === 'DAY') changeDateFn = addDays

  const [spring, set] = useSpring(() => ({ x: 0 }))
  const bind = useDrag(
    ({ down, cancel, movement: [x, y], direction: [dx] }) => {
      if (Math.abs(x) > OFFSET / 3) {
        cancel()
        set({
          x: spring.x.getValue() + OFFSET * (dx > 0 ? 1 : -1),
        })

        setTimeout(() => {
          set({
            immediate: true,
            x: spring.x.getValue() + OFFSET * (dx > 0 ? -1 : 1),
            opacity: 0,
          })
          dispatch(
            swipeSlice.actions.swipe({
              prevDate: format(date, 'yyyy-MM-dd'),
              date: format(changeDateFn(date, dx > 0 ? -1 : 1), 'yyyy-MM-dd'),
              swipeableLine: type,
            }),
          )
        }, ANIMATION_TIME)

        setTimeout(() => {
          set({
            x: 0,
            opacity: 1,
          })
        }, ANIMATION_TIME)
      } else {
        set({
          x: down ? x : 0,
        })
      }
    },
    {
      event: { passive: true, capture: false },
      threshold: 5,
      filterTaps: true,
      axis: 'x',
    },
  )

  const swipe = useCallback(() => {
    const dx = compareAsc(prevDate, date)

    set({
      x: spring.x.getValue() + window.innerWidth * dx,
    })

    setTimeout(() => {
      set({
        immediate: true,
        x: -(spring.x.getValue() + window.innerWidth * dx),
      })
    }, ANIMATION_TIME)

    setTimeout(() => {
      set({
        x: 0,
      })
    }, ANIMATION_TIME)
  }, [date, prevDate, set, spring.x])

  useEffect(() => {
    if (type === YEAR && swipeableLine !== YEAR) {
      swipe()
    }
  }, [year, type]) // eslint-disable-line

  useEffect(() => {
    if (type === MONTH && swipeableLine !== MONTH) {
      swipe()
    }
  }, [month, type]) // eslint-disable-line

  useEffect(() => {
    if (type === DAY && swipeableLine !== DAY) {
      swipe()
    }
  }, [day, type]) // eslint-disable-line

  return (
    <animated.div
      {...bind()}
      style={{
        position: 'absolute',
        top,
        width: 500,
        height: 200,
        backgroundColor: 'palevioletred',
        x: spring.x,
        opacity: spring.opacity,
      }}
    >
      {JSON.stringify(date)}
    </animated.div>
  )
}

export default () => (
  <>
    <Swiper type={YEAR} top={0} />
    <Swiper type={MONTH} top={500} />
    <Swiper type={DAY} top={1000} />
  </>
)
