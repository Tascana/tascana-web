import { createSlice } from '@reduxjs/toolkit'

const now = new Date(Date.now())

const INITIAL_STATE = {
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  day: now.getDate(),
  prevyear: now.getFullYear(),
  prevmonth: now.getMonth() + 1,
  prevday: now.getDate(),
  isSelected: false,
  selectedId: null,
  swipeableLine: '',
}

const UISlice = createSlice({
  name: 'UI',
  initialState: INITIAL_STATE,
  reducers: {
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
    select: (state, action) => ({
      ...state,
      isSelected: true,
      selectedId: action.payload,
    }),
  },
})

export default UISlice
