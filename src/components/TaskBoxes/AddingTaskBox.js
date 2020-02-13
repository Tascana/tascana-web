import React, { useState, useEffect, useRef, useContext } from 'react'
import { useDispatch } from 'react-redux'
import cx from 'classnames'
import { FirebaseContext } from '../Firebase'
import { createTaskAction } from '../../redux/tasks'

import styles from './styles.module.scss'

function AddingTaskBox({ type, id, className = '', offAddMode, ...rest }) {
  const [isEditMode, setEditMode] = useState(true)
  const [value, setValue] = useState('')
  const textarea = useRef(null)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  function onAdd(value) {
    dispatch(
      createTaskAction({
        type,
        text: value,
        firebase,
        id,
      }),
    )
  }

  useEffect(() => {
    if (isEditMode) {
      const taskTextLength = value.length

      textarea.current.focus()
      textarea.current.setSelectionRange(taskTextLength, taskTextLength)
    }
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  function add() {
    if (value) onAdd(value)
    setValue('')
    offAddMode()
  }

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyPress={e => {
        if (e.key === 'Enter') setEditMode(true)
      }}
      className={cx(styles.AddingTaskBox, className)}
      onClick={e => {
        setEditMode(true)
      }}
      {...rest}
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
              add()
            }
          }}
          onBlur={() => {
            add()
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
