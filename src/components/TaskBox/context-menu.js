import React, { useEffect } from 'react'
import classes from './styles.module.scss'

function ContextMenu({
  position,
  edit,
  done,
  remove,
  hasEdit = true,
  hasDone = true,
  hasDelete = true,
  isOpen,
  onClose,
}) {
  useEffect(() => {
    function handleClick(e) {
      const wasOutside = !(e.target.contains === this.root)

      if (wasOutside && isOpen) onClose()
    }

    function handleScroll() {
      if (isOpen) onClose()
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)

    return function cleanup() {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={classes.ContextMenu}
      style={{
        top: position.y,
        left: position.x,
        display: isOpen ? 'initial' : 'none',
      }}
    >
      {hasEdit && (
        <>
          <button type="button" onClick={edit}>
            Edit
          </button>
          <div className={classes.Separator} />
        </>
      )}
      {hasDone && (
        <>
          <button type="button" onClick={done}>
            Done
          </button>
          <div className={classes.Separator} />
        </>
      )}
      {hasDelete && (
        <button className={classes.Delete} type="button" onClick={remove}>
          Delete
        </button>
      )}
    </div>
  )
}

export default ContextMenu
