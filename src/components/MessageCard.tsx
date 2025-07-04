"use client"

import React from 'react'
import { Card,  CardContent, CardHeader, CardTitle } from './ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { Message } from '@/model/User'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'
import axios from 'axios'

type MessageCardProp = {
    message: Message,
    onMessageDelete: (messageId: string) => void
}

const MessageCard = ({message, onMessageDelete}: MessageCardProp) => {

    const handleDeleteConfirm = async () => {
        const response = await axios.post<ApiResponse>(`/api/delete-message/`,{messageId:message._id,})
        toast(response.data.message)
        onMessageDelete(message._id as string)
    }


    return (
        <div className='w-1/4'>
            <Card >
                <CardHeader>
                    <CardTitle>{message.content}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className='w-10' variant="destructive"><X className='w-5 h-5' /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {/* <CardDescription></CardDescription> */}
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        </div>
    )
}

export default MessageCard
