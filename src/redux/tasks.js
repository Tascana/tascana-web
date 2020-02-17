import { createSlice } from '@reduxjs/toolkit'
import nanoid from 'nanoid'
import isEqual from 'lodash/isEqual'
import differenceBy from 'lodash/differenceBy'
import findLastIndex from 'lodash/findLastIndex'
import { randomGrad } from '../components/Tasks/utils'
import { YEAR } from '../constants/task-types'
import { selectTreeAction } from './UI'
import { getTasksBy, getTaskById, getTree } from './utils'
import { firebase } from '../index'

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [],
  reducers: {
    loadTasks: (state, action) => {
      const loadedTasks = Object.values(action.payload).slice()

      const sortedLoadedTasks = loadedTasks
        .sort((a, b) => a.position - b.position)
        .map(t => {
          let task = { ...t }
          if (!Array.isArray(t.children)) task.children = []
          if (!Array.isArray(t.parents)) task.parents = []

          return task
        })
      return sortedLoadedTasks
    },
    createTask: (state, action) => [...state, action.payload],
    updateTask: (state, action) =>
      state.map(task => {
        if (task.id === action.payload.id) {
          return {
            ...task,
            ...action.payload.updatedFields,
          }
        }

        return task
      }),
    deleteTask: (state, action) =>
      state.filter(task => task.id !== action.payload),
  },
})

const recalculateProgress = () => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
    UI: { day, month, year },
  } = getState()

  getTasksBy(tasks)({ day, month, year }).forEach((task, index, arr) => {
    if (!task.children.length) return

    const completedChildren = task.children
      .map(id => getTaskById(arr, id))
      .filter(t => t.progress === 100)

    const progress = completedChildren.length
      ? (completedChildren.length / task.children.length) * 100
      : 0

    if (task.progress !== progress) {
      dispatch(
        tasksSlice.actions.updateTask({
          id: task.id,
          updatedFields: {
            progress,
          },
        }),
      )
      firebase.editTask(getTaskById(getState().tasks, task.id), uid, task.id)

      dispatch(recalculateProgress())
    } else {
      return
    }
  })
}

const updateTree = () => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
    UI: { day, month, year },
  } = getState()

  getTasksBy(tasks)({ day, month, year }).forEach((task, index, arr) => {
    const { parents, children } = getTree(arr, {
      id: task.id,
      firstParentId: task.firstParentId,
    })

    if (!isEqual(parents, task.parents)) {
      dispatch(
        tasksSlice.actions.updateTask({
          id: task.id,
          updatedFields: {
            parents,
          },
        }),
      )
      firebase.editTask(getTaskById(getState().tasks, task.id), uid, task.id)
    }

    if (!isEqual(children, task.children)) {
      dispatch(
        tasksSlice.actions.updateTask({
          id: task.id,
          updatedFields: {
            children,
          },
        }),
      )
      firebase.editTask(getTaskById(getState().tasks, task.id), uid, task.id)
    }
  })
}

export const createTask = ({ type, subtype, text, day, month, year }) => async (
  dispatch,
  getState,
) => {
  const {
    session,
    tasks,
    UI: {
      selectedTree,
      addMode: { child: childId },
    },
  } = getState()
  const userId = session.authUser.uid
  const [parentId] = selectedTree // Has selected parent

  const filteredTasks = getTasksBy(tasks)({ type, subtype, day, month, year })
  const newTaskIndex = findLastIndex(filteredTasks)

  const position = newTaskIndex + 1

  const id = nanoid()
  const createdAt = Date.now()

  const parent = getTaskById(tasks, parentId)

  const getBg = () => {
    if (type === YEAR) return randomGrad(newTaskIndex + 1)

    if (parent && type !== parent.type) return parent.background

    return 'linear-gradient(to bottom, #e2e2e2, #bbb)'
  }

  const background = getBg()

  /* Only year -> month -> day relationship */
  const isCorrectParent = parent && type !== parent.type

  const newTask = {
    id,
    background,
    progress: 0,
    parents: [],
    children: [],
    year,
    position,
    type,
    text,
    createdAt,
    userId,
  }

  if (isCorrectParent) newTask.firstParentId = parentId
  if (month) newTask.month = month
  if (day) newTask.day = day
  if (subtype) newTask.subtype = subtype

  dispatch(tasksSlice.actions.createTask(newTask))
  firebase.createTask(newTask, userId, id)

  if (childId) dispatch(linkTasks({ childId, parentId: id }))

  dispatch(updateTree())
  dispatch(recalculateProgress())

  if (isCorrectParent)
    dispatch(selectTreeAction({ todo: parent, addedTaskId: id }))
}

