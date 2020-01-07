/* 

const tasks = [{task:"test1", done: false, year:0, month: 0, type:[YEAR,MONTH,DAY], date: 1213121312},...];
const UI = [{year: 0, month: 0, day: 0, isSelected=false, selectedId:0}]
-> Add
-> Edit
-> Select

*/

export function tasks(state = {}, action) {
  switch (action.type) {
    case 'ADD_TASK':
      switch (action.tasktype) {
        case 'YEAR':
          return {
            ...state,
            [Object.keys(state).length]: {
              task: action.text,
              done: false,
              progress: 0,
              type: action.tasktype,
              date: action.date,
              year: action.year,
              month: -1,
              day: -1,
              selected: false,
              parent: Object.keys(state).length,
            },
          }
        case 'MONTH':
          return {
            ...state,
            [Object.keys(state).length]: {
              task: action.text,
              done: false,
              progress: 0,
              type: action.tasktype,
              date: action.date,
              year: action.year,
              month: action.month,
              day: -1,
              selected: false,
              parent: action.parentid,
            },
          }
        case 'DAY':
          return {
            ...state,
            [Object.keys(state).length]: {
              task: action.text,
              done: false,
              type: action.tasktype,
              date: action.date,
              year: action.year,
              month: action.month,
              day: action.day,
              selected: false,
              parent: action.parentid,
            },
          }
        default:
          return {
            ...state,
            [Object.keys(state).length]: {
              task: action.text,
              done: false,
              type: action.tasktype,
              date: action.date,
              year: -2,
              month: -2,
              day: -2,
              selected: false,
              parent: -2,
            },
          }
      }
    case 'EDIT_TASK':
      return {
        ...state,
        [action.id]: { ...state[action.id], task: action.text },
      }
    case 'TOGGLE_TASK':
      return {
        ...state,
        [action.id]: { ...state[action.id], done: !state[action.id].done },
      }
    // For now, don't handle any actions
    // and just return the state given to us.
    default:
      return state
  }
}

const now = new Date(Date.now())

export function UI(
  state = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    prevyear: now.getFullYear(),
    prevmonth: now.getMonth() + 1,
    prevday: now.getDate(),
    isSelected: false,
    selectedId: 0,
  },
  action,
) {
  switch (action.type) {
    case 'SET':
      switch (action.tasktype) {
        case 'YEAR':
          return {
            ...state,
            prevyear: state.year,
            year: state.year + action.id,
          }
        case 'MONTH':
          console.log(state.year, state.month + action.id, state.day)
          {
            var date = new Date(
              state.year,
              state.month - 1 + action.id,
              state.day,
            )
            console.log(date)
            date =
              date.getMonth() + 1 != state.month + action.id &&
              date.getMonth() != 0 &&
              date.getMonth() != 11
                ? new Date(state.year, state.month + action.id, 0)
                : date
            return {
              ...state,
              prevyear: state.year,
              prevmonth: state.month,
              prevday: state.day,
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              day: date.getDate(),
            }
          }
        case 'DAY': {
          const date = new Date(
            state.year,
            state.month - 1,
            state.day + action.id,
          )
          return {
            ...state,
            prevyear: state.year,
            prevmonth: state.month,
            prevday: state.day,
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
          }
        }
        default:
          return state
      }
    case 'SELECT':
      return { ...state, isSelected: true, selectedId: action.id }
    // For now, don't handle any actions
    // and just return the state given to us.
    default:
      return state
  }
}

export const getTodosByType = (
  store,
  type,
  year = -1,
  month = -1,
  day = -1,
) => {
  const todos = Object.entries(store.tasks).map(i => ({ ...i[1], id: i[0] }))
  switch (type) {
    case 'YEAR':
      return todos.filter(todo => todo.type === type && todo.year === year)
    case 'MONTH':
      return todos.filter(
        todo =>
          todo.type === type && todo.year === year && todo.month === month,
      )
    case 'DAY':
      return todos.filter(
        todo =>
          todo.type === type &&
          todo.year === year &&
          todo.month === month &&
          todo.day === day,
      )
    default:
      return todos
  }
}

export const user = (
  state = JSON.parse(localStorage.getItem('authUser')),
  action,
) => {
  const { type, payload } = action

  switch (type) {
    case 'SIGN_IN':
      return payload
    case 'SIGN_OUT':
      return null
    default:
      return state
  }
}

export default tasks
