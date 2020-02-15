import React, { useState, useRef, useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Droppable } from 'react-beautiful-dnd'
import cx from 'classnames'
import DayTask from './DayTask'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { FirebaseContext } from '../Firebase'
import { createTaskAction } from '../../redux/tasks'
import { DAY } from '../../constants/task-types'
import { getTodos } from '../Tasks/utils'

import styles from './styles.module.scss'

function DayTasks({ subtype, id, className, ...rest }) {
  const [isInAddMode, setAddMode] = useState(false)
  const addTextareaRef = useRef(null)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)
  const tasks = useSelector(state =>
    getTodos(state, DAY, id).filter(t => t.subtype === subtype),
  )
  const parentGradient = useSelector(({ UI, tasks }) => {
    const [parent] = UI.selectedTree

    if (parent) return tasks.find(t => t.id === parent).backgroundGradient

    return 'linear-gradient(to bottom, #e2e2e2, #bbb)'
  })

  useEffect(() => {
    if (isInAddMode) {
      addTextareaRef.current.focus()
    }
  }, [isInAddMode])

  function addTask(value) {
    if (value) {
      dispatch(
        createTaskAction({
          type: DAY,
          text: value,
          subtype,
          firebase,
          id,
        }),
      )
    }
    setAddMode(false)
  }

  return (
    <div className={cx(styles.DayTaskBox, className)} {...rest}>
      <div className={styles.Header}>
        <h4>{subtype.toLowerCase()}</h4>
        <button
          type="button"
          onClick={() => {
            setAddMode(true)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341.4 341.4">
            <path
              d="M192 149.4V0h-42.6v149.4H0V192h149.4v149.4H192V192h149.4v-42.6z"
              fill="#616161"
            />
          </svg>
        </button>
      </div>
      <Droppable droppableId={subtype}>
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.TaskList}
          >
            {tasks.map((task, index) => (
              <DayTask key={task.id} index={index} {...task} />
            ))}
            {provided.placeholder}
            {isInAddMode && (
              <li>
                <TaskMark
                  id="new-task"
                  done={false}
                  gradient={parentGradient}
                />
                <Textarea
                  ref={addTextareaRef}
                  className={styles.DayTaskField}
                  onEnterPress={addTask}
                  onBlur={addTask}
                  needClear
                />
              </li>
            )}
          </ul>
        )}
      </Droppable>
    </div>
  )
}

export default DayTasks
