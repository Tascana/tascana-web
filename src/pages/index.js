import React, { useEffect, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Line from '../components/Line'
import Header from '../components/Header'
import {
  translateDay,
  translateMonth,
  translateYear,
} from '../components/Line/utils'
import { FirebaseContext } from '../components/Firebase'
import useAuthorization from '../hooks/use-authorization'
import tasks from '../redux/tasks'

const getLineProps = ({ tasks, UI }, type) => {
  switch (type) {
    case 'YEAR':
      return {
        num: Object.keys(tasks).length,
        itemsOnPage: [
          {
            id: { year: UI.year - 1 },
            name: translateYear(UI.year - 1),
          },
          { id: { year: UI.year }, name: translateYear(UI.year) },
          {
            id: { year: UI.year + 1 },
            name: translateYear(UI.year + 1),
          },
        ],
        UI,
      }
    case 'MONTH': {
      const date1 = new Date(UI.year, UI.month - 2, UI.day)
      const date2 = new Date(UI.year, UI.month - 1, UI.day)
      const date3 = new Date(UI.year, UI.month, UI.day)

      return {
        num: Object.keys(tasks).length,
        itemsOnPage: [
          {
            id: { year: date1.getFullYear(), month: date1.getMonth() + 1 },
            name: translateMonth(date1.getMonth() + 1, date1.getFullYear()),
          },
          {
            id: { year: date2.getFullYear(), month: date2.getMonth() + 1 },
            name: translateMonth(date2.getMonth() + 1, date2.getFullYear()),
          },
          {
            id: { year: date3.getFullYear(), month: date3.getMonth() + 1 },
            name: translateMonth(date3.getMonth() + 1, date3.getFullYear()),
          },
        ],
        UI,
      }
    }
    case 'DAY': {
      const date1 = new Date(UI.year, UI.month - 1, UI.day - 1)
      const date2 = new Date(UI.year, UI.month - 1, UI.day)
      const date3 = new Date(UI.year, UI.month - 1, UI.day + 1)

      return {
        num: Object.keys(tasks).length,
        itemsOnPage: [
          {
            id: {
              year: date1.getFullYear(),
              month: date1.getMonth() + 1,
              day: date1.getDate(),
            },
            name: translateDay(date1),
          },
          {
            id: {
              year: date2.getFullYear(),
              month: date2.getMonth() + 1,
              day: date2.getDate(),
            },
            name: translateDay(date2),
          },
          {
            id: {
              year: date3.getFullYear(),
              month: date3.getMonth() + 1,
              day: date3.getDate(),
            },
            name: translateDay(date3),
          },
        ],
        UI,
      }
    }
    default:
      break
  }
}

function IndexPage() {
  const ui = useSelector(state => state.ui)
  const tasksFromStore = useSelector(state => state.tasks)
  const firebase = useContext(FirebaseContext)
  const dispatch = useDispatch()

  useEffect(() => {
    firebase.tasks().once('value', snapshot => {
      if (!snapshot.val()) return

      dispatch(tasks.actions.setTasks(snapshot.val()))
    })
  }, [])

  const isAuth = useAuthorization()

  if (!isAuth) return null

  return (
    <>
      <Header />
      <Line
        type="YEAR"
        {...getLineProps({ tasks: tasksFromStore, UI: ui }, 'YEAR')}
      />
      <Line
        type="MONTH"
        {...getLineProps({ tasks: tasksFromStore, UI: ui }, 'MONTH')}
      />
      <Line
        type="DAY"
        {...getLineProps({ tasks: tasksFromStore, UI: ui }, 'DAY')}
      />
    </>
  )
}

export default IndexPage
