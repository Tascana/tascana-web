import React, { useRef, useEffect, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import cx from 'classnames'
import arrayMove from 'array-move'
import { FirebaseContext } from '../Firebase'
import ProgressBar from './progress-bar'
import ContextMenu from './context-menu'
import classes from './styles.module.scss'
import { randomGrad, getTodos } from './utils'
import checkMark from '../../assets/icons/checkmark.png'
import * as types from '../../constants/task-types'

import {
  createTaskAction,
  editTaskAction,
  removeTaskAction,
  doneTaskAction,
} from '../../redux/tasks'

import ui, { selectTreeAction, setSort } from '../../redux/UI'

const Container = SortableContainer(({ children }) => {
  return <div>{children}</div>
})

const Element = SortableElement(({ children }) => children)

function TextMode({
  todo,
  edited,
  i,
  todos,
  contextMenu,
  setContextMenu,
  done,
  remove,
  selectedTree,
  isSort,
}) {
  const textField = useRef(null)
  const bg = useRef(null)
  const dispatch = useDispatch()
  const selectedId = useSelector(state => state.UI.selectedId)

  const getProgress = () => {
    const { id } = todo

    const child = Object.values(todos).filter(i => i.parentId === id)

    const doneChild = child.filter(i => i.done)

    const progress = (doneChild.length / child.length) * 100

    if (progress === 100) {
      done(id)
      return
    }

    if (Number.isNaN(progress)) return 0

    return progress
  }

  function getGradient() {
    if (todo.type === 'YEAR') return randomGrad(todo.createdAt)

    if (todo.type === 'MONTH') return randomGrad(todos[todo.parentId].createdAt)

    if (todo.type === 'DAY') {
      const dayParent = todos[todo.parentId]
      const monthParent = todos[dayParent.parentId]

      return randomGrad(monthParent.createdAt)
    }
  }

  function setEdit(e) {
    e.stopPropagation()
    dispatch(ui.actions.setEditTask(true))
    textField.current.contentEditable = true
    textField.current.focus()
  }

  return (
    <>
      <div
        onDoubleClick={setEdit}
        onClick={() => {
          dispatch(selectTreeAction({ todo }))
        }}
        onContextMenu={e => {
          e.preventDefault()
          e.stopPropagation()

          setContextMenu({
            taskId: todo.id,
            position: {
              x: e.clientX,
              y: e.clientY,
            },
          })
        }}
        onMouseDown={e => {
          if (e.detail > 1) e.preventDefault()
        }}
        className={cx(classes.TaskBox, {
          [classes.BoxSelected]:
            selectedId === todo.id || selectedTree.includes(todo.id),
          [classes.BoxUnselected]:
            selectedId !== null &&
            selectedId !== todo.id &&
            !selectedTree.includes(todo.id),
          [classes.BoxSorted]: isSort,
        })}
        style={{ background: getGradient() }}
        ref={bg}
      >
        <div style={{ padding: '15px' }}>
          <div
            onBlur={e => {
              setTimeout(() => dispatch(ui.actions.setEditTask(false)), 150) // temporary workaround for react's strange event propagation
              edited(e.target.innerHTML, todo.id)
              e.target.contentEditable = false
            }}
            className={classes.TextBoxContents}
            contentEditable={false}
            spellCheck={false}
            ref={textField}
            dangerouslySetInnerHTML={{ __html: todo.task }}
          ></div>
        </div>

        {todo.done ? (
          <div className={classes.Done}>
            <img src={checkMark} alt="" />
          </div>
        ) : null}

        {!todo.done &&
        todo.type !== 'DAY' &&
        getProgress() > 0 &&
        getProgress() < 100 ? (
          <ProgressBar progress={getProgress()} />
        ) : null}
        <ContextMenu
          isOpen={contextMenu.taskId === todo.id}
          position={contextMenu.position}
          onClose={() => {
            setContextMenu({
              taskId: null,
              position: { x: null, y: null },
            })
          }}
          edit={setEdit}
          hasDone={todo.type === types.DAY || todo.type === types.MONTH}
          done={e => {
            e.stopPropagation()
            done()
          }}
          remove={e => {
            e.stopPropagation()
            remove()
          }}
        />
      </div>
    </>
  )
}

function AddMode({ added, type, selectedTask, selectedId }) {
  let disable = false

  if (selectedId === null && type !== 'YEAR') disable = true
  if (selectedTask && selectedTask.type === 'YEAR' && type === 'DAY')
    disable = true
  if (selectedTask && selectedTask.type === 'MONTH' && type === 'YEAR')
    disable = true
  if (selectedTask && selectedTask.type === type) disable = true
  if (selectedTask && selectedTask.type === 'DAY') disable = true

  return (
    <div
      className={cx(classes.TaskBox, classes.AddBox, {
        [classes.TaskBoxDisable]: disable,
      })}
    >
      <div
        style={{
          padding: '15px',
          display: 'table-cell',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}
      >
        <div
          className={classes.AddBoxContents}
          onClick={e => {
            e.target.className = classes.TextBoxContents
            e.target.contentEditable = true
            e.target.innerHTML = ''
            e.currentTarget.parentElement.parentElement.className =
              classes.TaskBox
            e.currentTarget.parentElement.style = 'padding: 15px'
            e.currentTarget.focus()
          }}
          onBlur={e => {
            if (e.target.innerHTML !== '') added(e.target.innerHTML)
            e.target.className = classes.AddBoxContents
            e.target.contentEditable = false
            e.target.innerHTML = 'Add task'
            e.currentTarget.parentElement.parentElement.className = cx(
              classes.TaskBox,
              classes.AddBox,
            )
            e.currentTarget.parentElement.style =
              'padding: 15px; display:table-cell; text-align:center; vertical-align:middle;'
            e.currentTarget.focus()
          }}
        >
          Add task
        </div>
      </div>
    </div>
  )
}

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
  const [contextMenu, setContextMenu] = useState({
    taskId: null,
    position: {
      x: null,
      y: null,
    },
  })

  const todos = useSelector(state => getTodos(state, type, id))
  const isSort = useSelector(state => state.UI.sort)
  const allTasks = useSelector(state => state.tasks)
  const selectedId = useSelector(state => state.UI.selectedId)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const selectedTask = useSelector(
    state => state.tasks[selectedId],
    () => !!selectedId,
  )
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

          const destinationTasks = todos
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
            const tasks = todos.filter(
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
        {[types.MORNING, types.AFTERNOON, types.EVENING].map(i => (
          <DaySubtask
            key={i}
            type={i}
            selectedTask={selectedTask}
            allTasks={allTasks}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            selectedTree={selectedTree}
            add={text => {
              dispatch(
                createTaskAction({
                  type: types.DAY,
                  text,
                  subtype: i,
                  firebase,
                  id,
                }),
              )
            }}
            edit={(input, id) => {
              dispatch(
                editTaskAction({
                  updatedData: {
                    task: input,
                  },
                  firebase,
                  id,
                }),
              )
            }}
            tasks={todos
              .map(t => (t.subtype ? t : { ...t, subtype: types.MORNING }))
              .filter(t => t.subtype === i)}
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
          arrayMove(todos, oldIndex, newIndex).forEach((t, index) => {
            dispatch(
              editTaskAction({
                firebase,
                id: t.id,
                isSort: true,
                updatedData: {
                  position: index,
                },
              }),
            )
          })
          dispatch(setSort(false))
        }}
      >
        {todos
          .sort((a, b) => a.position - b.position)
          .map((item, index) => (
            <Element key={item.id} index={index}>
              <TextMode
                isSort={isSort}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                todo={item}
                i={index}
                selectedTree={selectedTree}
                edited={(input, id) => {
                  dispatch(
                    editTaskAction({
                      updatedData: {
                        task: input,
                      },
                      firebase,
                      id,
                    }),
                  )
                }}
                remove={() => {
                  dispatch(removeTaskAction({ todo: item, firebase }))
                }}
                done={() => {
                  dispatch(doneTaskAction({ firebase, id: item.id }))
                }}
                todos={allTasks}
              />
            </Element>
          ))}
      </Container>
      <AddMode
        selectedId={selectedId}
        selectedTask={selectedTask}
        type={type}
        added={text => {
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
