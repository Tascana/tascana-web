// @ts-nocheck
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ui, { selectTreeAction } from '../../redux/UI'
import { linkTasks } from '../../redux/tasks'
import { getTasksBy } from '../../redux/utils'
import { YEAR } from '../../constants/task-types'

import wrapperStyles from './styles.module.scss'

import smallAdd from '../../assets/icons/small-add.svg'

function LinkParentBar({
  task,
  date,
  setLinkMode,
  parentId,
  selectParentId,
  type = YEAR,
  styles = wrapperStyles,
  hasAddParentButton = true,
}) {
  const [selected, setSelected] = useState(false)
  const dispatch = useDispatch()

  const possibleParents = useSelector(state =>
    getTasksBy(state.tasks)({ type, ...date }).filter(
      t => t.type === YEAR || t.firstParentId,
    ),
  )
  const linkingTask = useSelector(state => state.UI.isLinking)

  return (
    <ul className={styles.Links}>
      {hasAddParentButton && (
        <li>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              dispatch(
                ui.actions.toggleAddMode({
                  on: true,
                  child: task.id,
                  type: YEAR,
                }),
              )
              setLinkMode(false)
            }}
          >
            <img src={smallAdd} alt="" />
          </button>
        </li>
      )}
      {possibleParents.map(t => (
        <li
          key={t.id}
          role="button"
          onDoubleClick={e => {
            e.stopPropagation()
            dispatch(linkTasks({ childId: linkingTask, parentId }))
            setLinkMode(false)
            dispatch(
              selectTreeAction({
                todo: null,
              }),
            )
          }}
          onMouseOver={e => {
            e.stopPropagation()

            if (!selected && !e.currentTarget.getAttribute('clicked')) {
              if (parentId === t.id) {
                selectParentId(null)
                dispatch(
                  selectTreeAction({
                    todo: null,
                  }),
                )
                return
              }

              selectParentId(t.id)
              dispatch(
                selectTreeAction({
                  todo: t,
                }),
              )
            }
          }}
          onClick={e => {
            e.stopPropagation()
            setSelected(true)

            if (selected) {
              selectParentId(t.id)
              dispatch(
                selectTreeAction({
                  todo: t,
                }),
              )
            }

            e.currentTarget.setAttribute('clicked', true)
          }}
          onMouseOut={e => {
            e.stopPropagation()

            if (!selected && !e.currentTarget.getAttribute('clicked')) {
              selectParentId(null)
              dispatch(
                selectTreeAction({
                  todo: null,
                }),
              )
              return
            }
            e.currentTarget.removeAttribute('clicked')
          }}
          className={cx(styles.Parent, {
            [styles.isSelected]: parentId === t.id,
          })}
          style={{ backgroundImage: t.background }}
        ></li>
      ))}
    </ul>
  )
}

export default LinkParentBar
