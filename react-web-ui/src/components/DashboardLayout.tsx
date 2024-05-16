import { ReactNode, useEffect, useState } from "react";
import { Layout, Typography, Spin } from "antd";
import Logo from "../assets/logo-small.png";
// import { BellOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import axios from "axios";
import { useSiteContext } from "../providers/SiteContext";
import { DesktopOutlined, MailOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

interface DashboardLayoutProps {
  children: ReactNode;
}

// const { Header, Footer, Sider, Content } = Layout;
const { Footer, Sider, Content } = Layout;
const { Title } = Typography;

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

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [menuSites, setMenuSites] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemSelected, setItemSelected] = useSiteContext();

  const menuClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e.key);
    setItemSelected(e.key);

    if (e.key === "screenshots") {
      navigate("/screenshots", { replace: true });
    } else if (e.key === "add-site") {
      navigate("/add-site", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const fetchSites = async () => {
      setIsLoading(true); // Start loading
      try {
        const sites = await axios.get("/api/sites");
        if (sites && sites.data.length !== 0) {
          const menuSiteItems = sites.data.map((item: string) =>
            getItem(item, item)
          );
          setMenuSites(menuSiteItems);
          setItemSelected(sites.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch sites", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (isLoading) {
    return (
      <>
        <Spin spinning={isLoading} fullscreen></Spin>
      </>
    );
  }

  const items: MenuProps["items"] = [
    getItem("All Sites", "sub1", <MailOutlined />, [...menuSites]),
    getItem("Add New Site", "add-site", <PlusOutlined />),
    getItem("Screenshots", "screenshots", <DesktopOutlined />),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="dark"
        width="280px"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        collapsedWidth={0}
        zeroWidthTriggerStyle={{
          top: "0",
          marginTop: "0px", // trigger icon sidebar
        }}
      >
        <div
          className="logo-title"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "25px",
            gap: "40px",
            textAlign: "center",
          }}
        >
          <img src={Logo} width={180} />
          <Title style={{ color: "#fff", letterSpacing: "1px" }} level={2}>
            Automated Web Testing Tool
          </Title>
          <Menu
            defaultSelectedKeys={[`${itemSelected}`]}
            mode="inline"
            theme="dark"
            items={items}
            onClick={menuClick}
          />
        </div>
      </Sider>
      <Layout>
        <Content style={contentStyle}>{children}</Content>
        <Footer style={footerStyle}>
          © 2023-2024 InboundFound | All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
