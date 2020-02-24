import '../app.css'
import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDrag } from 'react-use-gesture'
import { animated, useSpring } from 'react-spring'
import { useShortcuts } from 'react-shortcuts-hook'
import { useInView } from 'react-intersection-observer'
import {
  addYears,
  addMonths,
  addDays,
  getYear,
  getMonth,
  getDate,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
} from 'date-fns/esm'
import { DirectionChangeContainer } from './directionChangeContainer'
import Tasks from '../Tasks'
import { getDateObject, getName } from './util'
import { swipeSlice } from '../../redux/swipe'
import useWindowSize from './useWindowSize'
import { YEAR, MONTH, DAY } from '../../constants/task-types'

import styles from './styles.module.scss'

const ANIMATION_TIME = 350
const DATE_FORMAT = 'yyyy-MM-dd'

function HorizontalUI({
  type,
  swipeableLine: swipeableLineFromProps,
  onScroll,
}) {
  const [visibilityRef, inView] = useInView()
  const date = useSelector(state => new Date(state.swipe.date))
  const virtualDate = useSelector(state =>
    state.swipe.virtualDate ? new Date(state.swipe.virtualDate) : null,
  )
  const virtualPrevDate = useSelector(state =>
    state.swipe.virtualPrevDate ? new Date(state.swipe.virtualPrevDate) : null,
  )
  const UI = useSelector(state => state.UI)
  const dispatch = useDispatch()
  const tasksRef = useRef()

  const month = getMonth(date)
  const year = getYear(date)
  const day = getDate(date)

  const { width } = useWindowSize()

  let changeDateFn

  if (type === YEAR) changeDateFn = addYears
  if (type === MONTH) changeDateFn = addMonths
  if (type === DAY) changeDateFn = addDays

  const [spring, set] = useSpring(() => ({
    x: 0,
  }))
  const bind = useDrag(
    ({ down, cancel, movement: [x, y], direction: [dx] }) => {
      if (UI.sort) return

      if (Math.abs(x) > (width > 768 ? width / 3 : width / 2)) {
        cancel()
        dispatch(
          swipeSlice.actions.swipe({
            virtualPrevDate: format(date, DATE_FORMAT),
            virtualDate: format(
              changeDateFn(date, dx > 0 ? -1 : 1),
              DATE_FORMAT,
            ),
            changeType: 'SWIPE',
          }),
        )
      } else {
        set({
          x: down ? x : 0,
        })
      }
    },
    {
      threshold: 5,
      filterTaps: true,
      axis: 'x',
    },
  )

  useEffect(() => {
    set({
      height: tasksRef.current.scrollHeight + 40,
    })

    setTimeout(() => {
      set({
        height: tasksRef.current.scrollHeight + 40,
      })
    }, ANIMATION_TIME)
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onScroll(type, inView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  function swipe(pos, cb) {
    const dir = pos > 0 ? 1 : -1

    set({
      x: spring.x.getValue() + width * dir,
    })

    setTimeout(() => {
      set({
        immediate: true,
        x: -(width * dir),
        opacity: 0,
      })
    }, ANIMATION_TIME)

    setTimeout(() => {
      set({
        x: 0,
        opacity: 1,
      })
      cb()
    }, ANIMATION_TIME + 1)
  }

  useEffect(() => {
    const changedDays = differenceInCalendarDays(virtualDate, virtualPrevDate)
    const changedMonth = differenceInCalendarMonths(
      virtualDate,
      virtualPrevDate,
    )
    const changedYears = differenceInCalendarYears(virtualDate, virtualPrevDate)

    const changeDate = () => {
      dispatch(
        swipeSlice.actions.swipe({
          date: format(virtualDate, DATE_FORMAT),
          virtualDate: null,
          prevDate: format(virtualPrevDate, DATE_FORMAT),
          virtualPrevDate: null,
        }),
      )
    }

    if (changedYears && type === YEAR) {
      swipe(changedYears > 0 ? -1 : 1, changeDate)
    }

    if (changedMonth && type === MONTH) {
      swipe(changedMonth > 0 ? -1 : 1, changeDate)
    }

    if (changedDays && type === DAY) {
      swipe(changedDays > 0 ? -1 : 1, changeDate)
    }
  }, [virtualDate, virtualPrevDate]) // eslint-disable-line react-hooks/exhaustive-deps

  function changeDirectionOnClick(dx) {
    const isSelected = UI.selectedTree.length > 0
    const { isEditing, isLinking, sort } = UI
    if (!isEditing && !isSelected && !isLinking && !sort) {
      dispatch(
        swipeSlice.actions.swipe({
          virtualPrevDate: format(date, DATE_FORMAT),
          virtualDate: format(changeDateFn(date, dx > 0 ? 1 : -1), DATE_FORMAT),
        }),
      )
    }
  }

  function recalculateRowHeight() {
    setTimeout(() => {
      set(() => {
        return {
          height: tasksRef.current.scrollHeight + 40,
        }
      })
    }, 1)
  }

  function swipeLine(pos) {
    if (swipeableLineFromProps === type) changeDirectionOnClick(pos)
  }

  useShortcuts(['ArrowLeft'], () => swipeLine(-1), [
    swipeableLineFromProps,
    date,
  ])
  useShortcuts(['ArrowRight'], () => swipeLine(1), [
    swipeableLineFromProps,
    date,
  ])

  const dateObject = getDateObject(type, year, month, day)

  return (
    <div ref={visibilityRef}>
      <DirectionChangeContainer
        onChangeDirection={pos => changeDirectionOnClick(pos)}
        style={{
          height: spring.height,
          margin: 'auto',
          willChange: 'height',
        }}
      />
      <animated.div
        className={styles.wrapper}
        {...bind()}
        style={{
          height: spring.height,
          margin: 'auto',
          willChange: 'height',
        }}
      >
        <animated.div
          id={type}
          className={styles.Line}
          ref={tasksRef}
          style={{
            x: spring.x,
            opacity: spring.opacity,
            willChange: 'transform, opacity',
          }}
        >
          <Tasks
            type={type}
            id={dateObject}
            current={dateObject}
            title={getName(type, date)}
            onRowHide={recalculateRowHeight}
            date={dateObject}
          />
        </animated.div>
      </animated.div>
    </div>
  )
}

export default HorizontalUI
