import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './index.css';
import Home from './Home';
import Solo from './Solo';
import Party from './Party';
import Layout from './components/Layout';
import Nav from './components/Nav';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/solo"
          element={
            <>
              <Nav />
              <Solo />
            </>
          }
        />
        <Route
          path="/party"
          element={
            <>
              <Nav />
              <Party />
            </>
          }
        />
      </Routes>
    </Layout>
  </BrowserRouter>
);

reportWebVitals();
