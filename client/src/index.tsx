import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import './index.css';
import Solo from './Solo';
import Party from './Party';
import PlayerClient from './PlayerClient'
import Layout from './components/Layout';

import reportWebVitals from './reportWebVitals';
import Nav from './components/Nav';

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// const router = createBrowserRouter([
//   {
//     path:'/',
//     element: <Solo/>
//   }, 
//   {
//     path:'/party',
//     element: <Party/>
//   }, 
//   {
//     path:'/player',
//     element: <PlayerClient/>
//   }
 
// ])




ReactDOM.render(
  // <React.StrictMode>
    <BrowserRouter>
    <Layout>
      <Nav/>
      <Routes>
        <Route path="/" element={<Solo/>}/>
        <Route path="party" element={<Party/>}/>
        <Route path="player" element={<PlayerClient/>}/>
      </Routes>

      {/* <RouterProvider router={router}/> */}
    </Layout>
  </BrowserRouter>,
  // </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
