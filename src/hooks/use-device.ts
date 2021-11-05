import { useContext } from 'react'

import { IDeviceProvider, DeviceContext } from '../context/device'

export const useDevice = (): IDeviceProvider => useContext(DeviceContext)
