import firebase from 'firebase'
import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/analytics'

import { IAuthProvider } from '../context/auth'

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

export class Firebase implements IAuthProvider {
  private auth: firebase.auth.Auth
  private db: firebase.database.Database
  private analytics: firebase.analytics.Analytics
  private googleProvider: firebase.auth.GoogleAuthProvider
  private facebookProvider: firebase.auth.FacebookAuthProvider

  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()
    this.analytics = app.analytics()

    this.googleProvider = new app.auth.GoogleAuthProvider()
    this.facebookProvider = new app.auth.FacebookAuthProvider()
  }

  signInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

  signInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider)

  signOut = () => this.auth.signOut()

  onAuthUserListener = (next: (...args: any[]) => any, fallback: () => any) =>
    this.auth.onAuthStateChanged((authUser: firebase.User | null) => {
      if (authUser == null) {
        fallback()
        return undefined
      }

      this.user(authUser.uid)
        .once('value')
        .then(snapshot => {
          const dbUser = snapshot.val()

          let providerData = {}

          if (
            authUser &&
            Array.isArray(authUser.providerData) &&
            authUser.providerData[0]
          ) {
            providerData = { ...authUser.providerData[0] }
          }

          const user = {
            uid: authUser.uid,
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            providerData,
            ...dbUser,
          }

          next(user)
        })
    })

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
