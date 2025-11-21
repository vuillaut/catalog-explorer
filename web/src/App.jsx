import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolDetail from './pages/ToolDetail';
import Dimensions from './pages/Dimensions';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tool/:id" element={<ToolDetail />} />
          <Route path="dimensions" element={<Dimensions />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
