import { createSlice } from '@reduxjs/toolkit'
import nanoid from 'nanoid'
import differenceBy from 'lodash.differenceby'
import findLastIndex from 'lodash.findlastindex'
import { randomGrad } from '../components/Tasks/utils'
import { YEAR } from '../constants/task-types'
import { selectTreeAction } from './UI'
import { getTasksBy, getTaskById, getTree } from './utils'
import { firebase } from '../index'
import { getRandomBg } from '../constants/gradients'

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [],
  reducers: {
    loadTasks: (state, action) => {
      const loadedTasks = Object.values(action.payload).slice()

      const sortedLoadedTasks = loadedTasks
        .sort((a, b) => a.position - b.position)
        .map((t, index) => {
          if (t.index) delete t.index

          let task = { ...t }
          if (!Array.isArray(t.children)) task.children = []
          if (!Array.isArray(t.parents)) task.parents = []
          if (typeof task.incrementIndex !== 'number')
            task.incrementIndex = index

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
  } = getState()

  tasks.forEach((task, index, arr) => {
    if (!task.children.length) return

    const completedChildren = task.children
      .map(id => getTaskById(arr, id))
      .filter(t => t && t.progress === 100)

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

const updateTree = changedTask => (dispatch, getState) => {
  const {
    tasks,
    session: {
      authUser: { uid },
    },
  } = getState()

  const { parents, children } = getTree(tasks, {
    id: changedTask.id,
    firstParentId: changedTask.firstParentId,
  })

  dispatch(
    tasksSlice.actions.updateTask({
      id: changedTask.id,
      updatedFields: {
        children,
        parents,
      },
    }),
  )

  firebase.editTask(
    getTaskById(getState().tasks, changedTask.id),
    uid,
    changedTask.id,
  )

  const tree = [...parents, ...children]

  if (!tree.length) return

  tree.forEach(id => {
    const task = getTaskById(getState().tasks, id)

    let updatedFields = {}

    if (parents.length)
      updatedFields.children = task.children.concat(changedTask.id)
    if (children.length)
      updatedFields.parents = task.parents.concat(changedTask.id)

    dispatch(
      tasksSlice.actions.updateTask({
        id,
        updatedFields,
      }),
    )
    firebase.editTask(getTaskById(getState().tasks, id), uid, id)
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
  const lastIndex = findLastIndex(filteredTasks)

  const position = lastIndex + 1

  const id = nanoid()
  const createdAt = Date.now()

  const parent = getTaskById(tasks, parentId)

  const indexes = filteredTasks.map(t => t.incrementIndex)
  const nextIndex = indexes.length ? Math.max(...indexes) + 1 : 0

  const getBg = () => {
    if (type === YEAR) return getRandomBg(nextIndex)

    if (parent && type !== parent.type) return parent.background

    return 'linear-gradient(to bottom, #e2e2e2, #bbb)'
  }

  const background = getBg()

  /* Only year -> month -> day relationship */
  const isCorrectParent = parent && type !== parent.type

  const newTask = {
    id,
    incrementIndex: nextIndex,
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

  dispatch(updateTree(newTask))
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

export const changeColor = taskId => async (dispatch, getState) => {
  const {
    session: {
      authUser: { uid },
    },
    tasks,
    swipe: { date },
  } = getState()

  const year = new Date(date).getFullYear()
  const task = getTaskById(tasks, taskId)

  const indexes = getTasksBy(tasks)({ type: task.type, year }).map(
    t => t.incrementIndex,
  )
  const maxIndex = Math.max(...indexes)
  const newBg = getRandomBg()

  dispatch(
    tasksSlice.actions.updateTask({
      id: taskId,
      updatedFields: {
        incrementIndex: maxIndex + 1,
        background: newBg,
      },
    }),
  )
  firebase.editTask(getTaskById(getState().tasks, taskId), uid, taskId)

  task.children.forEach(id => {
    dispatch(
      tasksSlice.actions.updateTask({
        id,
        updatedFields: {
          background: newBg,
        },
      }),
    )
    firebase.editTask(getTaskById(getState().tasks, id), uid, id)
  })
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

  const deletedTask = getTaskById(tasks, id)

  const tree = [...deletedTask.children, ...deletedTask.parents]

  if (tree.length) {
    tree.forEach(id => {
      const task = getTaskById(getState().tasks, id)

      let updatedFields = {}

      if (deletedTask.parents.length) {
        updatedFields.children = task.children.filter(t => t.id === id)
      }
      if (deletedTask.children.length) {
        updatedFields.parents = task.parents.filter(t => t.id === id)
        updatedFields.firstParentId = null
        updatedFields.background = 'linear-gradient(to bottom, #e2e2e2, #bbb)'
      }

      dispatch(
        tasksSlice.actions.updateTask({
          id,
          updatedFields,
        }),
      )
      firebase.editTask(getTaskById(getState().tasks, id), uid, id)
    })
  }

  dispatch(tasksSlice.actions.deleteTask(id))
  firebase.deleteTask(uid, id)

  dispatch(recalculateProgress())
}

export const sortTask = tasks => (dispatch, getState) => {
  const {
    tasks: tasksFromStore,
    session: {
      authUser: { uid },
    },
  } = getState()

  let objTasks = {}

  const tasksWithoutSorted = differenceBy(tasksFromStore, tasks, 'id')
  const allTasks = [...tasksWithoutSorted, ...tasks]

  allTasks.forEach(t => {
    objTasks[t.id] = t
  })

  dispatch(tasksSlice.actions.loadTasks(objTasks))
  firebase.setTasks(objTasks, uid)
}
