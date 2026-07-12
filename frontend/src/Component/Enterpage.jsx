import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'


export default function Enterpage() {
  const [page, setpage] = useState('login')
  const location = useLocation()

  useEffect(() => {
    if (location.state?.showLogin) {
      setpage('login')
    }
  }, [location.state])
  return (
    <div className="bg-[#090a09] min-h-screen flex justify-center items-center">

      <div className="bg-[#111111] border border-gray-700 rounded-3xl shadow-2xl p-8 w-full max-w-md">

        <h1 className="text-4xl text-white font-bold text-center">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mt-3">
          Welcome Back, Please enter your details
        </p>

        

        <div className="flex mt-8 bg-[#1d1d1d] border border-gray-700 rounded-xl p-1">
          <div className="w-1/2">
          <button
            onClick={() => setpage("login")}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out ${
              page=="login" ? "bg-indigo-600 text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>
        <div className="w-1/2">
            <button
            onClick={()=>setpage("signup")}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out ${
              page=="signup" ? "bg-indigo-600 text-white" : "text-gray-300 hover:text-white"
            }`}
            >
              Sign Up
            </button>
          </div>
          </div >

          <div>
            {page=="login" ? <Login/> : <Signup setpage = {setpage}/>}

          </div>
        </div>

      </div>

  )
}
