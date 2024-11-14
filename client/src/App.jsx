import Dashboard from './Components/Dashboard';
import { useState } from 'react'
import './App.css'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import SupplierDetails from './components/SupplierDetails'
import Contactus from './components/Contactus'
import Updateproduct from './components/Updateproduct'
import Addproduct from './components/Addproduct'
import Login from './Components/Login'
import BarcodeScanner from "./pages/react"
import HomePage from './Components/Homepage';
function App(){


  return (
    <>
      <Router>
        <Routes>

        <Route path="/supplierdetail" element={<SupplierDetails />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/updateproduct" element={<Updateproduct />} />
        <Route path="/Addproduct" element={<Addproduct />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/scan" element={<BarcodeScanner />} />
        <Route path="/" element={<Dashboard />} /> {/* Home component */}

        </Routes>
      </Router>
    </>
  )


}


export default App
