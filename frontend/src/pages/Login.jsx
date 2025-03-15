import { useState, useEffect } from 'react'

const Login = () => {
    return (
        <>
        <form action="/login" method="post">
            <input name="username" placeholder="username" />
            <input name="password" type="password" placeholder="password" />
            <button type="submit">Login</button>
        </form> 
        </>
    )
}

export default Login