// @ts-nocheck
import app from 'firebase/app'
import 'firebase/auth'
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

class Firebase {
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

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val()

            let providerData = {}

            if (
              Array.isArray(authUser.providerData) &&
              authUser.providerData[0]
            ) {
              providerData = { ...authUser.providerData[0] }
            }

            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData,
              ...dbUser,
            }

            next(authUser)
          })
      } else {
        fallback()
      }
    })

  user = uid => this.db.ref(`users/${uid}`)

  tasks = uid =>
    this.db
      .ref()
      .child(`todos/${uid}`)
      .orderByChild('createdAt')

  createTask = (task, uid, id) => this.db.ref(`todos/${uid}/${id}`).set(task)

  editTask = (task, uid, id) => this.db.ref(`todos/${uid}/${id}`).update(task)

  deleteTask = (uid, id) => this.db.ref(`todos/${uid}/${id}`).remove()

  setTasks = (tasks, uid) => this.db.ref(`todos/${uid}`).set(tasks)

  logEvent = (eventName, eventParams) =>
    this.analytics.logEvent(eventName, eventParams)
}

export default Firebase
