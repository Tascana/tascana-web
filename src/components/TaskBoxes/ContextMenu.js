import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import styles from './styles.module.scss'

import ui from '../../redux/UI'

function ContextMenuComponent() {
  const { taskId, position, handlers } = useSelector(
    state => state.UI.contextMenu,
  )
  const dispatch = useDispatch()

  const onClose = () => {
    dispatch(
      ui.actions.toggleContextMenu({
        taskId: null,
        position: {
          x: null,
          y: null,
        },
        handlers: {},
      }),
    )
  }

  useEffect(() => {
    function handleClick(e) {
      const wasOutside = !(e.target.contains === this.root)

      if (wasOutside && !!taskId) onClose()
    }

    function handleScroll() {
      if (!!taskId) onClose()
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)

    return function cleanup() {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={styles.ContextMenu}
      style={{
        top: position.y,
        left: position.x,
        display: !!taskId ? 'initial' : 'none',
      }}
    >
      {handlers.onEdit && (
        <>
          <button type="button" onClick={handlers.onEdit}>
            Edit
          </button>
          <div className={styles.Separator} />
        </>
      )}
      {handlers.onDone && (
        <>
          <button type="button" onClick={handlers.onDone}>
            Done
          </button>
          <div className={styles.Separator} />
        </>
      )}
      {handlers.onRemove && (
        <button
          className={styles.Delete}
          type="button"
          onClick={handlers.onRemove}
        >
          Delete
        </button>
      )}
    </div>
  )
}

function ContextMenu({ children, ...rest }) {
  return ReactDOM.createPortal(
    <ContextMenuComponent {...rest} />,
    document.getElementById('context-menu-root'),
  )
}

export default ContextMenu
