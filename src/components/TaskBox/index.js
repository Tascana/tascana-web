import React, { useRef, useEffect, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import nanoid from 'nanoid'
import { FirebaseContext } from '../Firebase'
import ui from '../../redux/UI'
import tasks from '../../redux/tasks'
import ProgressBar from './progress-bar'
import classes from './styles.module.scss'
import { randomGrad, getTodos } from './utils'
import checkMark from '../../assets/icons/checkmark.png'

function TextMode({
  todo,
  edited,
  selected,
  i,
  todos,
  isVisibleContextMenu,
  setIsVisibleContextMenu,
  done,
  remove,
  selectedTree,
}) {
  const textField = useRef(null)
  const bg = useRef(null)
  const dispatch = useDispatch()
  const selectedId = useSelector(state => state.UI.selectedId)

  console.log(selectedTree.includes(todo.id), selectedTree, todo.id)

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

  useEffect(() => {
    const item = bg.current

    function handleContextMenu(e) {
      e.preventDefault()

      setIsVisibleContextMenu(todo.id)
    }

    function handleClick(e) {
      const wasOutside = !(e.target.contains === this.root)

      if (wasOutside && isVisibleContextMenu) setIsVisibleContextMenu(false)
    }

    function handleScroll() {
      if (isVisibleContextMenu) setIsVisibleContextMenu(false)
    }

    item.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)

    return function cleanup() {
      item.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [isVisibleContextMenu]) // eslint-disable-line react-hooks/exhaustive-deps

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
    textField.current.contentEditable = true
    textField.current.focus()
  }

  return (
    <>
      <div
        onDoubleClick={setEdit}
        onClick={() => {
          function getTree(id) {
            let parent = []

            function getParent(parentId) {
              if (parentId && todos[parentId]) {
                parent.push(todos[parentId])
                return getParent(todos[parentId].parentId)
              }
              return parent.map(p => p.id)
            }

            function getChildren(todoId) {
              const todosArr = Object.values(todos)

              const child = todosArr.filter(i => i.parentId === todoId)

              const allChild = [
                ...child,
                ...todosArr.filter(i =>
                  child.map(i => i.id).includes(i.parentId),
                ),
              ]

              return allChild.map(c => c.id)
            }

            return [...getParent(todo.parentId), ...getChildren(todo.id)]
          }

          if (selectedId !== null) {
            if (selectedId === todo.id) {
              dispatch(ui.actions.select(null))
              dispatch(ui.actions.selectTree([]))
            } else {
              dispatch(ui.actions.select(todo.id))
              dispatch(ui.actions.selectTree(getTree()))
            }
          } else {
            dispatch(ui.actions.select(todo.id))
            dispatch(ui.actions.selectTree(getTree()))
          }
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
        })}
        style={{ background: getGradient() }}
        ref={bg}
      >
        <div style={{ padding: '15px' }}>
          <div
            onBlur={item => {
              edited(item.target.innerHTML, todo.id)
              item.target.contentEditable = false
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
        {isVisibleContextMenu === todo.id ? (
          <div className={classes.ContextMenu}>
            <button type="button" onClick={setEdit}>
              Edit
            </button>
            <div className={classes.Separator} />
            {(todo.type === 'DAY' || todo.type === 'MONTH') && (
              <>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    done(todo.id)
                  }}
                >
                  Done
                </button>
                <div className={classes.Separator} />
              </>
            )}
            <button
              className={classes.Delete}
              type="button"
              onClick={e => {
                e.stopPropagation()
                remove(todo.id)
                const todosArr = Object.values(todos)

                const child = todosArr.filter(i => i.parentId === todo.id)

                const allChild = [
                  ...child,
                  ...todosArr.filter(i =>
                    child.map(i => i.id).includes(i.parentId),
                  ),
                ]

                if (allChild.length) {
                  allChild.forEach(c => {
                    remove(c.id)
                  })
                }
              }}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}

function AddMode({ added, selected, type, selectedTask, selectedId }) {
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
            selected()
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

function TaskBox({ type, id }) {
  const [isVisibleContextMenu, setIsVisibleContextMenu] = useState(false)

  const todos = useSelector(state => getTodos(state, type, id))
  const allTasks = useSelector(state => state.tasks)
  const selectedId = useSelector(state => state.UI.selectedId)
  const selectedTree = useSelector(state => state.UI.selectedTree)
  const selectedTask = useSelector(
    state => state.tasks[selectedId],
    () => !!selectedId,
  )
  const userId = useSelector(state => state.session.authUser.uid)
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  return (
    <>
      {todos.map((item, i) => (
        <TextMode
          isVisibleContextMenu={isVisibleContextMenu}
          setIsVisibleContextMenu={setIsVisibleContextMenu}
          key={`task-${i}`}
          todo={item}
          i={i}
          selectedTree={selectedTree}
          edited={(input, id) => {
            const taskForEdit = allTasks[id]

            const editedTask = {
              ...taskForEdit,
              task: input,
              updatedAt: Date.now(),
            }

            firebase.editTask(editedTask, userId, taskForEdit.id)
            dispatch(
              tasks.actions.editTask({
                id: taskForEdit.id,
                task: editedTask,
              }),
            )
            dispatch(ui.actions.select(null))
          }}
          remove={id => {
            firebase.deleteTask(userId, id)
            dispatch(tasks.actions.deleteTask(id))
            dispatch(ui.actions.select(null))
          }}
          done={id => {
            const completedTask = allTasks[id]

            const childrenTasks = Object.values(allTasks).filter(
              i => i.parentId === id,
            )

            const completed = {
              ...completedTask,
              done: !completedTask.done,
              updatedAt: Date.now(),
            }

            firebase.editTask(completed, userId, completedTask.id)
            dispatch(
              tasks.actions.editTask({
                id: completedTask.id,
                task: completed,
              }),
            )

            childrenTasks.forEach(c => {
              const updatedChildren = {
                ...c,
                done: !completedTask.done,
                updatedAt: Date.now(),
              }

              firebase.editTask(updatedChildren, userId, c.id)
              dispatch(
                tasks.actions.editTask({
                  id: c.id,
                  task: updatedChildren,
                }),
              )
            })

            dispatch(ui.actions.select(null))
          }}
          todos={allTasks}
          selected={(arg = null) => {
            const sum = (a, b) => a + b.selected
            if (arg !== null) {
              todos[i].selected = arg
            }
            if (todos.reduce(sum, 0) === 0) {
              todos.forEach(element => {
                element.selected = true
              })
              todos[i].selected = false
            } else if (todos[i].selected === false) {
              todos.forEach(element => {
                element.selected = false
              })
              todos[i].selected = false
            } else {
              todos.forEach(element => {
                element.selected = true
              })
              todos[i].selected = false
            }
          }}
        />
      ))}
      <AddMode
        selectedId={selectedId}
        selectedTask={selectedTask}
        type={type}
        added={input => {
          const getParentId = () => {
            if (type === 'YEAR') return null

            if (
              selectedTask &&
              selectedTask.type === 'YEAR' &&
              type === 'MONTH'
            )
              return selectedId

            if (selectedTask && selectedTask.type === 'MONTH' && type === 'DAY')
              return selectedId
          }

          const parent = allTasks[getParentId()]

          if (parent && parent.done) {
            const updatedParent = {
              ...parent,
              done: false,
              updatedAt: Date.now(),
            }
            firebase.editTask(updatedParent, userId, parent.id)

            dispatch(
              tasks.actions.editTask({
                id: parent.id,
                task: updatedParent,
              }),
            )
          }

          const newTaskId = nanoid(12)
          const newTask = {
            task: input,
            done: false,
            progress: 0,
            type,
            id: newTaskId,
            year: id.year,
            month: id.month || -1,
            day: id.day || -1,
            parentId: getParentId(),
            userId,
            createdAt: Date.now(),
            updatedAt: -1,
          }

          firebase.createTask(newTask, userId, newTaskId)
          dispatch(
            tasks.actions.createTask({
              id: newTaskId,
              task: newTask,
            }),
          )
          dispatch(ui.actions.select(null))
        }}
        selected={() => {
          todos.forEach(element => {
            element.selected = false
          })
        }}
      />
    </>
  )
}

export default TaskBox
