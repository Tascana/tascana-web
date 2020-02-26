import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ProgressBar from './ProgressBar'
import ActionsBar from './ActionsBar'
import LinkParentBar from './LinkParentBar'
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
      dispatch(
        selectTreeAction({
          todo: null,
        }),
      )
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
          {isLinkMode ? (
            <LinkParentBar
              task={task}
              date={date}
              setLinkMode={setLinkMode}
              parentId={parentId}
              selectParentId={selectParentId}
            />
          ) : (
            <ActionsBar
              task={task}
              onLink={() => {
                setLinkMode(task.id)
              }}
              onDone={onDone}
              onContextMenu={e => {
                e.preventDefault()
                dispatch(
                  ui.actions.toggleContextMenu({
                    taskId: task.id,
                    position: {
                      x: e.clientX - 134 / 2,
                      y: e.clientY - 137,
                    },
                    handlers: {
                      onEdit: () => setEditMode(true),
                      onDone,
                      onRemove,
                    },
                  }),
                )
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default TaskBox
