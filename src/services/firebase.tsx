import * as firebase from 'firebase'
import app from 'firebase/app'
import 'firebase/database'
import 'firebase/analytics'

const config = {
  apiKey: window.__RUNTIME_CONFIG__.REACT_APP_API_KEY,
  authDomain: window.__RUNTIME_CONFIG__.REACT_APP_AUTH_DOMAIN,
  databaseURL: window.__RUNTIME_CONFIG__.REACT_APP_DATABASE_URL,
  projectId: window.__RUNTIME_CONFIG__.REACT_APP_PROJECT_ID,
  storageBucket: window.__RUNTIME_CONFIG__.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: window.__RUNTIME_CONFIG__.REACT_APP_MESSAGING_SENDER_ID,
  appId: window.__RUNTIME_CONFIG__.REACT_APP_APP_ID,
  measurementId: window.__RUNTIME_CONFIG__.REACT_APP_MEASUREMENT_ID,
}

export class Firebase {
  private app: firebase.app.App
  private db: firebase.database.Database
  private analytics: firebase.analytics.Analytics

  constructor() {
    this.app = app.initializeApp(config)

    this.db = app.database()
    this.analytics = app.analytics()
  }

  getInstance(): firebase.app.App {
    return this.app
  }

  user(uid: string) {
    return this.db.ref(`users/${uid}`)
  }

  tasks(uid: string) {
    return this.db
      .ref()
      .child(`todos/${uid}`)
      .orderByChild('createdAt')
  }

  createTask(task: any, uid: string, id: string) {
    return this.db.ref(`todos/${uid}/${id}`).set(task)
  }

  editTask(task: any, uid: string, id: string) {
    return this.db.ref(`todos/${uid}/${id}`).update(task)
  }

  deleteTask(uid: string, id: string) {
    return this.db.ref(`todos/${uid}/${id}`).remove()
  }

  setTasks(tasks: any, uid: string) {
    return this.db.ref(`todos/${uid}`).set(tasks)
  }

  logEvent(eventName: string, eventParams: any) {
    return this.analytics.logEvent(eventName, eventParams)
  }
}
