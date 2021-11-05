import React, { createContext, FC, ReactNode } from 'react'

interface DeviceProviderProps {
  provider: IDeviceProvider
  children: ReactNode
}

export interface IDeviceProvider {
  isMobile: boolean
}

// @ts-ignore
export const DeviceContext = createContext<IDeviceProvider>(null)

export const DeviceProvider: FC<DeviceProviderProps> = ({ provider, children }) => (
  <DeviceContext.Provider value={provider}>{children}</DeviceContext.Provider>
)
