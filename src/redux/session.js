import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
  authUser: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: INITIAL_STATE,
  reducers: {
    setAuthUser: (state, action) => ({
      ...state,
      authUser: action.payload,
    }),
  },
})

export default sessionSlice
