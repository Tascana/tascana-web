import React from 'react'
import TaskBox from '../TaskBox'
import { animated } from 'react-spring'
import { useLineSwipe } from './useLineSwipe'

import classes from './styles.module.scss'

import '../app.css'
import { DirectionChangeContainer } from './directionChangeContainer'

export const HorizontalUI = props => {
  const animatedContainer = React.useRef(null)
  const { springs, bind, style, items, changeDirection } = useLineSwipe({
    ...props,
    animatedContainer,
  })

  return (
    <>
      <DirectionChangeContainer
        onChangeDirection={changeDirection}
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
              <TaskBox type={props.type} id={items[i].id} />
            </div>
          </animated.div>
        ))}
      </animated.div>
    </>
  )
}
