import React from 'react'
import BeforeLogin from './Pages/BeforeLogin'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Postverification from './Pages/Postverification'
import PendingApproval from './Pages/PendingApproval'
import Home from './Pages/Home'
import NewBucketPlans from './Pages/NewBucketPlans'
import Error from './Pages/Error'
import AdminLogin from './Pages/AdminLogin'
import AdminDashboard from './Pages/AdminDashboard'
import AdminUsers from './Pages/AdminUsers'
import AdminRequests from './Pages/AdminRequests'
import AdminShares from './Pages/AdminShares'
import AdminProtectedRoute from './Component/AdminProtectedRoute'

export default function App() {
  return (
   <>
   <Routes>
    <Route path="/" element={<BeforeLogin/>}/>
    <Route path ="/login" element={<Login/>}/>
    <Route path ="/signup" element={<Signup/>}/>
    <Route path ="/verifyemail" element={<Postverification/>}/>
    <Route path ="/pending-approval" element={<PendingApproval/>}/>
    <Route path ="/home" element = {<Home/>}/>
    <Route path ="/new-bucket" element = {<NewBucketPlans/>}/>

    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route
      path="/admin/dashboard"
      element={
        <AdminProtectedRoute>
          <AdminDashboard/>
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <AdminProtectedRoute>
          <AdminUsers/>
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/requests"
      element={
        <AdminProtectedRoute>
          <AdminRequests/>
        </AdminProtectedRoute>
      }
    />
    <Route
      path="/admin/shares"
      element={
        <AdminProtectedRoute>
          <AdminShares/>
        </AdminProtectedRoute>
      }
    />

    <Route path ="*" element={<Error/>}/>
   </Routes>
   </>
  )
}
