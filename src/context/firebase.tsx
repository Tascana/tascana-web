import React, { createContext, FC, ReactNode } from 'react'
import { Firebase } from '../services/firebase'

interface AuthProviderProps {
  provider: Firebase
  children: ReactNode
}

// @ts-ignore
export const FirebaseContext = createContext<Firebase>(null)

export const FirebaseProvider: FC<AuthProviderProps> = ({
  children,
  provider,
}) => (
  <FirebaseContext.Provider value={provider}>
    {children}
  </FirebaseContext.Provider>
)
