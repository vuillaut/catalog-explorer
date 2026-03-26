import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolDetail from './pages/ToolDetail';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tool/:id" element={<ToolDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
