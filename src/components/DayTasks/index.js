import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Droppable } from 'react-beautiful-dnd'
import cx from 'classnames'
import DayTask from './DayTask'
import TaskMark from './TaskMark'
import Textarea from './Textarea'
import { DAY } from '../../constants/task-types'

import { createTask } from '../../redux/tasks'
import { getTasksBy } from '../../redux/utils'

import styles from './styles.module.scss'

const GREY_BG = 'linear-gradient(to bottom, #e2e2e2, #bbb)'

function DayTasks({ subtype, date, className, ...rest }) {
  const [isInAddMode, setAddMode] = useState(false)
  const addTextareaRef = useRef(null)
  const dispatch = useDispatch()
  const tasks = useSelector(state =>
    getTasksBy(state.tasks)({ type: DAY, subtype, ...date }),
  )
  const parentGradient = useSelector(({ UI, tasks }) => {
    const [parent] = UI.selectedTree

    if (parent)
      return tasks.find(t => t.id === parent)
        ? tasks.find(t => t.id === parent).background
        : GREY_BG

    return GREY_BG
  })

  useEffect(() => {
    if (isInAddMode) {
      addTextareaRef.current.focus()
    }
  }, [isInAddMode])

  function addTask(value) {
    if (value) {
      dispatch(createTask({ type: DAY, subtype, text: value, ...date }))
    }
    setAddMode(false)
  }

  return (
    <Droppable droppableId={subtype}>
      {(provided, snapshot) => (
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
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.TaskList}
          >
            {tasks.map((task, index) => (
              <DayTask key={task.id} index={index} date={date} {...task} />
            ))}
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
            {provided.placeholder}
          </ul>
        </div>
      )}
    </Droppable>
  )
}

export default DayTasks
