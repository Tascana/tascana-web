import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
  authUser: null,
  firebaseReady: false,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: INITIAL_STATE,
  reducers: {
    setAuthUser: (state, action) => ({
      ...state,
      authUser: action.payload,
    }),
    firebaseReady: (state, action) => ({ ...state, firebaseReady: action.payload }),
  },
})

export default sessionSlice
