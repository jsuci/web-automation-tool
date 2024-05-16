import { ReactNode } from "react";
import { Breadcrumb } from "antd";
import { HomeFilled } from "@ant-design/icons";

interface BreadcrumbItem {
  title: ReactNode; // Use React.ReactNode for more flexibility
}

interface CustomBreadcrumbProps {
  items: BreadcrumbItem[];
}

const CustomBreadcrumb = ({ items }: CustomBreadcrumbProps) => {
  return (
    <Breadcrumb
      items={[
        { href: "/", title: <HomeFilled style={{ color: "#888" }} /> },
        ...items,
      ]}
      style={{
        marginBottom: "30px",
      }}
    />
  );
};

export default CustomBreadcrumb;
