import '../app.css'
import React from 'react'
import HorizontalUI from './HorizontalUI'
import { useShortcutSwipe } from './useShortcutSwipe'
import { YEAR, MONTH, DAY } from '../../constants/task-types'

import styles from './styles.module.scss'

function Lines() {
  const { onScroll, line } = useShortcutSwipe()

  return (
    <main className={styles.Wrapper}>
      <HorizontalUI type={YEAR} onScroll={onScroll} swipeableLine={line} />
      <HorizontalUI type={MONTH} onScroll={onScroll} swipeableLine={line} />
      <HorizontalUI type={DAY} onScroll={onScroll} swipeableLine={line} />
    </main>
  )
}

export default Lines
