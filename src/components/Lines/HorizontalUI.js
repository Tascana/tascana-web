import React from 'react'
import Tasks from '../Tasks'
import { animated } from 'react-spring'
import { useLineSwipe } from './useLineSwipe'

import classes from './styles.module.scss'

import '../app.css'
import { DirectionChangeContainer } from './directionChangeContainer'

export const HorizontalUI = props => {
  const animatedContainer = React.useRef(null)
  const { springs, bind, style, items, changeDirectionOnClick } = useLineSwipe({
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
            <Tasks type={props.type} id={items[i].id} title={items[i].name} />
          </animated.div>
        ))}
      </animated.div>
    </>
  )
}
