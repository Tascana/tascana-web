import { createSlice } from '@reduxjs/toolkit'
import format from 'date-fns/format'

const INITIAL_STATE = {
  date: format(new Date(), 'yyyy-MM-dd'),
  prevDate: null,
  virtualDate: null,
  virtualPrevDate: null,
  keyStroke: false,
}

export const swipeSlice = createSlice({
  name: 'swipe',
  initialState: INITIAL_STATE,
  reducers: {
    swipe: (state, action) => {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})
