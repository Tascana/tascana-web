import React from 'react'
import Tasks from '../Tasks'
import { animated } from 'react-spring'
import { useLineSwipe } from './useLineSwipe'

import classes from './styles.module.scss'

import '../app.css'
import { DirectionChangeContainer } from './directionChangeContainer'

export const HorizontalUI = props => {
  const animatedContainer = React.useRef(null)
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

  return (
    <>
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
    </>
  )
}
