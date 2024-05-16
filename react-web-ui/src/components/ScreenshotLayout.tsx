import { ReactNode } from "react";
import { Layout } from "antd";

interface ScreenshotLayoutProps {
  children: ReactNode;
}

// const { Header, Footer, Sider, Content } = Layout;
const { Footer, Content } = Layout;

// const headerStyle: React.CSSProperties = {
//   color: "#000",
//   background: "#fff",
//   display: "flex",
//   flexWrap: "wrap",
//   alignItems: "center",
//   paddingInline: "60px",
// };

const contentStyle: React.CSSProperties = {
  minHeight: "100vh",
  marginLeft: "30px",
  marginRight: "30px",
  marginBottom: "30px",
  marginTop: "90px",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#000",
};

const ScreenshotLayout = ({ children }: ScreenshotLayoutProps) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Content style={contentStyle}>{children}</Content>
        <Footer style={footerStyle}>
          © 2023-2024 InboundFound | All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ScreenshotLayout;
