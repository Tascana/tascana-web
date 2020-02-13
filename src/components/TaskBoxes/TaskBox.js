import React, { useState, useEffect, useRef, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ProgressBar from './ProgressBar'
import { FirebaseContext } from '../Firebase'
import { separateClicks } from './separateClicks'
import { useOnClickOutside } from './useOnClickOutside'
import ui, { selectTreeAction } from '../../redux/UI'
import {
  editTaskAction,
  doneTaskAction,
  removeTaskAction,
} from '../../redux/tasks'
import { YEAR } from '../../constants/task-types'

import styles from './styles.module.scss'

import link from '../../assets/icons/link.svg'
import smallAdd from '../../assets/icons/small-add.svg'
import check from '../../assets/icons/check.svg'
import checkDone from '../../assets/icons/done.svg'

function TaskBox({ task, className = '', style = {}, ...rest }) {
  const [isEditMode, setEditMode] = useState(false)
  const [isLinkMode, setLinkMode] = useState(false)
  const [value, setValue] = useState(task.task)
  const [parentId, selectParentId] = useState(null)
  const textarea = useRef(null)
  const taskBox = useRef(null)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  const yearTasks = useSelector(state =>
    state.tasks.filter(t => t.type === YEAR),
  )

  useOnClickOutside(taskBox, () => {
    if (isLinkMode) setLinkMode(false)
  })

  useEffect(() => {
    if (isEditMode) {
      const taskTextLength = value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  function onClick(e) {
    if (task.type !== YEAR && !task.parentId) return
    dispatch(selectTreeAction({ todo: task }))
  }

  function onDoubleClick(e) {
    setEditMode(true)
  }

  function onEdit() {
    setEditMode(false)
    if (value) {
      dispatch(
        editTaskAction({
          updatedData: {
            task: value,
          },
          firebase,
          id: task.id,
        }),
      )
    }
  }

  function onDone() {
    dispatch(doneTaskAction({ id: task.id, firebase }))
  }

  function onRemove() {
    dispatch(removeTaskAction({ id: task.id, firebase }))
  }

  function onLink() {
    dispatch(
      editTaskAction({
        updatedData: {
          parentId,
        },
        firebase,
        id: task.id,
      }),
    )
  }

  function renderActions(task) {
    if (!isLinkMode) {
      return (
        <>
          {task.type !== YEAR && !task.parentId && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()

                setLinkMode(true)
              }}
              className={styles.ActionButton}
            >
              <img src={link} alt="" />
            </button>
          )}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()

              onDone()
            }}
            className={cx(styles.ActionButton, styles.DoneButton, {
              [styles.Done]: task.done,
            })}
          >
            <img src={task.done ? checkDone : check} alt="" />
          </button>
        </>
      )
    }

    return (
      <ul className={styles.Links}>
        {yearTasks.map(t => (
          <li
            key={t.id}
            role="button"
            onClick={e => {
              e.stopPropagation()

              if (parentId === t.id) {
                selectParentId(null)
                return
              }

              selectParentId(t.id)
            }}
            className={cx({
              [styles.isSelected]: parentId === t.id,
            })}
            style={{ backgroundImage: t.backgroundGradient }}
          ></li>
        ))}
        <li>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onLink()
              setLinkMode(false)
            }}
          >
            <img src={smallAdd} alt="" />
          </button>
        </li>
      </ul>
    )
  }

  return (
    <>
      <div
        ref={taskBox}
        role="button"
        tabIndex="0"
        onKeyPress={e => {
          if (e.key === 'Enter') setEditMode(true)
        }}
        className={cx(styles.TaskBox, className)}
        onContextMenu={e => {
          e.preventDefault()
          e.stopPropagation()

          dispatch(
            ui.actions.toggleContextMenu({
              taskId: task.id,
              position: {
                x: e.clientX,
                y: e.clientY,
              },
              handlers: {
                onEdit: () => setEditMode(true),
                onDone,
                onRemove,
              },
            }),
          )
        }}
        onClick={e => {
          e.stopPropagation()

          if (isEditMode) return

          separateClicks(e, { onClick, onDoubleClick })
        }}
        style={{
          backgroundImage: task.backgroundGradient,
          ...style,
        }}
        {...rest}
      >
        {isEditMode ? (
          <textarea
            ref={textarea}
            spellCheck={false}
            maxLength={80}
            value={value}
            onChange={e => {
              setValue(e.target.value)
            }}
            onKeyPress={e => {
              e.stopPropagation()
              if (e.key === 'Enter') onEdit()
            }}
            onBlur={() => {
              onEdit()
            }}
          />
        ) : (
          <div className={styles.TaskText}>{value}</div>
        )}
        {!task.done && task.progress > 0 && task.progress < 100 && (
          <ProgressBar progress={task.progress} />
        )}
        <div
          className={cx(styles.Actions, { [styles.isLinkMode]: isLinkMode })}
        >
          {renderActions(task)}
        </div>
      </div>
    </>
  )
}

export default TaskBox
