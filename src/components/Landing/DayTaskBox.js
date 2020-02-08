import React, { useState, useRef, useEffect } from 'react'
import TextareaAutosize from 'react-autosize-textarea'
import nanoid from 'nanoid'
import cx from 'classnames'
import { separateClicks } from './separateClicks'
import styles from './styles.module.scss'

import * as types from '../../constants/task-types'

const DEFAULT = ''
const ADD = 'add'
const EDIT = 'edit'

const year = new Date().getFullYear()
const month = new Date().getMonth() + 1
const day = new Date().getDate()

function DayTaskBox({ subtype, tasks = [], setTasks, parentId, disabled }) {
  const [mode, setMode] = useState(DEFAULT)
  const [editedTaskId, setEditedTaskId] = useState(null)
  const [value, setValue] = useState('')
  const textarea = useRef(null)

  useEffect(() => {
    if (mode !== DEFAULT) {
      const taskTextLength = editedTaskId
        ? tasks.find(t => t.id === editedTaskId).task.length
        : value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function addTask() {
    console.log(tasks)
    setTasks([
      ...tasks,
      {
        task: value,
        done: false,
        type: types.DAY,
        subtype,
        id: nanoid(10),
        year,
        month,
        day,
        parentId,
        userId: '',
        createdAt: Date.now(),
        updatedAt: -1,
      },
    ])
    setValue('')
    setMode(DEFAULT)
  }

  function editTask(id, editedTaskText, type) {
    setTasks(
      tasks.map(task => {
        if (task.id === id) {
          return {
            ...task,
            task: editedTaskText,
            updatedAt: Date.now(),
          }
        }
        return task
      }),
    )

    if (type !== 'change') {
      setEditedTaskId(null)
      setMode(DEFAULT)
    }
  }

  function toggleDone(id) {
    setTasks(
      tasks.map(task => {
        if (task.id === id) {
          return {
            ...task,
            done: !task.done,
            updatedAt: Date.now(),
          }
        }
        return task
      }),
    )
  }

  const filteredTasks = tasks.filter(i => i.subtype === subtype)

  function renderMark(done) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
        <defs>
          <linearGradient
            id="gradient"
            gradientUnits="userSpaceOnUse"
            x1="6.5"
            y1="0"
            x2="6.5"
            y2="13"
          >
            <stop offset="0%" stopColor="#6146ff" />
            <stop offset="100%" stopColor="#9300ff" />
          </linearGradient>
        </defs>
        <path
          d="M13 6.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          fill="url(#gradient)"
        />
        <path
          d={
            done
              ? 'M9.75 6.5A3.25 3.25 0 016.5 9.75c-1.79 0-3.25-1.46-3.25-3.25 0-1.8 1.46-3.25 3.25-3.25 1.8 0 3.25 1.45 3.25 3.25z'
              : 'M12 6.5C12 9.54 9.53 12 6.5 12 3.46 12 1 9.54 1 6.5 1 3.47 3.46 1 6.5 1 9.53 1 12 3.47 12 6.5z'
          }
          fill="#fafafa"
        />
      </svg>
    )
  }

  return (
    <div className={styles.DayTaskBox}>
      <div className={styles.Header}>
        <h4>{subtype.toLowerCase()}</h4>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setMode(ADD)
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
      {filteredTasks.length > 0 && (
        <ul className={styles.TaskList}>
          {filteredTasks.map(({ id, task, done }) => (
            <li
              key={id}
              role="button"
              onClick={e => {
                separateClicks(e, {
                  onClick: () => {
                    toggleDone(id)
                  },
                  onDoubleClick: () => {
                    setMode(EDIT)
                    setEditedTaskId(id)
                  },
                })
              }}
            >
              {renderMark(done)}{' '}
              {editedTaskId === id && mode === EDIT ? (
                <TextareaAutosize
                  ref={textarea}
                  className={cx(styles.DayTaskField, styles.isEdit)}
                  type="text"
                  spellCheck={false}
                  value={task}
                  onKeyPress={e => {
                    e.stopPropagation()
                    if (e.key === 'Enter') {
                      editTask(id, task, 'keyPress')
                    }
                  }}
                  onBlur={() => {
                    editTask(id, task, 'blur')
                  }}
                  onChange={e => {
                    editTask(id, e.target.value, 'change')
                  }}
                />
              ) : (
                task
              )}
            </li>
          ))}
        </ul>
      )}
      {mode === ADD && (
        <TextareaAutosize
          ref={textarea}
          className={styles.DayTaskField}
          type="text"
          spellCheck={false}
          value={value}
          onKeyPress={e => {
            e.stopPropagation()
            if (e.key === 'Enter') {
              addTask()
            }
          }}
          onBlur={() => {
            addTask()
          }}
          onChange={e => {
            setValue(e.target.value)
          }}
        />
      )}
    </div>
  )
}

export default DayTaskBox
