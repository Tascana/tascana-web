import React from 'react'
import cx from 'classnames'
import { YEAR, DAY } from '../../constants/task-types'

import styles from './styles.module.scss'

function ContextButton({ task, onClick }) {
  return (
    <button
      type="button"
      className={cx(styles.ActionButton, styles.ContextButton, {
        [styles.isNotYearTask]: task.type !== YEAR,
        [styles.isDone]: task.progress === 100,
      })}
      onClick={e => {
        e.stopPropagation()
        onClick(e)
      }}
    ></button>
  )
}

function LinkButton({ task, onClick }) {
  return (
    <button
      type="button"
      className={cx(styles.ActionButton, styles.LinkButton, {
        [styles.isNotYearTask]: task.type !== YEAR,
      })}
      onClick={e => {
        e.stopPropagation()
        onClick(e)
      }}
    ></button>
  )
}

function DoneButton({ task, onClick }) {
  return (
    <button
      type="button"
      className={cx(styles.ActionButton, styles.DoneButton, {
        [styles.isNotYearTask]: task.type !== YEAR,
        [styles.isDone]: task.progress === 100,
      })}
      onClick={e => {
        e.stopPropagation()
        onClick(e)
      }}
    ></button>
  )
}

function ActionsBar({ task, onContextMenu, onLink, onDone }) {
  let hasContextButton = true
  let hasLinkButton = task.type !== YEAR && !task.firstParentId
  let hasDoneButton = task.type !== DAY

  return (
    <>
      {hasContextButton && (
        <ContextButton task={task} onClick={onContextMenu} />
      )}
      {hasLinkButton && <LinkButton task={task} onClick={onLink} />}
      {hasDoneButton && <DoneButton task={task} onClick={onDone} />}
    </>
  )
}

export default ActionsBar
