import React from 'react'
import styles from './styles.module.scss'

function ProgressBar({ progress }) {
  return (
    <hr
      className={styles.ProgressBar}
      style={{ width: progress * 0.94 + 6 + '%' }}
    />
  )
}

export default ProgressBar
