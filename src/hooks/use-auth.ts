import { useContext } from 'react'
import { IAuthProvider, AuthContext } from '../context/auth'

export const useAuth = (): IAuthProvider => useContext(AuthContext)
