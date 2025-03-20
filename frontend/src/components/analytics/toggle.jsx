import React from 'react'

const Toggle = () => {
  return (
    <>
        <div className="w-30 h-18 -mt-125 bg-white rounded-full ml-16 pt-5 shadow-lg transition-all duration-300 transform hover:translate-x-2 hover:bg-black hover:text-white flex items-center px-1">
            <div className='-mt-4 pl-10 '>Back</div>
        </div>
        <div className='w-30 h-18 bg-white rounded-full ml-60 -mt-18 shadow-lg transition-all duration-300 transform hover:translate-x-2 hover:bg-black hover:text-white flex items-center px-1'>
            <div className='pt-1 pl-10 '>   Projects</div>
        </div>
        <div className='w-30 h-18 bg-white rounded-full ml-95 -mt-18 shadow-lg transition-all duration-300 transform hover:translate-x-2 hover:bg-black hover:text-white flex items-center px-1'>
            <div className='pt-1 pl-10 '>teams</div>
        </div>
       
    </>

  )
}

export default Toggle