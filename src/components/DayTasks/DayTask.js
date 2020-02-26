import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Draggable } from 'react-beautiful-dnd'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { ActionsBar, LinkParentBar } from '../TaskBoxes'
import { useOnClickOutside } from '../TaskBoxes/useOnClickOutside'
import { separateClicks } from './separateClicks'
import ui, { selectTreeAction } from '../../redux/UI'
import {
  completeTask,
  deleteTask,
  editTask,
  linkTasks,
} from '../../redux/tasks'
import { MONTH } from '../../constants/task-types'

import styles from './styles.module.scss'
import tasksStyles from '../Tasks/styles.module.scss'

const _dragEl = document.getElementById('react-dnd-draggable')

function optionalPortal(styles, element) {
  if (styles.position === 'fixed') {
    return createPortal(element, _dragEl)
  }
  return element
}

function DayTask(props) {
  const {
    id,
    progress,
    background,
    text: textTask,
    index,
    firstParentId,
    date,
  } = props

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
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const isSort = useSelector(state => state.UI.sort)

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
      editTextareaRef.current.setSelectionRange(
        textTask.length,
        textTask.length,
      )
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
    if (!value) {
      onRemove()
      setEditMode(false)
      return
    }
    dispatch(
      editTask({
        id,
        updatedFields: {
          text: value,
        },
      }),
    )
    setEditMode(false)
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) =>
        optionalPortal(
          provided.draggableProps.style,
          <li
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            role="button"
            onClick={e => {
              e.stopPropagation()

              if (isInEditMode || !firstParentId) return

              separateClicks(e, {
                onClick: () => {
                  dispatch(selectTreeAction({ todo: task }))
                },
                onDoubleClick: () => {
                  setEditMode(true)
                },
              })
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
              [tasksStyles.BoxSelected]: selectedTree.includes(id),
              [tasksStyles.BoxUnselected]:
                selectedTree.length > 0 && !selectedTree.includes(id),
              [tasksStyles.BoxSorted]: isSort,
            })}
          >
            <TaskMark
              onClick={e => {
                e.stopPropagation()
                onDone()
              }}
              id={id}
              done={progress === 100}
              gradient={background}
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
                <p>{textTask}</p>
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
          </li>,
        )
      }
    </Draggable>
  )
}

export default DayTask
