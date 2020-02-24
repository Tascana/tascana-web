import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ProgressBar from './ProgressBar'
import { separateClicks } from './separateClicks'
import { useOnClickOutside } from './useOnClickOutside'
import ui, { selectTreeAction } from '../../redux/UI'
import {
  linkTasks,
  completeTask,
  deleteTask,
  editTask,
} from '../../redux/tasks'
import { getTasksBy } from '../../redux/utils'
import { YEAR, MONTH } from '../../constants/task-types'

import styles from './styles.module.scss'

import linkGrey from '../../assets/icons/link__grey.svg'
import linkWhite from '../../assets/icons/link__white.svg'
import smallAdd from '../../assets/icons/small-add.svg'
import checkWhite from '../../assets/icons/check__white.svg'
import checkGrey from '../../assets/icons/check__grey.svg'
import checkDone from '../../assets/icons/done.svg'

function TaskBox({ task, className = '', date, style = {}, ...rest }) {
  const [isEditMode, setEditMode_] = useState(false)
  const [isLinkMode, setLinkMode_] = useState(false)
  const [value, setValue] = useState(task.text)
  const [parentId, selectParentId] = useState(null)
  const textarea = useRef(null)
  const taskBox = useRef(null)
  const dispatch = useDispatch()

  const yearTasks = useSelector(state =>
    getTasksBy(state.tasks)({ type: YEAR, ...date }),
  )

  useOnClickOutside(taskBox, () => {
    if (isLinkMode) {
      if (parentId) dispatch(linkTasks({ childId: isLinkMode, parentId }))
      setLinkMode(false)
    }
  })

  useEffect(() => {
    if (isEditMode) {
      const taskTextLength = value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  function setEditMode(val) {
    setEditMode_(val)

    setTimeout(() => dispatch(ui.actions.setEditTask(val)), 10)
  }

  function setLinkMode(val) {
    setLinkMode_(val)

    setTimeout(() => dispatch(ui.actions.setLinkingTask(val)), 10)
  }

  function onClick(e) {
    if (task.type !== YEAR && !task.parents.length) return
    dispatch(selectTreeAction({ todo: task }))
  }

  function onDoubleClick(e) {
    setEditMode(true)
  }

  function onEdit() {
    setEditMode(false)
    if (value) {
      dispatch(
        editTask({
          id: task.id,
          updatedFields: {
            text: value,
          },
        }),
      )
    }
  }

  function onDone() {
    dispatch(completeTask(task.id))
  }

  function onRemove() {
    dispatch(deleteTask(task.id))
  }

  function renderActions(task) {
    if (!isLinkMode) {
      return (
        <>
          {task.type !== YEAR && !task.firstParentId && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()

                setLinkMode(task.id)
              }}
              className={styles.ActionButton}
            >
              <img src={task.progress === 100 ? linkWhite : linkGrey} alt="" />
            </button>
          )}
          {(task.firstParentId || task.type === YEAR) &&
            !(task.progress === 100 && task.type === MONTH) && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()

                  onDone()
                }}
                className={cx(styles.ActionButton, styles.DoneButton, {
                  [styles.Done]: task.progress === 100,
                })}
              >
                <img
                  src={
                    task.progress === 100
                      ? checkDone
                      : task.type === YEAR
                      ? checkWhite
                      : checkGrey
                  }
                  alt=""
                />
              </button>
            )}
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
            className={cx(styles.Parent, {
              [styles.isSelected]: parentId === t.id,
            })}
            style={{ backgroundImage: t.background }}
          ></li>
        ))}
        <li>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              dispatch(
                ui.actions.toggleAddMode({
                  on: true,
                  child: task.id,
                  type: YEAR,
                }),
              )
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
        className={cx(
          styles.TaskBox,
          {
            [styles.isMonth]: task.type === MONTH,
            [styles.isDone]: task.progress === 100,
          },
          className,
        )}
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
          backgroundImage:
            isLinkMode && parentId
              ? yearTasks.find(t => t.id === parentId).background
              : task.background,
          ...style,
        }}
        {...rest}
      >
        {isEditMode ? (
          <div className={styles.TaskText}>
            <textarea
              ref={textarea}
              spellCheck={false}
              maxLength={80}
              value={value}
              onChange={e => {
                setValue(e.target.value)
              }}
              onMouseDown={e => {
                e.stopPropagation()
              }}
              onKeyPress={e => {
                e.stopPropagation()
                if (e.key === 'Enter') onEdit()
              }}
              onBlur={() => {
                onEdit()
              }}
            />
          </div>
        ) : (
          <div className={styles.TaskText}>{value}</div>
        )}
        <ProgressBar progress={task.progress} />
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
