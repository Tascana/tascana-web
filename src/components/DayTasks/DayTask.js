import React, { useRef, useContext, useState, useEffect } from 'react'
import cx from 'classnames'
import { useDispatch } from 'react-redux'
import { Draggable } from 'react-beautiful-dnd'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { FirebaseContext } from '../Firebase'
import { separateClicks } from './separateClicks'
import ui from '../../redux/UI'
import {
  editTaskAction,
  doneTaskAction,
  removeTaskAction,
} from '../../redux/tasks'

import styles from './styles.module.scss'

function DayTask({ id, done, backgroundGradient, task: textTask, index }) {
  const [isInEditMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const editTextareaRef = useRef(null)
  const firebase = useContext(FirebaseContext)

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
    dispatch(doneTaskAction({ id, firebase }))
  }

  function onRemove() {
    dispatch(removeTaskAction({ id, firebase }))
  }

  function onEdit(value) {
    if (!value) {
      onRemove()
      setEditMode(false)
      return
    }

    dispatch(
      editTaskAction({
        updatedData: {
          task: value,
        },
        firebase,
        id,
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
              onClick: onDone,
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
            [styles.isDone]: done,
          })}
        >
          <TaskMark id={id} done={done} gradient={backgroundGradient} />{' '}
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
