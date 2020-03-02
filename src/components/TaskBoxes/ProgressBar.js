import React from 'react'
import styles from './styles.module.scss'
import { YEAR } from '../../constants/task-types'

function ProgressBar({ progress, type }) {
  if (type === YEAR) {
    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={styles.YearProgressBar}
      >
        <defs>
          <clipPath id="clipPath">
            <rect x="0.5" y="0.5" rx="4.8" ry="4.8" width="99" height="99" />
          </clipPath>
        </defs>

        <rect x="0" y="98" width={progress * 0.94 + 6} height="3" />
      </svg>
    )
  }
  return (
    <hr
      className={styles.ProgressBar}
      style={{ width: progress * 0.94 + 6 + '%' }}
    />
  )
}

export default ProgressBar
