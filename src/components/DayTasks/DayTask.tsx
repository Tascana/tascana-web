// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Draggable } from 'react-beautiful-dnd'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { ActionsBar, LinkParentBar } from '../TaskBoxes'
import { useOnClickOutside } from '../TaskBoxes/useOnClickOutside'
import ui, { selectTreeAction } from '../../redux/UI'
import { completeTask, deleteTask, editTask, linkTasks } from '../../redux/tasks'
import { MONTH } from '../../constants/task-types'

import styles from './styles.module.scss'
import tasksStyles from '../Tasks/styles.module.scss'
import { Spring } from '@react-spring/core'

import { useSpring, animated } from 'react-spring'

const _dragEl = document.getElementById('react-dnd-draggable')

function optionalPortal(styles, element) {
  if (styles.position === 'fixed') {
    return createPortal(element, _dragEl)
  }
  return element
}

function DayTask(props) {
  const { id, progress, background, text: textTask, index, firstParentId, date } = props

  const task = {
    ...props,
    date: undefined,
    index: undefined,
  }

  const [isInEditMode, setEditMode] = useState(false)
  const [isLinkMode, setLinkMode_] = useState(false)
  const [parentId, selectParentId] = useState(null)
  const dispatch = useDispatch()
  const editTextareaRef = useRef(null)
  const actionsBar = useRef(null)

  const tasks = useSelector(state => state.tasks)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const isSort = useSelector(state => state.UI.sort)

  const possibleParent = tasks.find(t => t.id === parentId)

  const [spring, set] = useSpring(() => ({
    x: 0,
    config: { duration: 100 },
  }))

  set({ x: selectedTree.length > 0 && !selectedTree.includes(id) ? 0.3 : 1 })

  useOnClickOutside(actionsBar, () => {
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
    if (isInEditMode) {
      editTextareaRef.current.focus()
      editTextareaRef.current.setSelectionRange(textTask.length, textTask.length)
    }
  }, [isInEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  function setLinkMode(val) {
    setLinkMode_(val)

    setTimeout(() => dispatch(ui.actions.setLinkingTask(val)), 10)
  }

  function onDone() {
    dispatch(completeTask(id))
  }

  function onRemove() {
    dispatch(deleteTask(id))
  }

  function onEdit(value) {
    const prevText = textTask

    setEditMode(false)
    if (value) {
      dispatch(
        editTask({
          id,
          updatedFields: {
            text: value,
          },
        }),
      )
    } else {
      if (window.confirm('Do you want to delete a task?')) {
        onRemove()
      } else {
        editTextareaRef.current.value = prevText
      }
    }
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) =>
        optionalPortal(
          provided.draggableProps.style,
          <animated.li
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            onDoubleClick={e => {
              e.stopPropagation()
              setEditMode(true)
            }}
            onClick={e => {
              e.stopPropagation()

              if (!e.currentTarget.getAttribute('clicked')) {
                if (isInEditMode || !firstParentId) return
                dispatch(selectTreeAction({ todo: task }))
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
            onContextMenu={e => {
              e.preventDefault()
              e.stopPropagation()

              dispatch(
                ui.actions.toggleContextMenu({
                  taskId: id,
                  position: {
                    x: e.clientX,
                    y: e.clientY,
                  },
                  handlers: {
                    onEdit: () => {
                      setEditMode(true)
                    },
                    onDone,
                    onRemove,
                  },
                }),
              )
            }}
            className={cx({
              [styles.isDone]: progress === 100,
              // [tasksStyles.BoxSelected]: selectedTree.includes(id),
              // [tasksStyles.BoxUnselected]: selectedTree.length > 0 && !selectedTree.includes(id),
              [tasksStyles.BoxSorted]: isSort,
            })}
            style={{ opacity: spring.x }}
          >
            <TaskMark
              onClick={e => {
                e.stopPropagation()
                onDone()
              }}
              id={id}
              done={progress === 100}
              gradient={possibleParent ? possibleParent.background : background}
            />{' '}
            {isInEditMode ? (
              <Textarea
                ref={editTextareaRef}
                className={styles.DayTaskField}
                defaultValue={textTask}
                onEnterPress={onEdit}
                onBlur={onEdit}
              />
            ) : (
              <>
                <p
                  className={cx(styles.DayTaskParagraph, {
                    [styles.isLinkMode]: isLinkMode,
                  })}
                >
                  {textTask}
                </p>
                <div
                  ref={actionsBar}
                  className={cx(styles.Actions, {
                    [styles.isLinkMode]: isLinkMode,
                  })}
                >
                  {isLinkMode ? (
                    <LinkParentBar
                      styles={styles}
                      task={task}
                      date={date}
                      setLinkMode={setLinkMode}
                      parentId={parentId}
                      selectParentId={selectParentId}
                      type={MONTH}
                      hasAddParentButton={false}
                    />
                  ) : (
                    <ActionsBar
                      task={task}
                      onLink={() => {
                        setLinkMode(id)
                      }}
                      onDone={onDone}
                      onContextMenu={e => {
                        e.preventDefault()
                        dispatch(
                          ui.actions.toggleContextMenu({
                            taskId: id,
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
              </>
            )}
          </animated.li>,
        )
      }
    </Draggable>
  )
}

export default DayTask
