import React from 'react'
import Rightimage from '../Component/Rightimage'
import Enterpage from '../Component/Enterpage'

export default function BeforeLogin() {
  return (
   <>
   <div className='flex min-h-screen'>
    <div className='w-1/2'>
       <Rightimage/>

    </div>
    <div className='w-1/2'>
        <Enterpage/>

    </div>
    

   </div>
   </>
  )
}
