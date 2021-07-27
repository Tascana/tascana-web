import * as firebase from 'firebase/app'
import 'firebase/auth'
import { IAuthProvider } from '../context/auth'
import { Firebase } from './firebase'
import { User } from '../entities/user'

type FirebaseUnsubscribe = firebase.Unsubscribe
type FirebaseAuth = firebase.auth.Auth
type FirebaseUserCredential = firebase.auth.UserCredential
type FirebaseUser = firebase.User
type FirebaseAuthProvider = firebase.auth.AuthProvider
type FirebaseGoogleAuthProvider = firebase.auth.GoogleAuthProvider
type FirebaseFacebookAuthProvider = firebase.auth.FacebookAuthProvider

const FIREBASE_EMPTY_USER_INFO = { displayName: null, email: null }

const FIREBASE_PERSISTENCE_STRATEGY = firebase.auth.Auth.Persistence.LOCAL

const prepareUserData = ({ uid, providerData, photoURL: avatar }: FirebaseUser): User => {
  const userInfo = Array.isArray(providerData) ? providerData[0] : null
  const { displayName: name, email } = userInfo || FIREBASE_EMPTY_USER_INFO

  return { uid, email, name, avatar }
}

export class FirebaseAuthService implements IAuthProvider {
  private readonly auth: FirebaseAuth

  private readonly googleProvider: FirebaseGoogleAuthProvider

  private readonly facebookProvider: FirebaseFacebookAuthProvider

  constructor(firebaseService: Firebase) {
    const GoogleAuthProvider = firebase.auth.GoogleAuthProvider
    const FacebookAuthProvider = firebase.auth.FacebookAuthProvider
    const instance = firebaseService.getInstance()

    this.auth = instance.auth()
    this.googleProvider = new GoogleAuthProvider()
    this.facebookProvider = new FacebookAuthProvider()

    this.googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email')
    this.facebookProvider.addScope('email')
  }

  public signInWithFacebook = (): Promise<User> => this.signInWithPopup(this.facebookProvider)

  public signInWithGoogle = (): Promise<User> => this.signInWithPopup(this.googleProvider)

  public signOut = (): Promise<void> => this.auth.signOut()

  public onAuthStateChanged = (
    onSignIn: (user: User) => void,
    onSignOut: () => void,
  ): FirebaseUnsubscribe => {
    return this.auth.onAuthStateChanged((user: Nullable<FirebaseUser>) => {
      if (user === null) {
        onSignOut()
        return undefined
      }

      onSignIn(prepareUserData(user))
    })
  }

  private signInWithPopup(provider: FirebaseAuthProvider): Promise<User> {
    return this.auth
      .setPersistence(FIREBASE_PERSISTENCE_STRATEGY)
      .then(() => this.auth.signInWithPopup(provider))
      .then(({ user }: FirebaseUserCredential) => prepareUserData(user as FirebaseUser))
  }
}
