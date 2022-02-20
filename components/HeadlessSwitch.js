import { useState } from 'react'
import { Switch } from '@headlessui/react'

export default function HeadlessSwitch({ children, enabled, onChange }) {
  // const [enabled, setEnabled] = useState(false)

  return (
    <Switch.Group>
      <div className="py-1 flex flex-row flex-nowrap flex-1 items-center justify-between shadow overflow-hidden rounded-md hover:bg-gray-50">
        <Switch
          checked={enabled}
          onChange={onChange}
          className={`${
            enabled ? 'bg-cyan-500' : 'bg-gray-200'
          } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </Switch>
        <Switch.Label className="pl-2 text-left text-sm font-medium text-gray-900 grow cursor-pointer">{children}</Switch.Label>
      </div>
    </Switch.Group>
  )
}
