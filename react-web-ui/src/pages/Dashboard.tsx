import { useSiteContext } from "../providers/SiteContext";
import { Button, Card, Collapse, Spin, Tooltip, Typography } from "antd";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { PageScreeenshotsData } from "../../../tests/lib/types";
import ScreenshotRender from "../components/ScreenshotRender";

interface DownloadImageProps {
  scType: "mobile" | "desktop";
  itemIndex: number;
}

interface DataType {
  key: number;
  label: string;
  children: ReactNode;
}

interface InterFailedDataType {
  key: React.Key;
  test_name: string;
  file_name: string;
  error_message: string;
}

const { Title } = Typography;

const scContainerStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "30px",
  paddingBlock: "2.5em",
  paddingInline: "4em",
  borderRadius: "12px",
};

const scItems: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  wordWrap: "break-word",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.2em",
  fontWeight: "500",
  width: "150px",
  height: "50px",
};

const spanStyle: React.CSSProperties = {
  fontSize: "1.0em",
  fontWeight: "600",
  color: "#000",
};

interface ShowPixelDiffProps {
  diff: number | undefined;
}

const ShowPixelDiff = ({ diff }: ShowPixelDiffProps) => {
  return (
    diff !== undefined && (
      <Tooltip title="A pixel difference represents the variation between corresponding pixels in two digital images. ">
        <span style={spanStyle}>
          (Pixel Difference: <b>{diff}</b>)
        </span>
      </Tooltip>
    )
  );
};

const interColumns: TableColumnsType<InterFailedDataType> = [
  {
    title: "Test Name",
    dataIndex: "test_name",
  },
  {
    title: "File Location",
    dataIndex: "file_name",
  },
  {
    title: "Error Message",
    dataIndex: "error_message",
    render: (errMsg: string) => <p>{errMsg}</p>,
  },
];

const interRowSelection = {
  onChange: (
    selectedRowKeys: React.Key[],
    selectedRows: InterFailedDataType[]
  ) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
};

