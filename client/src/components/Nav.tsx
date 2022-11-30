import React from 'react'
import { NavLink, Router} from 'react-router-dom'

import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Nav() {
  return(
    <nav className="flex items-center p-3 flex-wrap bg-grey ">


        <img src='schoolbus.png' alt='logo' className='h-[64px]'/>
        <span className='ml-4 text-white text-2xl font-bold uppercase tracking-wide'>bus riders</span>
      <div>
        <ul className='flex flex-row m-2'>
          <li className='m-2'>
            <NavLink className='text-white text-2xl font-bold uppercase tracking-wide' to='/'>Solo</NavLink>
          </li>
          <li className='m-2'>
            <NavLink className='text-white text-2xl font-bold uppercase tracking-wide' to="/party">Party</NavLink>
          </li>
        </ul>
      </div>

      </nav>
  )
}