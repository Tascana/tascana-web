// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ProgressBar from './ProgressBar'
import ActionsBar from './ActionsBar'
import LinkParentBar from './LinkParentBar'
import { useOnClickOutside } from './useOnClickOutside'
import ui, { selectTreeAction } from '../../redux/UI'
import { linkTasks, completeTask, deleteTask, editTask, changeColor } from '../../redux/tasks'
import { getTasksBy } from '../../redux/utils'
import { YEAR, MONTH } from '../../constants/task-types'

import { useSpring, animated } from 'react-spring'

import styles from './styles.module.scss'

function TaskBox({ task, className = '', date, style = {}, shouldBeTransparent, ...rest }) {
  const [isEditMode, setEditMode_] = useState(false)
  const [isLinkMode, setLinkMode_] = useState(false)
  const [value, setValue] = useState(task.text)
  const [parentId, selectParentId] = useState(null)
  const textarea = useRef(null)
  const taskBox = useRef(null)
  const dispatch = useDispatch()

  const [spring, set] = useSpring(() => ({
    x: 0,
    config: { duration: 100 },
  }))

  set({ x: shouldBeTransparent ? 0.3 : 1 })

  const yearTasks = useSelector(state => getTasksBy(state.tasks)({ type: YEAR, ...date }))

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

  function onDone() {
    dispatch(completeTask(task.id))
  }

  function onRemove() {
    dispatch(deleteTask(task.id))
  }

  function onEdit() {
    const prevText = task.text

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
    } else {
      if (window.confirm('Do you want to delete a task?')) {
        onRemove()
      } else {
        setValue(prevText)
      }
    }
  }

  function returnContextMenuHandlers() {
    let handlerObj = {
      onEdit: () => setEditMode(true),
      onDone,
      onRemove,
    }

    if (task.type === 'MONTH') {
      return handlerObj
    }

    return {
      changeColor: () => {
        dispatch(changeColor(task.id))
      },
      ...handlerObj,
    }
  }

  return (
    <>
      <animated.div
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
              handlers: returnContextMenuHandlers(),
            }),
          )
        }}
        onDoubleClick={e => {
          e.stopPropagation()
          onDoubleClick(e)
        }}
        onClick={e => {
          e.stopPropagation()

          if (isEditMode) return

          if (!e.currentTarget.getAttribute('clicked')) {
            onClick(e)
          }
          e.currentTarget.setAttribute('clicked', true)

          setTimeout(
            e => {
              e.removeAttribute('clicked')
            },
            500,
            e.currentTarget,
          )
        }}
        style={{
          opacity: spring.x,
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
              autoFocus
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
        {task.progress !== 100 && <ProgressBar type={task.type} progress={task.progress} />}
        <div className={cx(styles.Actions, { [styles.isLinkMode]: isLinkMode })}>
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
                      y: e.clientY - 147,
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
      </animated.div>
    </>
  )
}

export default TaskBox
