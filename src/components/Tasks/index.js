import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { DragDropContext } from 'react-beautiful-dnd'
import cx from 'classnames'
import arrayMove from 'array-move'
import { AddingTaskBox, TaskBox as TaskBoxComponent } from '../TaskBoxes'
import DayTasks from '../DayTasks'
import { FirebaseContext } from '../Firebase'
import { editTaskAction, sortTasksAction } from '../../redux/tasks'
import { setSort } from '../../redux/UI'
import * as types from '../../constants/task-types'

import styles from './styles.module.scss'

// TODO: Use react-sortable-hoc while actual issue in react-beautiful-dnd
const DroppableTasksArea = SortableContainer(({ children }) => {
  return <div>{children}</div>
})
const DraggableTaskBox = SortableElement(({ children }) => children)

function Tasks({ type, id, title }) {
  const [isInAddMode, setAddMode] = useState(false)

  const isSort = useSelector(state => state.UI.sort)
  const allTasks = useSelector(state => state.tasks)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  if (type === types.DAY) {
    return (
      <div>
        <h1 className={styles.Title}>{title}</h1>
        <DragDropContext
          onDragStart={() => {
            dispatch(setSort(true))
          }}
          onDragEnd={({ destination, source, draggableId }) => {
            dispatch(setSort(false))

            if (!destination) return

            if (
              destination.droppableId === source.droppableId &&
              destination.index === source.index
            )
              return

            const destinationTasks = allTasks
              .filter(t => t.subtype === destination.droppableId)
              .sort((a, b) => a.position - b.position)

            const sorted = arrayMove(
              destinationTasks,
              source.index,
              destination.index,
            ).filter(Boolean)

            if (destination.droppableId === source.droppableId) {
              sorted.forEach((t, index) => {
                dispatch(
                  editTaskAction({
                    id: t.id,
                    firebase,
                    isSort: true,
                    updatedData: {
                      position: index,
                    },
                  }),
                )
              })
            } else {
              const draggable = allTasks[draggableId]
              const tasks = allTasks.filter(
                t => t.subtype === destination.droppableId,
              )

              tasks.splice(destination.index, 0, draggable)

              const sortedByPosition = tasks.sort(
                (a, b) => a.position - b.position,
              )

              const reorder = arrayMove(
                sortedByPosition,
                source.index,
                destination.index,
              ).filter(Boolean)

              reorder.forEach((t, index) => {
                dispatch(
                  editTaskAction({
                    id: t.id,
                    firebase,
                    isSort: true,
                    updatedData: {
                      subtype: destination.droppableId,
                      position: index,
                    },
                  }),
                )
              })
            }
          }}
        >
          {[types.MORNING, types.AFTERNOON, types.EVENING].map(subtype => (
            <DayTasks
              key={subtype}
              subtype={subtype}
              id={id}
              className={styles.DayTaskBox}
            />
          ))}
        </DragDropContext>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.LinesHeader}>
        <h1>{title}</h1>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()

            setAddMode(true)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341.4 341.4">
            <path
              d="M192 149.4V0h-42.6v149.4H0V192h149.4v149.4H192V192h149.4v-42.6z"
              fill="#616161"
            />
          </svg>
        </button>
      </div>
      <DroppableTasksArea
        pressDelay={1000}
        helperClass={styles.isSortable}
        axis={'xy'}
        onSortStart={() => {
          dispatch(setSort(true))
        }}
        onSortEnd={({ oldIndex, newIndex }) => {
          const arr = allTasks.filter(t => t.type === type)

          const reorder = (list, startIndex, endIndex) => {
            const result = Array.from(list)
            const [removed] = result.splice(startIndex, 1)
            result.splice(endIndex, 0, removed)

            return result
          }

          const reorderedTasks = reorder(arr, oldIndex, newIndex)

          dispatch(
            sortTasksAction({
              reorderedTasks: reorderedTasks.map((t, index) => ({
                ...t,
                position: index,
              })),
              type,
              firebase,
            }),
          )

          dispatch(setSort(false))
        }}
      >
        {allTasks
          .filter(t => t.type === type)
          .map((item, index) => (
            <DraggableTaskBox key={item.id} index={index}>
              <TaskBoxComponent
                className={cx(styles.TaskBox, {
                  [styles.BoxSelected]: selectedTree.includes(item.id),
                  [styles.BoxUnselected]:
                    selectedTree.length > 0 && !selectedTree.includes(item.id),
                  [styles.BoxSorted]: isSort,
                })}
                task={item}
              />
            </DraggableTaskBox>
          ))}
        {isInAddMode && (
          <AddingTaskBox
            id={id}
            type={type}
            className={styles.AddBox}
            offAddMode={() => {
              setAddMode(false)
            }}
          />
        )}
      </DroppableTasksArea>
    </div>
  )
}

export default Tasks
