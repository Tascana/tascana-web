import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import ui, { selectTreeAction } from '../../redux/UI'
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
  const dispatch = useDispatch()

  const possibleParents = useSelector(state =>
    getTasksBy(state.tasks)({ type, ...date }).filter(
      t => t.type === YEAR || t.firstParentId,
    ),
  )

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
          onClick={e => {
            e.stopPropagation()

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
