import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import TextareaAutosize from 'react-autosize-textarea'
import cx from 'classnames'
import gradientParser from 'gradient-parser'
import ui from '../../redux/UI'
import { separateClicks } from './separateClicks'
import styles from './styles.module.scss'

const DEFAULT = ''
const ADD = 'add'
const EDIT = 'edit'

function DayTaskBox({
  subtype,
  tasks = [],
  onAdd,
  onEdit,
  onDone,
  onRemove,
  parentId,
  disabled,
  className,
  ...rest
}) {
  const [mode, setMode] = useState(DEFAULT)
  const [editedTaskId, setEditedTaskId] = useState(null)
  const [value, setValue] = useState('')
  const textarea = useRef(null)
  const dispatch = useDispatch()

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
    if (value) onAdd(value)
    setValue('')
    setMode(DEFAULT)
  }

  function editTask(id, editedTaskText, type) {
    if (editedTaskText) onEdit(editedTaskText, id)

    if (type !== 'change') {
      setEditedTaskId(null)
      setMode(DEFAULT)
    }
  }

  const filteredTasks = tasks.filter(i => i.subtype === subtype)

  const renderMark = useCallback((done, gradient, id) => {
    const [{ colorStops }] = gradientParser.parse(gradient)

    const [first, last] = colorStops.map(color => {
      if (color.type === 'hex') return '#' + color.value

      return `rgb(${color.value.join(',')})`
    })

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13">
        <defs>
          <linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            x1="6.5"
            y1="0"
            x2="6.5"
            y2="13"
          >
            <stop offset="0%" stopColor={first} />
            <stop offset="100%" stopColor={last} />
          </linearGradient>
        </defs>
        <path
          d="M13 6.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          fill={`url(#${id})`}
        />
        {!done && (
          <path
            d="M12 6.5C12 9.54 9.53 12 6.5 12 3.46 12 1 9.54 1 6.5 1 3.47 3.46 1 6.5 1 9.53 1 12 3.47 12 6.5z"
            fill="#fafafa"
          />
        )}
      </svg>
    )
  }, [])

  return (
    <div className={cx(styles.DayTaskBox, className)} {...rest}>
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
          {filteredTasks.map(({ id, task, done, backgroundGradient }) => (
            <li
              key={id}
              role="button"
              onClick={e => {
                e.stopPropagation()

                separateClicks(e, {
                  onClick: () => {
                    onDone(id)
                  },
                  onDoubleClick: () => {
                    setMode(EDIT)
                    setEditedTaskId(id)
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
                        setMode(EDIT)
                        setEditedTaskId(id)
                      },
                      onDone: () => onDone(id),
                      onRemove: () => onRemove(id),
                    },
                  }),
                )
              }}
              className={cx({
                [styles.isDone]: done,
              })}
            >
              {renderMark(done, backgroundGradient, id)}{' '}
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
