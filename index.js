import React from 'react';
import Writer from './components/writer.jsx';
import { createRoot } from 'react-dom/client';

var target = document.createElement("div");
target.classList.add('page');
document.body.append(target);
const root = createRoot(target);

root.render(
    <Writer />
);