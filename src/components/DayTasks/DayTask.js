import React, { useRef, useState, useEffect } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Draggable } from 'react-beautiful-dnd'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { separateClicks } from './separateClicks'
import ui from '../../redux/UI'
import { completeTask, deleteTask, editTask } from '../../redux/tasks'

import styles from './styles.module.scss'
import tasksStyles from '../Tasks/styles.module.scss'

function DayTask({ id, progress, background, text: textTask, index }) {
  const [isInEditMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const editTextareaRef = useRef(null)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const isSort = useSelector(state => state.UI.sort)

  useEffect(() => {
    if (isInEditMode) {
      editTextareaRef.current.focus()
      editTextareaRef.current.setSelectionRange(
        textTask.length,
        textTask.length,
      )
    }
  }, [isInEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

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
      {provided => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={e => {
            e.stopPropagation()

            separateClicks(e, {
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
            onClick={onDone}
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
            textTask
          )}
        </li>
      )}
    </Draggable>
  )
}

export default DayTask
