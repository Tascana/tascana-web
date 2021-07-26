import React, { createContext, FC, ReactNode } from 'react'
import firebase from 'firebase'

interface AuthProviderProps {
  provider: IAuthProvider
  children: ReactNode
}

export interface IAuthProvider {
  signInWithGoogle: () => Promise<firebase.auth.UserCredential>
  signInWithFacebook: () => Promise<firebase.auth.UserCredential>
  signOut: () => Promise<void>
  onAuthUserListener: (
    next: (user: firebase.User) => void,
    fallback: () => void,
  ) => firebase.Unsubscribe
}

// @ts-ignore
export const AuthContext = createContext<IAuthProvider>(null)

export const AuthProvider: FC<AuthProviderProps> = ({ children, provider }) => (
  <AuthContext.Provider value={provider}>{children}</AuthContext.Provider>
)
