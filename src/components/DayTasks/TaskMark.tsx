// @ts-nocheck
import React from 'react'
import gradientParser from 'gradient-parser'

import styles from './styles.module.scss'

function TaskMark({ id, done, gradient, onClick }) {
  const [{ colorStops }] = gradientParser.parse(gradient)

  const [first, last] = colorStops.map(color => {
    if (color.type === 'hex') return '#' + color.value

    return `rgb(${color.value.join(',')})`
  })

  return (
    <svg
      role="button"
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={styles.TaskMark}
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="8" y2="16">
          <stop offset="0%" stopColor={first} />
          <stop offset="100%" stopColor={last} />
        </linearGradient>
      </defs>
      <path
        fillRule="nonzero"
        d={
          done
            ? 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z'
            : 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z'
        }
        fill={`url(#${id})`}
      />
    </svg>
  )
}

export default TaskMark
