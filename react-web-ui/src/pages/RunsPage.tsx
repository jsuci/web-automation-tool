// RunsPage.tsx
import { useState, useEffect, ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ScreenshotLayout from "../components/ScreenshotLayout";
import CustomBreadcrumb from "../components/CustomBreadcrumb";
import { Typography, TableProps, Table } from "antd";
import { parseDateString } from "../utils/parseDateString";

interface DataType {
  key: number;
  runId: ReactNode;
  date: string;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Run ID",
    dataIndex: "runId",
    key: "runId",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];

const { Title } = Typography;

const RunsPage = () => {
  let { siteName } = useParams();
  const [runs, setRuns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/runs?siteName=${siteName}`)
      .then((res) => {
        setRuns(res.data);
        setLoading(false);
      })
      .then(() => {});
  }, []);

  if (!loading && runs) {
    // note: date entry relies on runId name so make sure
    // runId is in the format run_(sitename)_(date)_(uniqueid1)_(uniqueid2)
    const data: DataType[] = runs.map((item, index) => {
      return {
        key: index,
        runId: <Link to={`/${siteName}/${item}`}>{item}</Link>,
        date: parseDateString(item),
      };
    });

    return (
      <ScreenshotLayout>
        <CustomBreadcrumb items={[{ title: "Runs" }]} />
        <Title level={2}>
          List of runs under{" "}
          <span style={{ color: "#66b3ba" }}>{siteName}</span>
        </Title>
        <Table columns={columns} dataSource={data} />
      </ScreenshotLayout>
    );
  }
};

export default RunsPage;
