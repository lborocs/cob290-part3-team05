import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; 


const Search = () => {
  return (
    <>
        <div className="w-200 h-17 pl-20 bg-white rounded-4xl ml-75 transform translate-y-[-465px] pt-5 shadow-lg text-gray-500 ">
            <div>
                <MagnifyingGlassIcon className="w-6 h-6 -ml-15 text-gray-500 hover:text-teal-600" />
            </div>
        </div>
    </> 
  )
} 

export default Search