import React from 'react'
import classes from './styles.module.scss'

function ProgressBar({ progress }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={classes.ProgressBar}
    >
      <defs>
        <clipPath id="clipPath">
          <rect x="0.5" y="0.5" rx="4.8" ry="4.8" width="99" height="99" />
        </clipPath>
      </defs>

      <rect x="0" y="98.5" width={progress * 0.94 + 6} height="1" />
    </svg>
  )
}

export default ProgressBar
