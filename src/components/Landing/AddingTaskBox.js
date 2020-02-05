import React, { useState, useEffect, useRef } from 'react'
import styles from './styles.module.scss'

function AddingTaskBox() {
  const [isEditMode, setEditMode] = useState(false)
  const [value, setValue] = useState('')
  const textarea = useRef(null)

  useEffect(() => {
    if (isEditMode) {
      const taskTextLength = value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyPress={e => {
        if (e.key === 'Enter') setEditMode(true)
      }}
      className={styles.AddingTaskBox}
      onClick={e => {
        setEditMode(true)
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
            if (e.key === 'Enter') setEditMode(false)
          }}
          onBlur={() => {
            setEditMode(false)
            setValue('')
          }}
        />
      ) : (
        <div className={styles.Plus}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42">
            <path d="M42 20H22V0h-2v20H0v2h20v20h2V22h20z" fill="#616161" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default AddingTaskBox
