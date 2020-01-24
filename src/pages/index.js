import React, { useEffect, useContext } from 'react'
import { useDispatch } from 'react-redux'
import Lines from '../components/Lines'
import Header from '../components/Header'
import { FirebaseContext } from '../components/Firebase'
import useAuthorization from '../hooks/use-authorization'
import tasks from '../redux/tasks'

function IndexPage() {
  const firebase = useContext(FirebaseContext)
  const dispatch = useDispatch()

  const authUser = useAuthorization()

  useEffect(() => {
    if (authUser) {
      firebase.tasks(authUser.uid).once('value', snapshot => {
        if (!snapshot.val()) return

        dispatch(tasks.actions.setTasks(snapshot.val()))
      })
    }
  }, [authUser]) // eslint-disable-line

  if (!authUser) return null

  return (
    <>
      <Header />
      <Lines />
    </>
  )
}

export default IndexPage
