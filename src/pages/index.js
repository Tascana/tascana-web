import React, { useEffect, useContext } from 'react'
import { useDispatch } from 'react-redux'
import Lines from '../components/Lines'
import Header from '../components/Header'
import { FirebaseContext } from '../components/Firebase'
import ContextMenu from '../components/ContextMenu'
import useAuthorization from '../hooks/use-authorization'
import { tasksSlice } from '../redux/tasks'

function IndexPage() {
  const firebase = useContext(FirebaseContext)
  const dispatch = useDispatch()

  const authUser = useAuthorization()

  useEffect(() => {
    function blockHorizontalScroll() {
      window.scrollTo(0, window.scrollY)
    }

    window.addEventListener('scroll', blockHorizontalScroll, {
      passive: true,
      capture: true,
    })

    return () => {
      window.removeEventListener('scroll', blockHorizontalScroll, {
        passive: true,
        capture: true,
      })
    }
  })

  useEffect(() => {
    dispatch(tasksSlice.actions.loadTasks({}))
    if (authUser) {
      firebase.tasks(authUser.uid).once('value', snapshot => {
        if (!snapshot.val()) return
        dispatch(tasksSlice.actions.loadTasks(snapshot.val()))
      })
    }
  }, [authUser]) // eslint-disable-line

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
