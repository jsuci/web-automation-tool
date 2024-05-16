import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        components: {
          Breadcrumb: {
            iconFontSize: 18,
            itemColor: "#888",
          },
          Table: {
            cellFontSize: 16,
          },
          Layout: {
            /* here is your component tokens */
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
