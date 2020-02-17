import React, { useEffect, useRef } from 'react'
import { animated } from 'react-spring'
import { useInView } from 'react-intersection-observer'
import { useShortcuts } from 'react-shortcuts-hook'
import { useLineSwipe } from './useLineSwipe'
import Tasks from '../Tasks'
import classes from './styles.module.scss'

import '../app.css'
import { DirectionChangeContainer } from './directionChangeContainer'

export const HorizontalUI = props => {
  const animatedContainer = useRef(null)
  const [visibilityRef, inView] = useInView()

  const {
    springs,
    bind,
    style,
    items,
    changeDirectionOnClick,
    recalculateRowHeight,
  } = useLineSwipe({
    ...props,
    animatedContainer,
  })

  useEffect(() => {
    props.onScroll(props.type, inView)
  }, [inView, props])

  function swipeLine(dir) {
    if (props.swipeableLine === props.type) changeDirectionOnClick(dir)
  }

  useShortcuts(['ArrowLeft'], () => swipeLine(-1), [props.swipeableLine])

  useShortcuts(['ArrowRight'], () => swipeLine(1), [props.swipeableLine])

  return (
    <div ref={visibilityRef}>
      <DirectionChangeContainer
        onChangeDirection={changeDirectionOnClick}
        style={style()}
      />
      <animated.div
        className={classes.wrapper}
        {...bind()}
        ref={animatedContainer}
        style={style()}
      >
        {springs.map(({ x, scale, display, height }, i) => (
          <animated.div
            key={i}
            className={classes.Line}
            style={{
              x,
              scale,
              display,
              height,
            }}
          >
            <Tasks
              type={props.type}
              id={items[i].id}
              current={items[1].id}
              title={items[i].name}
              onRowHide={recalculateRowHeight}
              date={items[i].id}
            />
          </animated.div>
        ))}
      </animated.div>
    </div>
  )
}
