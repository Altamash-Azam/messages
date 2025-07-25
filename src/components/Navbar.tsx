"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'
import { useTheme } from 'next-themes'
import { Switch } from './ui/switch'

const Navbar = () => {
    const {data: session} = useSession()
    const user: User = session?.user

    const { theme, setTheme } = useTheme()

  return (
    <nav className='p-4 md:p-6 shadow-md'>
        <div className='px-32 container mx-auto flex flex-col md:flex-row justify-between items-center'>
            <a className='text-xl font-bold mb-4 md:mb-0' href="#">Messages</a>
            {
                session ? (
                    <>
                    <span className='mr-4'>Welcome, {user?.username || user?.email}</span>
                    <div className='flex flex-col md:flex-row gap-4 items-center'>
                        <Switch onClick={()=>{setTheme(theme === "dark" ? "light" : "dark")}}>change</Switch>
                        <button className='w-full md:w-auto' onClick={()=>{signOut()}}>Logout</button>
                    </div>
                    </>
                ) : (
                    <div className='flex flex-col md:flex-row gap-4 items-center'>
                        <Switch onClick={()=>{setTheme(theme === "dark" ? "light" : "dark")}}>change</Switch>
                        <Link href='/sign-in'>
                                <Button className='w-full md:w-auto'>Login</Button>
                        </Link>
                    </div>
                )
            }
        </div>
    </nav>
  )
}

export default Navbar
