import React, { useState, useEffect, useRef, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import cx from 'classnames'
import { FirebaseContext } from '../Firebase'
import { createTaskAction } from '../../redux/tasks'

import styles from './styles.module.scss'

function AddingTaskBox({ type, id, className = '', offAddMode, ...rest }) {
  const [isVisible] = useState(true)
  const [value, setValue] = useState('')
  const textarea = useRef(null)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  const transitions = useTransition(isVisible, null, {
    from: { transform: 'scale(0)' },
    enter: { transform: 'scale(1)' },
  })

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
    const taskTextLength = value.length

    textarea.current.focus()
    textarea.current.setSelectionRange(taskTextLength, taskTextLength)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function add() {
    if (value) onAdd(value)
    setValue('')
    offAddMode()
  }

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <animated.div
          key={key}
          style={props}
          role="button"
          tabIndex="0"
          className={cx(styles.AddingTaskBox, className)}
          {...rest}
        >
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
        </animated.div>
      ),
  )
}

export default AddingTaskBox