export const linkTasks = ({ childId, parentId }) => async (
  dispatch,
  getState,
) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
  } = getState()

  const child = getTaskById(tasks, childId)
  const parent = getTaskById(tasks, parentId)

  dispatch(
    tasksSlice.actions.updateTask({
      id: parent.id,
      updatedFields: {
        children: parent.children.concat(childId),
      },
    }),
  )
  firebase.editTask(getTaskById(getState().tasks, parent.id), uid, parent.id)

  dispatch(
    tasksSlice.actions.updateTask({
      id: child.id,
      updatedFields: {
        parents: child.parents.concat(parentId),
        firstParentId: parentId,
        background: parent.background,
      },
    }),
  )
  firebase.editTask(getTaskById(getState().tasks, child.id), uid, child.id)

  dispatch(recalculateProgress())
}

export const editTask = payload => async (dispatch, getState) => {
  const {
    session: {
      authUser: { uid },
    },
  } = getState()

  dispatch(tasksSlice.actions.updateTask(payload))
  firebase.editTask(getTaskById(getState().tasks, payload.id), uid, payload.id)
}

export const completeTask = id => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
  } = getState()

  const task = getTaskById(tasks, id)

  const isComplete = task.progress === 100
  console.log(task.children)

  if (task.children.length) {
    task.children.forEach(id => {
      dispatch(
        tasksSlice.actions.updateTask({
          id,
          updatedFields: {
            progress: isComplete ? 0 : 100,
          },
        }),
      )
      firebase.editTask(getTaskById(getState().tasks, id), uid, id)
    })

    dispatch(recalculateProgress())

    return
  }

  dispatch(
    tasksSlice.actions.updateTask({
      id,
      updatedFields: {
        progress: isComplete ? 0 : 100,
      },
    }),
  )
  firebase.editTask(getTaskById(getState().tasks, id), uid, id)

  dispatch(recalculateProgress())
}

export const deleteTask = id => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
  } = getState()

  const task = getTaskById(tasks, id)

  if (task.children.length) {
    task.children
      .map(id => getTaskById(tasks, id))
      .forEach(t => {
        dispatch(
          tasksSlice.actions.updateTask({
            id: t.id,
            updatedFields: {
              parents: t.parents.filter(t => t.id === id),
              firstParentId: null,
              background: 'linear-gradient(to bottom, #e2e2e2, #bbb)',
            },
          }),
        )
        firebase.editTask(getTaskById(getState().tasks, t.id), uid, t.id)
      })
  }

  dispatch(tasksSlice.actions.deleteTask(id))
  firebase.deleteTask(uid, id)

  dispatch(updateTree())
  dispatch(recalculateProgress())
}

export const sortTask = tasks => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
  } = getState()

  let objTasks = {}

  const tasksWithoutSorted = differenceBy(tasks, tasks, 'id')
  const allTasks = [...tasksWithoutSorted, ...tasks]

  allTasks.forEach(t => {
    objTasks[t.id] = t
  })

  dispatch(tasksSlice.actions.loadTasks(allTasks))
  firebase.setTasks(objTasks, uid)
}
