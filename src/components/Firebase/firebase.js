import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
}

class Firebase {
  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()

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

  tasks = () =>
    this.db
      .ref()
      .child('todos')
      .orderByKey()

  createTask = (task, id) => this.db.ref('todos/' + id).set(task)

  onTasksListener = () =>
    this.tasks().on('value', snapshot => {
      console.log(snapshot.val())
    })
}

export default Firebase
