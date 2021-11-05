import { useContext } from 'react'

import { ILoggerProvider, LoggerContext } from '../context/logger'

export const useLogger = (): ILoggerProvider => useContext(LoggerContext)