const Dashboard = () => {
  const [itemSelected] = useSiteContext();
  const [interSummary, setInterSummary] = useState<any>({});
  const [interFailedData, setInterFailedData] = useState<InterFailedDataType[]>(
    []
  );
  const [screenshotData, setScreenshotData] = useState<PageScreeenshotsData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      const reportsRaw = await axios.get(
        `/api/reports?siteName=${itemSelected}`
      );

      console.log(reportsRaw);
      if (JSON.stringify(reportsRaw.data) !== "{}") {
        const interSummaryData = {
          inter_total_test: reportsRaw.data.totalTest,
          inter_failed_test: reportsRaw.data.failedTest,
          inter_passed_test: reportsRaw.data.passedTest,
          inter_skipped_test: reportsRaw.data.skippedTest,
        };

        const interFailedData: InterFailedDataType[] =
          reportsRaw.data.errors.map((ftest: any, index: number) => {
            return {
              key: index,
              test_name: ftest.testName,
              file_name: `${ftest.location.file}:${ftest.location.line}:${ftest.location.column}`,
              error_message: ftest.message,
            };
          });

        setInterFailedData(interFailedData);
        setInterSummary(interSummaryData);
      } else {
        setInterSummary(null);
        setInterFailedData([]);
      }

      setIsLoading(false);
    };

    const fetchScreenshots = async () => {
      setIsLoading(true);
      const siteRuns = await axios.get(`/api/runs?siteName=${itemSelected}`);

      if (siteRuns && siteRuns.data.length > 0) {
        const screenshots = await axios.get(
          `/api/pages?siteName=${itemSelected}&runId=${siteRuns.data[0]}`
        );

        if (screenshots.data.screenshots.length > 0) {
          const failedComparisons = await screenshots.data.screenshots.filter(
            (item: any) => {
              const comparisonScores = item.comparison_score ?? null;
              if (comparisonScores) {
                if (
                  comparisonScores.staging_vs_prod_before > 0 ||
                  comparisonScores.prod_after_vs_prod_before > 0 ||
                  comparisonScores.m_prod_after_vs_prod_before > 0 ||
                  comparisonScores.m_staging_vs_prod_before > 0
                ) {
                  return item;
                }
              }
            }
          );

          if (failedComparisons.length > 0) {
            setScreenshotData(failedComparisons);
          } else {
            setScreenshotData([]);
          }
        }
      }

      setIsLoading(false);
    };

    fetchReports();
    fetchScreenshots();
  }, [itemSelected]);

  const downloadImages = async ({ scType, itemIndex }: DownloadImageProps) => {
    const allScreenshots = screenshotData;
    const key = scType + itemIndex; // Create a unique key for each button

    if (allScreenshots) {
      // Set loading true for the specific button
      setButtonLoading((prev) => ({ ...prev, [key]: true }));

      const selectedItem = allScreenshots[itemIndex];
      const imageURLS =
        scType === "desktop"
          ? [
              selectedItem.screenshot_files?.staging_vs_prod_before,
              selectedItem.screenshot_files?.prod_after_vs_prod_before,
            ]
          : [
              selectedItem.screenshot_files?.m_staging_vs_prod_before,
              selectedItem.screenshot_files?.m_prod_after_vs_prod_before,
            ];

      const resp = await axios.post(
        "/api/zip-images",
        { imageURLS },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "images.zip");
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Set loading false for the specific button
      setButtonLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (isLoading && screenshotData) {
    return (
      <>
        <Spin spinning={isLoading} fullscreen></Spin>
      </>
    );
  }

  const items: DataType[] = screenshotData.map((item, index) => {
    const childData = (
      <div className="main-container flex flex-col gap-y-6">
        <div className="desktop flex flex-col gap-y-3">
          <div className="title-button flex flex-row align-middle justify-between gap-x-3">
            <div className="text-2xl font-bold ">DESKTOP</div>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                downloadImages({ scType: "desktop", itemIndex: index })
              }
              loading={buttonLoading["desktop" + index] || false} // Use the correct loading state
            >
              Download Desktop Images
            </Button>
          </div>
          <div className="sc-container bg-[#e4e4e4]" style={scContainerStyles}>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>STAGING</Title>
              <ScreenshotRender src={item.screenshot_files?.staging} />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD BEFORE UPDATE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.prod_before_update}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD AFTER UPDATE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.prod_after_update}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>STAGING VS PROD BEFORE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.staging_vs_prod_before}
              />
              <ShowPixelDiff
                diff={item.comparison_score?.staging_vs_prod_before}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD BEFORE VS PROD AFTER</Title>
              <ScreenshotRender
                src={item.screenshot_files?.prod_after_vs_prod_before}
              />
              <ShowPixelDiff
                diff={item.comparison_score?.prod_after_vs_prod_before}
              />
            </div>
          </div>
        </div>
        <div className="mobile flex flex-col gap-y-3">
          <div className="title-button flex flex-row align-middle justify-between gap-x-3">
            <div className="text-2xl font-bold ">MOBILE</div>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                downloadImages({ scType: "mobile", itemIndex: index })
              }
              loading={buttonLoading["mobile" + index] || false} // Use the correct loading state
            >
              Download Mobile Images
            </Button>
          </div>
          <div className="sc-container bg-[#e4e4e4]" style={scContainerStyles}>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>STAGING</Title>
              <ScreenshotRender src={item.screenshot_files?.m_staging} />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD BEFORE UPDATE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.m_prod_before_update}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD AFTER UPDATE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.m_prod_after_update}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>STAGING VS PROD BEFORE</Title>
              <ScreenshotRender
                src={item.screenshot_files?.m_staging_vs_prod_before}
              />
              <ShowPixelDiff
                diff={item.comparison_score?.m_staging_vs_prod_before}
              />
            </div>
            <div className="sc-items" style={scItems}>
              <Title style={titleStyle}>PROD BEFORE VS PROD AFTER</Title>
              <ScreenshotRender
                src={item.screenshot_files?.m_prod_after_vs_prod_before}
              />
              <ShowPixelDiff
                diff={item.comparison_score?.m_prod_after_vs_prod_before}
              />
            </div>
          </div>
        </div>
      </div>
    );

    return {
      key: index,
      label: item.url,
      children: childData,
    };
  });

  return (
    <div className="main--container flex flex-col gap-y-12">
      <div className="section--contianer flex flex-col gap-y-6">
        <h1 className="text-3xl font-medium">Interactivity Test Summary:</h1>
        {interSummary ? (
          <div className="flex flex-row gap-x-3 mt-3 justify-between text-center">
            <Card
              title="Total Test"
              style={{ width: 300, border: "1px solid #ccc" }}
            >
              <p className="text-4xl font-bold">
                {interSummary.inter_total_test}
              </p>
            </Card>
            <Card
              title="Failed Test"
              style={{ width: 300, border: "1px solid #ccc" }}
            >
              <p className="text-4xl font-bold">
                {interSummary.inter_failed_test}
              </p>
            </Card>
            <Card
              title="Passed Test"
              style={{ width: 300, border: "1px solid #ccc" }}
            >
              <p className="text-4xl font-bold">
                {interSummary.inter_passed_test}
              </p>
            </Card>
            <Card
              title="Skipped Test"
              style={{ width: 300, border: "1px solid #ccc" }}
            >
              <p className="text-4xl font-bold">
                {interSummary.inter_skipped_test}
              </p>
            </Card>
          </div>
        ) : (
          <div className="flex flex-row items-start">
            <p className="text-lg">No reports yet.</p>
          </div>
        )}
      </div>
      <div className="section--contianer flex flex-col gap-y-6">
        <h1 className="text-3xl font-medium">Failed Interactivity Test:</h1>
        <Table
          rowSelection={{
            type: "checkbox",
            ...interRowSelection,
          }}
          columns={interColumns}
          dataSource={interFailedData}
          pagination={{
            defaultPageSize: 10,
          }}
        />
      </div>
      <div className="section--contianer flex flex-col gap-y-6">
        <h1 className="text-3xl font-medium">Failed Screenshot Comparison:</h1>
        {items.length !== 0 ? (
          <Collapse items={items} />
        ) : (
          <div className="flex flex-row items-start">
            <p className="text-lg">No reports yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
