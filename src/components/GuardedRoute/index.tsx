import React, { FC } from 'react'
import { RouteProps, Route, Redirect, RouteComponentProps } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { LOGIN_PAGE_PATH } from '../../constants/route'

export const GuardedRoute: FC<RouteProps> = ({ component: Component, ...rest }) => {
  const [, user] = useAuth()
  const render = (props: RouteComponentProps) =>
    // @ts-ignore
    user != null ? <Component {...props} /> : <Redirect to={LOGIN_PAGE_PATH} />

  return <Route render={render} {...rest} />
}
