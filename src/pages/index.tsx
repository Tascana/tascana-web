import React, { useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Lines from '../components/Lines'
import Header from '../components/Header'
import { FirebaseContext } from '../context/firebase'
import ContextMenu from '../components/ContextMenu'
import { tasksSlice } from '../redux/tasks'
import { useAuthStateChange } from '../hooks/use-auth-state-change'
import { useAuth } from '../hooks/use-auth'
import { useLogger } from '../hooks/use-logger'

function IndexPage() {
  useAuthStateChange()

  const firebase = useContext(FirebaseContext)
  const { logEvent } = useLogger()
  const dispatch = useDispatch()
  // @ts-ignore
  const isSort = useSelector(state => state.UI.sort)

  const [, authUser] = useAuth()

  useEffect(() => {
    if (authUser) {
      logEvent('visit_of_the_task_page')

      firebase.tasks(authUser.uid).once('value', snapshot => {
        if (!snapshot.val()) {
          dispatch(tasksSlice.actions.loadTasks({}))
          return
        }

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

  // @ts-ignore
  useEffect(() => {
    // @ts-ignore
    document.getElementById('landing-root').style.display = 'none'
    document.body.style.height = 'initial'
    document.body.style.overflow = 'initial'

    // @ts-ignore
    return () => (document.getElementById('landing-root').style.display = 'block')
  }, [])

  if (!authUser) return null

  return (
    <>
      <Header />
      <Lines />
      {/*@ts-ignore*/}
      <ContextMenu />
    </>
  )
}

export default IndexPage
