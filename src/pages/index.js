import React, { useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Lines from '../components/Lines'
import Header from '../components/Header'
import { FirebaseContext } from '../components/Firebase'
import ContextMenu from '../components/ContextMenu'
import useAuthorization from '../hooks/use-authorization'
import { tasksSlice } from '../redux/tasks'

function IndexPage() {
  const firebase = useContext(FirebaseContext)
  const dispatch = useDispatch()
  const isSort = useSelector(state => state.UI.sort)

  const authUser = useAuthorization()

  useEffect(() => {
    dispatch(tasksSlice.actions.loadTasks({}))
    if (authUser) {
      firebase.tasks(authUser.uid).once('value', snapshot => {
        if (!snapshot.val()) return
        dispatch(tasksSlice.actions.loadTasks(snapshot.val()))
      })
    }
  }, [authUser]) // eslint-disable-line

  useEffect(() => {
    if (isSort) {
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.cursor = 'default'
    }
  }, [isSort])

  if (!authUser) return null

  return (
    <>
      <Header />
      <Lines />
      <ContextMenu />
    </>
  )
}

export default IndexPage
