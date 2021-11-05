import { IDeviceProvider } from '../context/device'
import { isMobile } from 'react-device-detect'

export class DeviceService implements IDeviceProvider {
  public get isMobile(): boolean {
    return isMobile
  }
}
