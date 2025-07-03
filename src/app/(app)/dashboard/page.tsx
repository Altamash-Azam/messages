"use client"

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Message } from "@/model/User"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { User } from "next-auth"
import { getSession, useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const page = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => { message._id !== messageId }))
    // try {
    //   const result = await axios.post<ApiResponse>('/api/delete-message', messageId)
    //   if(result.data.success){
    //     toast.success("message Deleted",{
    //       description: "your message was deleted successfully"
    //     })
    //   }
    // } catch (error) {
    //   const axiosError = error as AxiosError
    //   toast.warning("message not deleted",{
    //     description: axiosError.message
    //   })
    // }
  }

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const { watch, register, setValue } = form

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-message')
      
      setValue('acceptMessages', response.data.isAcceptingMessages as boolean)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      
      toast.warning('Error', {
        description: axiosError.response?.data.message || "failed to fetch accept message settings"
      })
    }
    finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      
      const response = await axios.get<ApiResponse>('/api/get-messages')
      console.log('Accept messages response:', response.data) 
      setMessages(response.data.messages || [])
      if (refresh) {
        toast("Refreshed Messages", {
          description: "showing latest messages"
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.error('Accept messages error:', error)
      toast.warning('Error', {
        description: axiosError.response?.data.message || "failed to fetch message settings"
      })
    } finally {
      setIsSwitchLoading(false)
      setIsLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const result = await axios.post<ApiResponse>('/api/accept-message', { acceptMessages: !acceptMessages })
      setValue('acceptMessages', !acceptMessages)
      toast(result.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.warning('Error', {
        description: axiosError.response?.data.message || "failed to change accept message settings"
      })
    }
  }

  if (!session || !session.user) return <div>Please Login</div>

  const { username } = session.user as User

  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast("URL copied", {
      description: "Profile URL copied to clipboard"
    })
  }


  return (
    <div className="flex flex-col p-7 w-full gap-6">
      <h1 className="font-bold text-4xl text-center">User Dashboard</h1>
      <div className="flex flex-col gap-2">
        <div className="text-sm">Copy you URL:</div>
        <div className="flex flex-row w-[90%] gap-3"> 
          <Input defaultValue={profileUrl} disabled type="text" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch {...register('acceptMessages')} checked={acceptMessages} onCheckedChange={handleSwitchChange} disabled={isSwitchLoading} />
        <Label htmlFor="airplane-mode">Accepting Messages: {acceptMessages ? "ON" : "OFF"}</Label>
      </div>
      <Separator />
      <div className="container flex flex-row flex-wrap gap-5">
        {messages.length > 0 ? (messages.map((message) => (
          <MessageCard key={message._id as string} message={message} onMessageDelete={handleDeleteMessage} />
        )
        )) : (
          <p>No message to Display</p>
        )}
      </div>
    </div>
  )
}

export default page
