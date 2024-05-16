import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Checkbox,
  Select,
  Typography,
  message,
} from "antd";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
const { Title } = Typography;
const { Option } = Select;

interface AddNewSiteValues {
  production_domain: string;
  staging_domain: string;
  website_name: string;
  username: string;
  password: string;
  sitemap_list: string[];
  exclude_url_patterns: string[];
  include_url_patterns: string[];
  include_images: boolean;
  strict_crawl: boolean;
  crawl_type: string;
}

const AddNewSite: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [formValues, setFormValues] = useState<AddNewSiteValues>({
    production_domain: "",
    staging_domain: "",
    website_name: "",
    username: "",
    password: "",
    sitemap_list: [],
    exclude_url_patterns: [],
    include_url_patterns: [],
    include_images: false,
    strict_crawl: false,
    crawl_type: "same-hostname",
  });

  useEffect(() => {
    if (formValues.production_domain) {
      try {
        const url = new URL(formValues.production_domain);
        setFormValues((prev) => ({ ...prev, website_name: url.hostname }));
      } catch (error) {}
    }
  }, [formValues.production_domain]);

  const handleSubmit = async () => {
    try {
      await axios.post("/api/add-site", formValues);
      messageApi.open({
        type: "success",
        content: "Form submitted successfully!",
      });
    } catch (error: any) {
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
      messageApi.open({
        type: "error",
        content: "Failed to submit the form.",
      });
    }
  };

  const handleChange = (value: any, field: keyof AddNewSiteValues) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      {contextHolder}
      <Title level={2}>Add New Site</Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="production_domain"
          label="Production Domain"
          rules={[
            { required: true, message: "Please input the production domain!" },
          ]}
        >
          <Input
            value={formValues.production_domain}
            onChange={(e) => handleChange(e.target.value, "production_domain")}
          />
        </Form.Item>
        <Form.Item
          name="staging_domain"
          label="Staging Domain"
          rules={[
            { required: true, message: "Please input the staging domain!" },
          ]}
        >
          <Input
            value={formValues.staging_domain}
            onChange={(e) => handleChange(e.target.value, "staging_domain")}
          />
        </Form.Item>
        <Form.Item label="Website Name">
          <Input value={formValues.website_name} disabled />
        </Form.Item>
        <Form.Item name="username" label="Username">
          <Input
            value={formValues.username}
            onChange={(e) => handleChange(e.target.value, "username")}
          />
        </Form.Item>
        <Form.Item name="password" label="Password">
          <Input.Password
            value={formValues.password}
            onChange={(e) => handleChange(e.target.value, "password")}
          />
        </Form.Item>
        <Form.Item name="sitemap_list" label="Sitemap List">
          <Select
            mode="tags"
            placeholder="Add sitemap URLs"
            value={formValues.sitemap_list}
            onChange={(value) => handleChange(value, "sitemap_list")}
          />
        </Form.Item>
        <Form.Item name="exclude_url_patterns" label="Exclude URL Patterns">
          <Select
            mode="tags"
            placeholder="Add patterns"
            value={formValues.exclude_url_patterns}
            onChange={(value) => handleChange(value, "exclude_url_patterns")}
          />
        </Form.Item>
        <Form.Item name="include_url_patterns" label="Include URL Patterns">
          <Select
            mode="tags"
            placeholder="Add patterns"
            value={formValues.include_url_patterns}
            onChange={(value) => handleChange(value, "include_url_patterns")}
          />
        </Form.Item>
        <Form.Item name="crawl_type" label="Crawl Type">
          <Select
            value={formValues.crawl_type}
            onChange={(value) => handleChange(value, "crawl_type")}
            defaultValue={formValues.crawl_type}
          >
            <Option value="same-hostname">Same Hostname</Option>
            <Option value="same-domain">Same Domain</Option>
            <Option value="all">All</Option>
          </Select>
        </Form.Item>
        <Form.Item name="include_images" label="Include Images">
          <Checkbox
            checked={formValues.include_images}
            onChange={(e) => handleChange(e.target.checked, "include_images")}
          />
        </Form.Item>
        <Form.Item name="strict_crawl" label="Strict Crawl">
          <Checkbox
            checked={formValues.strict_crawl}
            onChange={(e) => handleChange(e.target.checked, "strict_crawl")}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </DashboardLayout>
  );
};

export default AddNewSite;
