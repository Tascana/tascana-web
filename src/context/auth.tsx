import React, { createContext, FC, ReactNode } from 'react'
import firebase from 'firebase'
import { User } from '../entities/user'

interface AuthProviderProps {
  provider: IAuthProvider
  children: ReactNode
}

export interface IAuthProvider {
  signInWithGoogle: () => Promise<User>
  signInWithFacebook: () => Promise<User>
  signOut: () => Promise<void>
  onAuthStateChanged: (
    onSignIn: (user: User) => void,
    onSignOut: () => void,
  ) => firebase.Unsubscribe
}

// @ts-ignore
export const AuthContext = createContext<IAuthProvider>(null)

export const AuthProvider: FC<AuthProviderProps> = ({ children, provider }) => (
  <AuthContext.Provider value={provider}>{children}</AuthContext.Provider>
)
