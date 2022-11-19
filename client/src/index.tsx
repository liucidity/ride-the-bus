import React from 'react';
import ReactDOM from 'react-dom';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from 'react-router-dom'

import './index.css';
import App from './App';
import Party from './Party';
import Layout from './components/Layout';


import reportWebVitals from './reportWebVitals';
import Nav from './components/Nav';

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>,
  },
  {
    path:'/party',
    element: <Party/>
}
])

ReactDOM.render(
  <React.StrictMode>
    <Layout>
      <Nav/>

      <RouterProvider router={router}/>
    </Layout>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
