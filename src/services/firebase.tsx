import * as firebase from 'firebase'
import app from 'firebase/app'
import 'firebase/database'
import 'firebase/analytics'

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
}

export class Firebase {
  private app: firebase.app.App
  private db: firebase.database.Database

  constructor() {
    this.app = app.initializeApp(config)

    this.db = app.database()
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
}
