import React, { createContext, FC, ReactNode } from 'react'

const SIGN_IN_LOG_NAME = 'signin'
const LOGOUT_LOG_NAME = 'logged_out'
const CLICKED_SIGNIN_FACEBOOK_LOG_NAME = 'clicked_signin_with_facebook'
const CLICKED_SIGNIN_GOOGLE_LOG_NAME = 'clicked_signin_with_google'
const VISIT_TASK_PAGE_LOG_NAME = 'visit_of_the_task_page'
const VISIT_LANDING_PAGE_LOG_NAME = 'visit_the_landing_page'
const SCROLL_TO_SIGNIN_BUTTONS_LOG_NAME = 'scroll_to_signin_buttons'

interface LoggerProviderProps {
  provider: ILoggerProvider
  children: ReactNode
}

export type LogEventMap = {
  [SIGN_IN_LOG_NAME]: never
  [LOGOUT_LOG_NAME]: never
  [CLICKED_SIGNIN_FACEBOOK_LOG_NAME]: never
  [CLICKED_SIGNIN_GOOGLE_LOG_NAME]: never
  [VISIT_TASK_PAGE_LOG_NAME]: never
  [VISIT_LANDING_PAGE_LOG_NAME]: never
  [SCROLL_TO_SIGNIN_BUTTONS_LOG_NAME]: never
}

export interface ILoggerProvider {
  logEvent: <T extends keyof LogEventMap>(name: T, params?: LogEventMap[T]) => void
}

// @ts-ignore
export const LoggerContext = createContext<ILoggerProvider>(null)

export const LoggerProvider: FC<LoggerProviderProps> = ({ children, provider }) => (
  <LoggerContext.Provider value={provider}>{children}</LoggerContext.Provider>
)
