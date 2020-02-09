import React from 'react'
import { animated } from 'react-spring'
import styles from './styles.module.scss'

export const DirectionChangeContainer = ({ onChangeDirection, style }) => (
  <animated.div
    className={styles.DirectionChangeContainer}
    style={{ height: style.height }}
  >
    <div onClick={() => onChangeDirection(-1)} />
    <div onClick={() => onChangeDirection(1)} />
  </animated.div>
)
