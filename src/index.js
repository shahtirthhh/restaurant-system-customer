import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ContextProvider from "./store/context";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

const ROUTER = createBrowserRouter([
  // Homepage paths
  {
    path: "/*",
    element: <App />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ContextProvider>
    <RouterProvider router={ROUTER}></RouterProvider>
  </ContextProvider>
);
