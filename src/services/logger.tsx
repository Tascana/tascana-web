import * as firebase from 'firebase'

import { ILoggerProvider, LogEventMap } from '../context/logger'
import { Firebase } from './firebase'

type FirebaseAnalytics = firebase.analytics.Analytics
type CustomEventName<T> = firebase.analytics.CustomEventName<T>

export class FirebaseLoggerService implements ILoggerProvider {
  private analytics: FirebaseAnalytics

  constructor(firebaseService: Firebase) {
    const instance = firebaseService.getInstance()

    this.analytics = instance.analytics()
  }

  public logEvent = <T extends keyof LogEventMap>(name: T, params?: LogEventMap[T]): void => {
    this.analytics.logEvent(name as CustomEventName<typeof name>, params)
  }
}
