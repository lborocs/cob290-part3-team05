import React, { useState } from 'react'
import Filter from '../components/analytics/filter';
import Search from '../components/analytics/search';
import Toggle from '../components/analytics/toggle';


const App = () => {
    return (
        <>
            <div className = "bg-gray-200 h-screen w-screen fixed top-0 left-0 flex items-center">
                <div>
                    <Filter />
                </div> 
                <div>
                    <Search />
                </div>
                <div>
                    <Toggle />
                </div>
            </div>
        </>
    )
}

export default App
