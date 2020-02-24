import React, { forwardRef, useState, useEffect } from 'react'
import TextareaAutosize from 'react-autosize-textarea'

const Textarea = forwardRef(
  (
    { defaultValue = '', onEnterPress, onBlur, className, needClear = false },
    ref,
  ) => {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
      return () => {
        if (needClear) setValue('')
      }
    }, [needClear])

    return (
      <TextareaAutosize
        ref={ref}
        type="text"
        className={className}
        spellCheck={false}
        autoFocus
        value={value}
        maxLength={80}
        onKeyPress={e => {
          e.stopPropagation()
          if (e.key === 'Enter') onEnterPress(value)
        }}
        onBlur={() => {
          onBlur(value)
        }}
        onChange={e => {
          setValue(e.target.value)
        }}
      />
    )
  },
)

export default Textarea
