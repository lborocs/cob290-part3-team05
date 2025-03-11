import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from './components/global/Button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-blue-500 text-white p-4 text-xl">
        Tailwind is working! 🚀
      </div>
      <Button Text={"Hello This is a Button"} />
    </>
  )
}

export default App
