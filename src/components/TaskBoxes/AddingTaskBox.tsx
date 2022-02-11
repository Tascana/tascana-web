// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import cx from 'classnames'
import { createTask } from '../../redux/tasks'

import styles from './styles.module.scss'
import { MONTH } from '../../constants/task-types'

function AddingTaskBox({ type, date, className = '', offAddMode, ...rest }) {
  const [isVisible] = useState(true)
  const [value, setValue] = useState('')
  const textarea = useRef(null)
  const dispatch = useDispatch()
  const addModeType = useSelector(state => state.UI.addMode.type)

  const transitions = useTransition(isVisible, null, {
    from: { transform: 'scale(1)' },
    enter: { transform: 'scale(1)' },
  })

  function onAdd(value) {
    dispatch(
      createTask({
        type,
        text: value,
        weightTree: type == 'YEAR' ? 1 : 3,
        ...date,
      }),
    )
  }

  useEffect(() => {
    setTimeout(e => {
      textarea.current.focus()
    }, 100)
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
          className={cx(
            styles.AddingTaskBox,
            { [styles.isMonth]: addModeType === MONTH },
            className,
          )}
          {...rest}
        >
          <textarea
            autoFocus
            ref={textarea}
            spellCheck={false}
            maxLength={80}
            value={value}
            onChange={e => {
              setValue(e.target.value)
            }}
            onMouseDown={e => {
              e.stopPropagation()
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
