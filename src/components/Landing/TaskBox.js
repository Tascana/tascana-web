import React, { useState, useEffect, useRef } from 'react'
import { separateClicks } from './separateClicks'
import styles from './styles.module.scss'

function TaskBox({ defaultValue = '', onEdit }) {
  const [isEditMode, setEditMode] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const textarea = useRef(null)

  useEffect(() => {
    if (isEditMode) {
      const taskTextLength = value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  function onClick(e) {}

  function onDoubleClick(e) {
    setEditMode(true)
  }

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyPress={e => {
        if (e.key === 'Enter') setEditMode(true)
      }}
      className={styles.TaskBox}
      onClick={e => {
        if (isEditMode) return

        separateClicks(e, { onClick, onDoubleClick })
      }}
    >
      {isEditMode ? (
        <textarea
          ref={textarea}
          spellCheck={false}
          maxLength={80}
          value={value}
          onChange={e => {
            setValue(e.target.value)
          }}
          onKeyPress={e => {
            e.stopPropagation()
            if (e.key === 'Enter') {
              setEditMode(false)
              onEdit(value)
            }
          }}
          onBlur={() => {
            setEditMode(false)
            onEdit(value)
          }}
        />
      ) : (
        <div className={styles.TaskText}>{value}</div>
      )}
    </div>
  )
}

export default TaskBox
