import React, { useRef, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { getTodosByType } from '../../redux/reducer'
import { FirebaseContext } from '../Firebase'
import ui from '../../redux/ui'
import tasks from '../../redux/tasks'
import classes from './styles.module.scss'

function hwb(hue, sat, int) {
  const h = (hue % 360) / 60
  const s = sat / 100
  const i = int / 100

  const z = 1 - Math.abs((h % 2) - 1)
  const c = (3 * i * s) / (1 + z)
  const x = c * z

  const j = Math.floor(h)

  let r, g, b

  switch (j) {
    default:
    case 6:
    case 0:
      r = c
      g = x
      b = 0
      break
    case 1:
      r = x
      g = c
      b = 0
      break
    case 2:
      r = 0
      g = c
      b = x
      break
    case 3:
      r = 0
      g = x
      b = c
      break
    case 4:
      r = x
      g = 0
      b = c
      break
    case 5:
      r = c
      g = 0
      b = x
      break
  }

  const m = i * (1 - s)
  r += m
  g += m
  b += m

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255,
  )})`
}

const ProgressBar = ({ progress }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={classes.ProgressBar}
  >
    <defs>
      <clipPath id="clipPath">
        <rect x="0.5" y="0.5" rx="4.8" ry="4.8" width="99" height="99" />
      </clipPath>
    </defs>

    <rect x="0" y="98.5" width={progress * 0.94 + 6} height="1" />
  </svg>
)

function TextMode({ todo, edited, selected, i, todos }) {
  const textField = useRef(null)
  const bg = useRef(null)
  const dispatch = useDispatch()
  const selectedId = useSelector(state => state.ui.selectedId)

  function randomGrad(i) {
    const modifiedI = Math.ceil(
      i +
        ''
          .split('')
          .reverse()
          .join('') /
          10000000000,
    )
    const deg = ((20 * modifiedI) % 360) + 190
    const s = 50
    const l = 60

    return `linear-gradient(330deg, ${hwb(deg + 25, s - 40, l + 30)} 0%, ${hwb(
      deg,
      s,
      l,
    )} 100%)`
  }

  let gradient = randomGrad(
    Math.ceil(todo.parent ? todos[todo.parent].date : todo.date),
  )

  if (todo.type === 'DAY') {
    const month = todos[todo.parent].parent
    const year = todos[month]

    gradient = randomGrad(Math.ceil(year.date))
  }

  return (
    <div
      onClick={() => {
        // textField.current.contentEditable = true
        // textField.current.focus()

        if (todo.type === 'DAY') return

        if (selectedId !== null) {
          if (selectedId === todo.id) dispatch(ui.actions.select(null))
          else dispatch(ui.actions.select(todo.id))
        } else dispatch(ui.actions.select(todo.id))
      }}
      onMouseDown={e => {
        if (e.detail > 1) e.preventDefault()
      }}
      // onClick={e => {
      //   if (!e.currentTarget.getAttribute('clicked')) {
      //     console.log('click')
      //     selected()
      //   }
      //   e.currentTarget.setAttribute('clicked', true)
      //   setTimeout(
      //     e => {
      //       e.removeAttribute('clicked')
      //     },
      //     500,
      //     e.currentTarget,
      //   )
      // }}
      className={cx(classes.TaskBox, {
        [classes.BoxSelected]: selectedId === todo.id,
        [classes.BoxUnselected]: selectedId !== null && selectedId !== todo.id,
      })}
      style={{ background: gradient }}
      ref={bg}
    >
      <div style={{ padding: '15px' }}>
        <div
          onBlur={item => {
            edited(item.target.innerHTML)
            item.target.contentEditable = false
          }}
          className={classes.TextBoxContents}
          contentEditable={false}
          spellCheck={false}
          ref={textField}
        >
          {todo.task}
        </div>
      </div>

      {todo.type === 'MONTH' || todo.type === 'YEAR' ? (
        <ProgressBar progress={todo.progress} />
      ) : (
        ''
      )}
    </div>
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

function getTodos(state, type, id) {
  switch (type) {
    case 'YEAR':
      return getTodosByType(state, type, id.year)
    case 'MONTH':
      return getTodosByType(state, type, id.year, id.month)
    case 'DAY':
      return getTodosByType(state, type, id.year, id.month, id.day)
    default:
      break
  }
}

function TaskBox({ type, id }) {
  const todos = useSelector(state => getTodos(state, type, id))
  const allTasks = useSelector(state => state.tasks)
  const selectedId = useSelector(state => state.ui.selectedId)
  const selectedTask = useSelector(
    state => state.tasks[selectedId],
    () => !!selectedId,
  )
  const dispatch = useDispatch()
  const firebase = useContext(FirebaseContext)

  return (
    <>
      {todos.map((item, i) => (
        <TextMode
          key={`task-${i}`}
          todo={item}
          i={i}
          edited={input => {
            todos[i].task = input
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
          const newTaskId = Date.now()
          const newTask = {
            task: input,
            done: false,
            progress: 0,
            type,
            date: newTaskId,
            year: id.year,
            month: id.month || -1,
            day: id.day || -1,
            parent: getParentId(),
          }

          firebase.createTask(newTask, newTaskId)
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
