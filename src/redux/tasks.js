import { createSlice } from '@reduxjs/toolkit'
import omit from 'lodash/omit'
import nanoid from 'nanoid'
import { DAY, MONTH, YEAR } from '../constants/task-types'
import { randomGrad } from '../components/TaskBox/utils'
import uiSlice from './UI'

const INITIAL_STATE = []

function getTree(tasks, task) {
  const tasksArray = Object.values(tasks)

  let parents = []
  let children = []

  if (!task) {
    return {
      parents,
      children,
    }
  }

  function getParents(parentId) {
    if (!parentId) return parents
    parents.push(tasks[parentId])
    return getParents(tasks[parentId].parentId)
  }

  function getChildren(ids) {
    const childs = tasksArray.filter(task => ids.includes(task.parentId))

    if (!childs.length) return children
    children.push(...childs)
    return getChildren(childs.map(c => c.id))
  }

  return {
    parents: getParents(task.parentId),
    children: getChildren([task.id]),
  }
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: INITIAL_STATE,
  reducers: {
    setTasks: (state, { payload: tasks }) => {
      const tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks)
      const computedTasksArray = tasksArray.map((task, index, arr) => {
        const unassignedGradient = 'linear-gradient(to bottom, #e2e2e2, #bbb)'

        const { parents, children } = getTree(tasks, task)

        function getGradient() {
          if (task.type === YEAR) return randomGrad(task.createdAt)

          const yearLevelParent = parents.find(p => p.type === YEAR)
          const monthLevelParent = parents.find(p => p.type === MONTH)

          if (yearLevelParent) return randomGrad(yearLevelParent.createdAt)
          if (monthLevelParent) return randomGrad(monthLevelParent.createdAt)

          return unassignedGradient
        }

        function getProgress() {
          return children.filter(c => c.done).length
            ? (children.filter(c => c.done).length / children.length) * 100
            : 0
        }

        return {
          ...task,
          parents,
          children,
          done: getProgress() === 100 ? true : task.done,
          backgroundGradient: getGradient(),
          position: typeof task.position !== 'number' ? index : task.position,
          progress: getProgress(),
        }
      })

      return computedTasksArray.sort((a, b) => a.position - b.position)
    },
    createTask: (state, action) => ({
      ...state,
      [action.payload.id]: action.payload.task,
    }),
    editTask: (state, action) => ({
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        ...action.payload.task,
      },
    }),
    deleteTask: (state, action) => omit(state, action.payload),
  },
})

export const sortTasksAction = ({ reorderedTasks, firebase, type }) => async (
  dispatch,
  getState,
) => {
  try {
    const { tasks: allTasks, session } = getState()
    const userId = session.authUser.uid
    let objectTasks = {}

    const filteredTasks = allTasks.filter(t => t.type !== type)
    const sortedTasks = [...filteredTasks, ...reorderedTasks]

    sortedTasks.forEach(t => {
      objectTasks[t.id] = t
    })

    firebase.setTasks(objectTasks, userId)
  } catch (e) {
    console.log(e)
  }
}

export const createTaskAction = ({
  type,
  subtype = null,
  text,
  firebase,
  id,
}) => async (dispatch, getState) => {
  try {
    const { UI, tasks, session } = getState()
    const userId = session.authUser.uid
    const { selectedId } = UI
    const selectedTask = tasks.find(t => t.id === selectedId)

    const getParentId = () => {
      if (
        selectedTask &&
        ((selectedTask.type === YEAR && type === MONTH) ||
          (selectedTask.type === MONTH && type === DAY))
      ) {
        return selectedId
      }
      return null
    }

    function getPosition() {
      let filteredTasks = tasks.filter(t => t.type === type)

      if (subtype) filteredTasks = tasks.filter(t => t.subtype === subtype)

      return filteredTasks.length
    }

    const newTaskId = nanoid(12)
    const newTask = {
      task: text,
      done: false,
      progress: 0,
      type,
      subtype,
      id: newTaskId,
      year: id.year,
      month: id.month || -1,
      day: id.day || -1,
      parentId: getParentId(),
      position: getPosition(),
      userId,
      createdAt: Date.now(),
      updatedAt: -1,
    }

    firebase.createTask(newTask, userId, newTaskId)
    dispatch(uiSlice.actions.select(null))
  } catch (e) {
    console.error(e)
  }
}

export const editTaskAction = ({
  id,
  firebase,
  updatedData,
  isSort = false,
}) => async (dispatch, getState) => {
  try {
    const { tasks, session } = getState()
    const userId = session.authUser.uid

    const taskForEdit = tasks.find(t => t.id === id)

    const editedTask = {
      ...taskForEdit,
      ...updatedData,
      updatedAt: Date.now(),
    }

    firebase.editTask(editedTask, userId, taskForEdit.id)
    if (!isSort) dispatch(uiSlice.actions.select(null))
  } catch (e) {
    console.error(e)
  }
}

export const removeTaskAction = ({ firebase, id }) => async (
  dispatch,
  getState,
) => {
  try {
    const { session, tasks } = getState()
    const userId = session.authUser.uid
    const task = tasks.find(t => t.id === id)

    firebase.deleteTask(userId, id)

    task.children.forEach(c => {
      firebase.deleteTask(userId, c.id)
    })
  } catch (e) {}
}

export const doneTaskAction = ({ id, firebase }) => async (
  dispatch,
  getState,
) => {
  try {
    const { session, tasks } = getState()
    const userId = session.authUser.uid
    const completedTask = tasks.find(t => t.id === id)

    const completed = {
      ...completedTask,
      done: !completedTask.done,
      updatedAt: Date.now(),
    }

    firebase.editTask(completed, userId, completedTask.id)

    dispatch(uiSlice.actions.select(null))
  } catch (e) {
    console.log(e)
  }
}

export default tasksSlice
