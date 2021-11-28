// @ts-nocheck
import '../app.css'
import React from 'react'
import HorizontalUI from './HorizontalUI'
import { useShortcutSwipe } from './useShortcutSwipe'
import { useDispatch } from 'react-redux'
import { selectTreeAction } from '../../redux/UI'
import { YEAR, MONTH, DAY } from '../../constants/task-types'

import styles from './styles.module.scss'

function Lines() {
  const { onScroll, line } = useShortcutSwipe()
  const dispatch = useDispatch()

  return (
    <main className={styles.Wrapper} onClick={() => dispatch(selectTreeAction({ todo: null }))}>
      <HorizontalUI type={YEAR} onScroll={onScroll} swipeableLine={line} />
      <HorizontalUI type={MONTH} onScroll={onScroll} swipeableLine={line} />
      <HorizontalUI type={DAY} onScroll={onScroll} swipeableLine={line} />
    </main>
  )
}

export default Lines
