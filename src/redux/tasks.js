import { createSlice } from '@reduxjs/toolkit'
import omit from 'lodash/omit'
import nanoid from 'nanoid'
import { DAY, MONTH, YEAR } from '../constants/task-types'
import uiSlice from './UI'

const INITIAL_STATE = {}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: INITIAL_STATE,
  reducers: {
    setTasks: (state, { payload: tasks }) => {
      Object.keys(tasks).forEach((id, index) => {
        tasks[id].id = id

        if (typeof tasks[id].position !== 'number') {
          tasks[id].position = index
        }
      })

      return {
        ...state,
        ...tasks,
      }
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

const { editTask, createTask, deleteTask } = tasksSlice.actions

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
    const selectedTask = tasks[selectedId]

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

    const parent = getParentId() ? tasks[getParentId()] : null

    if (parent && parent.done) {
      const updatedParent = {
        ...parent,
        done: false,
        updatedAt: Date.now(),
      }
      firebase.editTask(updatedParent, userId, parent.id)

      dispatch(
        editTask({
          id: parent.id,
          task: updatedParent,
        }),
      )
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
      userId,
      createdAt: Date.now(),
      updatedAt: -1,
    }

    firebase.createTask(newTask, userId, newTaskId)
    dispatch(
      createTask({
        id: newTaskId,
        task: newTask,
      }),
    )
    dispatch(uiSlice.actions.select(null))
  } catch (e) {}
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

    const taskForEdit = tasks[id]

    const editedTask = {
      ...taskForEdit,
      ...updatedData,
      updatedAt: Date.now(),
    }

    firebase.editTask(editedTask, userId, taskForEdit.id)
    dispatch(
      editTask({
        id: taskForEdit.id,
        task: editedTask,
      }),
    )
    if (!isSort) dispatch(uiSlice.actions.select(null))
  } catch (e) {}
}

export const removeTaskAction = ({ firebase, todo }) => async (
  dispatch,
  getState,
) => {
  try {
    const { session, tasks } = getState()
    const userId = session.authUser.uid

    function remove(taskId) {
      firebase.deleteTask(userId, taskId)
      dispatch(deleteTask(taskId))
      dispatch(uiSlice.actions.select(null))
    }

    remove(todo.id)
    const todosArr = Object.values(tasks)

    const child = todosArr.filter(i => i.parentId === todo.id)

    const allChild = [
      ...child,
      ...todosArr.filter(i => child.map(i => i.id).includes(i.parentId)),
    ]

    if (allChild.length) {
      allChild.forEach(c => {
        remove(c.id)
      })
    }
  } catch (e) {}
}

export const doneTaskAction = ({ id, firebase }) => async (
  dispatch,
  getState,
) => {
  try {
    const { session, tasks } = getState()
    const userId = session.authUser.uid
    const completedTask = tasks[id]

    const childrenTasks = Object.values(tasks).filter(i => i.parentId === id)

    const completed = {
      ...completedTask,
      done: !completedTask.done,
      updatedAt: Date.now(),
    }

    firebase.editTask(completed, userId, completedTask.id)
    dispatch(
      editTask({
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
        editTask({
          id: c.id,
          task: updatedChildren,
        }),
      )
    })

    dispatch(uiSlice.actions.select(null))
  } catch (e) {}
}

export default tasksSlice
