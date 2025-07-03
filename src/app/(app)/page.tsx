"use client"
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import messages from "@/messages.json"
import ClassNames from 'embla-carousel-class-names'
import { CopyrightIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const page = () => {
  return (
    <div>
      <div className='flex items-center flex-col py-14 gap-7'>
        <h1 className='text-6xl font-bold'>Send Messages anonymously</h1>
        <p className='text-lg'>Explore messages - keeping your identity anonymous</p>
      </div>
      <div className='flex items-center justify-center min-w-full my-15 mt-4'>
        <Carousel
          className="w-[80%]"
          plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: false
        })
          ]}
        >
          <CarouselContent className="-ml-1">
        {messages.map((message, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
          <Card>
            <CardHeader>{message.title}</CardHeader>
            <CardContent className="flex min-h-30 items-center justify-center p-6">
              <span className="text-2xl font-semibold">{message.content}</span>
            </CardContent>
            <CardFooter className='text-slate-600'>{message.recieved}</CardFooter>
          </Card>
            </div>
          </CarouselItem>
        ))}
          </CarouselContent>
          <CarouselPrevious className='hidden'/>
          <CarouselNext className='hidden'/>
        </Carousel>
      </div>
      <Separator />
      <div className='flex items-center flex-row justify-center mt-7'>
        <CopyrightIcon /> All copyrights Reserved
      </div>
    </div>
  )
}

export default page
