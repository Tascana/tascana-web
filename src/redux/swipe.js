import { createSlice } from '@reduxjs/toolkit'
import { format } from 'date-fns'

const INITIAL_STATE = {
  date: format(new Date(), 'yyyy-MM-dd'),
  swipeableLine: null,
  prevDate: null,
}

export const swipeSlice = createSlice({
  name: 'swipe',
  initialState: INITIAL_STATE,
  reducers: {
    swipe: (state, action) => {
      return {
        prevDate: action.payload.prevDate,
        date: action.payload.date,
        swipeableLine: action.payload.swipeableLine,
      }
    },
  },
})
