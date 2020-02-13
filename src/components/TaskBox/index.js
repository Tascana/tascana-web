import React, { useRef, useEffect, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import cx from 'classnames'
import arrayMove from 'array-move'
import { FirebaseContext } from '../Firebase'
import ContextMenu from './context-menu'
import classes from './styles.module.scss'
import styles from './styles.module.scss'
import { randomGrad } from './utils'
import * as types from '../../constants/task-types'

import {
  createTaskAction,
  editTaskAction,
  removeTaskAction,
  doneTaskAction,
  sortTasksAction,
} from '../../redux/tasks'

import {
  AddingTaskBox,
  TaskBox as TaskBoxComponent,
  DayTaskBox,
} from '../TaskBoxes'

import ui, { selectTreeAction, setSort } from '../../redux/UI'

const Container = SortableContainer(({ children }) => {
  return <div>{children}</div>
})

const Element = SortableElement(({ children }) => children)

function DaySubtask({
  type,
  selectedTask,
  add,
  edit,
  tasks,
  allTasks,
  contextMenu,
  setContextMenu,
  selectedTree,
}) {
  const selectedId = useSelector(state => state.UI.selectedId)
  const sort = useSelector(state => state.UI.sort)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)
  const [isEdit, setIsEdit] = useState(null)
  const [isAdd, setIsAdd] = useState(false)
  const list = useRef(null)
  const input = useRef(null)

  const isDisableAdding =
    !selectedTask || (selectedTask && selectedTask.type !== types.MONTH)

  useEffect(() => {
    const editable = document.querySelector('[contenteditable="true"]')
    if (editable) {
      editable.focus()
    }
  }, [isEdit])

  useEffect(() => {
    if (isAdd) {
      setTimeout(() => {
        input.current.focus()
      }, 250) // after animation
    }
  }, [isAdd])

  const handleAdd = e => {
    const subtaskText = e.target.value
    if (subtaskText) {
      setIsAdd(false)
      add(subtaskText)
    }
  }

  const handleEdit = (e, { task, id }) => {
    if (e.target.textContent !== task) {
      edit(e.target.textContent, id)
    }
    setIsEdit(null)
  }

  let buttonPressTimer

  function handleButtonPress() {
    buttonPressTimer = setTimeout(() => {
      dispatch(setSort(true))
    }, 1000)
  }

  function handleButtonRelease() {
    clearTimeout(buttonPressTimer)
  }

  return (
    <Droppable droppableId={type}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={classes.SubtaskBox}
        >
          <>
            <div className={classes.SubtaskBoxHeading}>
              <h4>{type.toLowerCase()}</h4>
              <button
                type="button"
                disabled={isDisableAdding}
                className={classes.AddSubtask}
                onClick={() => {
                  setIsAdd(!isAdd)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 341.4 341.4"
                >
                  <path
                    d="M192 149.4V0h-42.6v149.4H0V192h149.4v149.4H192V192h149.4v-42.6z"
                    fill="#616161"
                  />
                </svg>
              </button>
            </div>
            {tasks.length > 0 && (
              <ul ref={list} className={classes.SubtaskList}>
                {tasks
                  .sort((a, b) => a.position - b.position)
                  .map((s, i) => {
                    function getGradient() {
                      if (s.type === 'YEAR') return randomGrad(s.createdAt)

                      if (s.type === 'MONTH')
                        return randomGrad(allTasks[s.parentId].createdAt)

                      if (s.type === 'DAY') {
                        const dayParent = allTasks[s.parentId]
                        const monthParent = allTasks[dayParent.parentId]

                        return randomGrad(monthParent.createdAt)
                      }
                    }

                    return (
                      <Draggable
                        draggableId={s.id}
                        key={`${s.id}-${i}-${s.subtype}`}
                        index={i}
                        isDragDisabled={!sort}
                      >
                        {(provided, snapshot) => (
                          <li
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            data-isedit={
                              typeof isEdit === 'number' ? i + s.id : 'null'
                            }
                            onTouchStart={handleButtonPress}
                            onTouchEnd={handleButtonRelease}
                            onMouseDown={handleButtonPress}
                            onMouseUp={handleButtonRelease}
                            onMouseLeave={handleButtonRelease}
                            onDoubleClick={() => {
                              setIsEdit(i)
                            }}
                            className={cx({
                              [classes.BoxSelected]:
                                selectedId === s.id ||
                                selectedTree.includes(s.id),
                              [classes.BoxUnselected]:
                                selectedId !== null &&
                                selectedId !== s.id &&
                                !selectedTree.includes(s.id),
                              [classes.BoxSorted]: !sort,
                            })}
                            onContextMenu={e => {
                              e.preventDefault()
                              e.stopPropagation()

                              setContextMenu({
                                taskId: s.id,
                                position: {
                                  x: e.clientX,
                                  y: e.clientY,
                                },
                              })
                            }}
                          >
                            <div
                              className={classes.Mark}
                              style={{
                                background: getGradient(),
                              }}
                            >
                              <div>
                                {s.done && (
                                  <div
                                    style={{
                                      background: getGradient(),
                                    }}
                                  ></div>
                                )}
                              </div>
                            </div>{' '}
                            <p
                              contentEditable={isEdit === i}
                              onKeyPress={e => {
                                if (e.key === 'Enter') {
                                  handleEdit(e, s)
                                }
                              }}
                              onBlur={e => {
                                handleEdit(e, s)
                              }}
                            >
                              {s.task}
                            </p>
                            <ContextMenu
                              isOpen={contextMenu.taskId === s.id}
                              position={contextMenu.position}
                              onClose={() => {
                                setContextMenu({
                                  taskId: null,
                                  position: { x: null, y: null },
                                })
                              }}
                              edit={e => {
                                e.stopPropagation()
                                setIsEdit(i)
                              }}
                              done={e => {
                                e.stopPropagation()
                                dispatch(doneTaskAction({ firebase, id: s.id }))
                              }}
                              remove={e => {
                                e.stopPropagation()
                                dispatch(
                                  removeTaskAction({ todo: s, firebase }),
                                )
                              }}
                            />
                          </li>
                        )}
                      </Draggable>
                    )
                  })}
              </ul>
            )}
            <input
              style={{
                display: isAdd ? 'initial' : 'none',
              }}
              ref={input}
              type="text"
              autoCorrect="true"
              className={classes.SubtaskBoxInput}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleAdd(e)
                }
              }}
              onBlur={handleAdd}
            />
          </>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

function TaskBox({ type, id }) {
  const isSort = useSelector(state => state.UI.sort)
  const allTasks = useSelector(state => state.tasks)
  const selectedId = useSelector(state => state.UI.selectedId)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  if (type === types.DAY) {
    return (
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
          <DayTaskBox
            className={styles.DayTaskBox}
            key={subtype}
            subtype={subtype}
            tasks={allTasks}
            onAdd={text => {
              dispatch(
                createTaskAction({
                  type: types.DAY,
                  text,
                  subtype,
                  firebase,
                  id,
                }),
              )
            }}
            onEdit={(text, id) => {
              dispatch(
                editTaskAction({
                  updatedData: {
                    task: text,
                  },
                  firebase,
                  id,
                }),
              )
            }}
            onDone={id => {
              dispatch(doneTaskAction({ id, firebase }))
            }}
            onRemove={id => {
              dispatch(removeTaskAction({ id, firebase }))
            }}
          />
        ))}
      </DragDropContext>
    )
  }

  return (
    <>
      <Container
        pressDelay={1000}
        helperClass={classes.isSortable}
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
            <Element key={item.id} index={index}>
              <TaskBoxComponent
                className={cx(classes.TaskBox, {
                  [classes.BoxSelected]:
                    selectedId === item.id || selectedTree.includes(item.id),
                  [classes.BoxUnselected]:
                    selectedId !== null &&
                    selectedId !== item.id &&
                    !selectedTree.includes(item.id),
                  [classes.BoxSorted]: isSort,
                })}
                task={item}
                onSelect={() => {
                  if (item.type !== types.YEAR && !item.parentId) return

                  dispatch(selectTreeAction({ todo: item }))
                }}
                onLink={parentId => {
                  dispatch(
                    editTaskAction({
                      updatedData: {
                        parentId,
                      },
                      firebase,
                      id: item.id,
                    }),
                  )
                }}
                onDone={id => {
                  dispatch(doneTaskAction({ id, firebase }))
                }}
                onRemove={id => {
                  dispatch(removeTaskAction({ firebase, id }))
                }}
                onEdit={text => {
                  dispatch(
                    editTaskAction({
                      updatedData: {
                        task: text,
                      },
                      firebase,
                      id: item.id,
                    }),
                  )
                }}
              />
            </Element>
          ))}
      </Container>
      <AddingTaskBox
        className={styles.AddBox}
        onAdd={text => {
          dispatch(
            createTaskAction({
              type,
              text,
              firebase,
              id,
            }),
          )
        }}
      />
    </>
  )
}

export default TaskBox
