import { createSlice } from '@reduxjs/toolkit'

const now = new Date(Date.now())

const INITIAL_STATE = {
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  day: now.getDate(),
  prevyear: now.getFullYear(),
  prevmonth: now.getMonth() + 1,
  prevday: now.getDate(),
  isEditing: false,
  isSelected: false,
  selectedId: null,
  swipeableLine: '',
  selectedTree: [],
  sort: false,
}

const UISlice = createSlice({
  name: 'UI',
  initialState: INITIAL_STATE,
  reducers: {
    changeDate: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    set: (state, action) => {
      switch (action.payload.tasktype) {
        case 'YEAR':
          return {
            ...state,
            prevyear: state.year,
            year: state.year + action.payload.id,
            swipeableLine: 'YEAR',
          }
        case 'MONTH': {
          let date = new Date(
            state.year,
            state.month - 1 + action.payload.id,
            state.day,
          )
          date =
            +date.getMonth() + 1 !== state.month + action.payload.id &&
            +date.getMonth() !== 0 &&
            +date.getMonth() !== 11
              ? new Date(state.year, state.month + action.payload.id, 0)
              : date
          return {
            ...state,
            prevyear: state.year,
            prevmonth: state.month,
            prevday: state.day,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            day: date.getDate(),
            swipeableLine: 'MONTH',
          }
        }
        case 'DAY': {
          const date = new Date(
            state.year,
            state.month - 1,
            state.day + action.payload.id,
          )
          return {
            ...state,
            prevyear: state.year,
            prevmonth: state.month,
            prevday: state.day,
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            swipeableLine: 'DAY',
          }
        }
        default:
          return state
      }
    },
    setEditTask: (state, action) => ({
      ...state,
      isEditing: action.payload,
    }),
    select: (state, action) => ({
      ...state,
      isSelected: true,
      selectedId: action.payload,
    }),
    selectTree: (state, action) => ({
      ...state,
      selectedTree: action.payload,
    }),
    setSort: (state, action) => ({
      ...state,
      sort: action.payload,
    }),
  },
})

export const setSort = UISlice.actions.setSort

export const selectTreeAction = ({ todo }) => async (dispatch, getState) => {
  const {
    tasks,
    UI: { selectedId },
  } = getState()

  function getTree(id) {
    let parent = []

    function getParent(parentId) {
      if (parentId && tasks[parentId]) {
        parent.push(tasks[parentId])
        return getParent(tasks[parentId].parentId)
      }
      return parent.map(p => p.id)
    }

    function getChildren(todoId) {
      const todosArr = Object.values(tasks)

      const child = todosArr.filter(i => i.parentId === todoId)

      const allChild = [
        ...child,
        ...todosArr.filter(i => child.map(i => i.id).includes(i.parentId)),
      ]

      return allChild.map(c => c.id)
    }

    return [...getParent(todo.parentId), ...getChildren(todo.id)]
  }

  if (selectedId !== null) {
    if (selectedId === todo.id) {
      dispatch(UISlice.actions.select(null))
      dispatch(UISlice.actions.selectTree([]))
    } else {
      dispatch(UISlice.actions.select(todo.id))
      dispatch(UISlice.actions.selectTree(getTree()))
    }
  } else {
    dispatch(UISlice.actions.select(todo.id))
    dispatch(UISlice.actions.selectTree(getTree()))
  }
}

export default UISlice
