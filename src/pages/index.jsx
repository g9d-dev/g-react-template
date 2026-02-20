import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../components/app/app.jsx';

// 获取 id 为 "example" 的 DOM 容器，并创建一个 React 根节点
const root = ReactDOM.createRoot(document.getElementById("app"));

// 渲染 React 组件到 DOM 中的根节点
root.render(<App />);