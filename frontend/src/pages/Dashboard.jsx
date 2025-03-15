import { useState, useEffect } from 'react'

import Button from '../components/global/Button'

const Dashboard = () => {
    return (
        <>
        <div className="bg-blue-500 text-white p-4 text-xl">
            Dashboard
        </div>
        <Button>
            Hello This is a Button
        </Button>
        </>
    )
}

export default Dashboard