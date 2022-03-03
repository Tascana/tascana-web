// @ts-nocheck
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'lodash.isequal'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { useTransition, animated } from 'react-spring'
import { DragDropContext } from 'react-beautiful-dnd'
import cx from 'classnames'
import { AddingTaskBox, TaskBox as TaskBoxComponent } from '../TaskBoxes'
import DayTasks from '../DayTasks'
import { sortTask } from '../../redux/tasks'
import ui, { setSort } from '../../redux/UI'
import * as types from '../../constants/task-types'
import { reorder } from './utils'

import { useSpring } from 'react-spring'

import styles from './styles.module.scss'
import { separateClicks } from '../TaskBoxes/separateClicks'

import { getTasksBy, getTasksByType } from '../../redux/utils'

// TODO: Use react-sortable-hoc while actual issue in react-beautiful-dnd
const DroppableTasksArea = SortableContainer(({ children }) => {
  return <div className={styles.TasksWrapper}>{children}</div>
})
const DraggableTaskBox = SortableElement(({ children }) => children)

function DaysTasks({ type, id, date, title, current, onRowHide }) {
  const [hidden, setHidden] = useState(false)
  const isSort = useSelector(state => state.UI.sort)
  const isLinking = useSelector(state => state.UI.isLinking)
  const allTasks = useSelector(state => state.tasks)
  let currentTasks = useSelector(state => getTasksBy(state.tasks)({ type, ...date }))
  let allTasksByType = useSelector(state => getTasksByType(state.tasks)({ type }))
  const firebaseReady = useSelector(state => state.session.firebaseReady)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const [parent] = useSelector(state => state.UI.selectedTree)
  const addMode = useSelector(state => state.UI.addMode)
  const dispatch = useDispatch()
  const transitions = useTransition(!hidden, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 100,
    },
    onStart: onRowHide,
    onRest: onRowHide,
  })
  const [spring, set] = useSpring(() => ({
    x: 0,
    config: { duration: 100 },
  }))

  const parentType = parent ? allTasks.find(i => i.id === parent).type : ''

  set({ x: selectedTree.length > 0 ? 0.3 : 1 })
  if (type === types.DAY) {
    return (
      <div>
        <div
          className={cx(styles.DayHeader, {
            [styles.HoverableLinesHeader]: hidden,
          })}
          onClick={e => {
            e.preventDefault()

            separateClicks(e, {
              onDoubleClick: () => {
                !hidden && setHidden(true)
              },
              onClick: () => {
                hidden && setHidden(false)
              },
            })
          }}
        >
          <animated.h1
            onContextMenu={e => {
              if (!hidden) {
                e.preventDefault()
                e.stopPropagation()

                dispatch(
                  ui.actions.toggleContextMenu({
                    taskId: 'CONTEXT_MENU_OPENED',
                    position: {
                      x: e.clientX,
                      y: e.clientY,
                    },
                    handlers: {
                      onCollapse: () => setHidden(true),
                    },
                  }),
                )
              }
            }}
            style={{ opacity: spring.x }}
          >
            {title}
          </animated.h1>
          {hidden && (
            <button type="button" data-circled="true">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M10 17l5-5-5-5v10z" />
                <path d="M0 24V0h24v24H0z" fill="none" />
              </svg>
            </button>
          )}
        </div>
        {firebaseReady && allTasksByType.length === 0 && (
          <img
            src={'/images/Day_Onboarding.svg'}
            className={cx(styles.OnboardingImage, [styles.DayType])}
          />
        )}
        {transitions.map(
          ({ item, key, props }) =>
            item && (
              <animated.div style={props} key={key}>
                <DragDropContext
                  onBeforeDragStart={() => {
                    if (isLinking) return
                    dispatch(setSort(true))
                  }}
                  onDragEnd={({ destination, source, draggableId }) => {
                    dispatch(setSort(false))

                    if (!destination) return

                    const droppableTasks = getTasksBy(allTasks)({
                      type: types.DAY,
                      subtype: destination.droppableId,
                      ...date,
                    })

                    const sorted = reorder(droppableTasks, source.index, destination.index)
                      .filter(destination.index)
                      .filter(Boolean)

                    if (destination.droppableId === source.droppableId) {
                      dispatch(
                        sortTask(
                          sorted.map((t, index) => ({
                            ...t,
                            position: index,
                          })),
                        ),
                      )
                    } else {
                      const draggableItem = allTasks.find(t => t.id === draggableId)
                      const tasks = droppableTasks.slice()

                      tasks.splice(destination.index, 0, draggableItem)

                      dispatch(
                        sortTask(
                          tasks.map((t, index) => ({
                            ...t,
                            subtype: destination.droppableId,
                            position: index,
                          })),
                        ),
                      )
                    }
                  }}
                >
                  {[types.MORNING, types.AFTERNOON, types.EVENING].map(subtype => (
                    <DayTasks
                      key={subtype}
                      subtype={subtype}
                      date={date}
                      className={styles.DayTaskBox}
                      h4ShouldBeTransparent={selectedTree.length > 0}
                    />
                  ))}
                </DragDropContext>
              </animated.div>
            ),
        )}
      </div>
    )
  }
  return null
}
export default DaysTasks
