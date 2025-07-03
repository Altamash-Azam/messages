"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { ApiResponse } from "@/types/ApiResponse"
import { useCompletion } from '@ai-sdk/react'
import { useEffect, useState } from "react"

const formSchema = z.object({
  content: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

const page = () => {
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([])

  const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

  // Use the useCompletion hook at the top level
  const { complete,input, completion, isLoading, error } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,})

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const url = window.location.href;
    const username = url.split("/").pop()

    try {
      const response = await axios.post('/api/send-message', {
        username: username,
        content: values.content
      })
      if(response.data.success){
        toast("Message Sent",{
          description: "Your Message was sent successfully"
        })
        // Reset form after successful submission
        form.reset()
      }
      else{
        toast.warning("Message not Sent",{
          description: "User not accepting Messages"
        })
      }
    }
    catch (error) {
      console.log(error)
      toast.error('Error sending message')
    }
  }

  const generateMessages = async () => {
    try {

      
      console.log('Starting message generation...')
      complete("Generate message suggestions")
      console.log(input)
      console.log('Complete function result:', completion)
    } catch (error) {
      console.error('Error in generateMessages:', error)
      toast.error('Error generating message')
    }
  }

  // Handle the completion result
  useEffect(() => {
    console.log('Completion changed:', completion)
    console.log('Error state:', error)
    console.log('Loading state:', isLoading)
    
    if (completion && completion.trim()) {
      console.log('Processing completion:', completion)
      
      // Split the completion by '||' to get individual messages
      const messages = completion.split('||').map(msg => msg.trim()).filter(msg => msg.length > 0)
      console.log('Parsed messages:', messages)
      setGeneratedMessages(messages)
      
      toast("Messages generated successfully!", {
        description: `Generated ${messages.length} message suggestions`
      });
    }
    
    if (error) {
      console.error('Completion error in useEffect:', error)
      toast.error('Error generating messages: ' + error.message)
    }
  }, [completion]);

  // Function to use a generated message
  const useGeneratedMessage = (message: string) => {
    form.setValue('content', message)
    toast("Message selected", {
      description: "Generated message has been added to the text area"
    })
  }

  return (
    <div>
      <div className='flex flex-col p-7 items-center'>
        <h1 className='text-4xl font-bold my-9'>Public Profile Link</h1>
        <div className="w-full flex items-center justify-center mt-4 text-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" w-[70%] space-y-5">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>send anonymous message to @username</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message here..." 
                        className="resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={()=>{generateMessages()}}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Messages"}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Display generated messages */}
        {generatedMessages.length > 0 && (
          <div className="w-[70%] mt-8">
            <h3 className="text-lg font-semibold mb-4">Generated Message Suggestions:</h3>
            <div className="space-y-3">
              {generatedMessages.map((message, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm mb-2" onClick={() => useGeneratedMessage(message)}>{message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page