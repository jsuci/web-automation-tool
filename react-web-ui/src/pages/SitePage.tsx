import { useState, useEffect, ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ScreenshotLayout from "../components/ScreenshotLayout";
import CustomBreadcrumb from "../components/CustomBreadcrumb";
import { Typography, Collapse, Tooltip, Button } from "antd";
import { Run } from "../../../tests/lib/types";
import ScreenshotRender from "../components/ScreenshotRender";

interface DataType {
  key: number;
  label: string;
  children: ReactNode;
}

interface DownloadImageProps {
  scType: "mobile" | "desktop";
  itemIndex: number;
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

const SitePage = () => {
  const { siteName, runId } = useParams();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    axios.get(`/api/pages?siteName=${siteName}&runId=${runId}`).then((res) => {
      const runData: Run = res.data;

      setRun(runData);
      setLoading(false);
    });
  }, []);

  const downloadImages = async ({ scType, itemIndex }: DownloadImageProps) => {
    const allScreenshots = run?.screenshots;
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

  if (!loading && run?.screenshots) {
    const items: DataType[] = run.screenshots.map((item, index) => {
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
            <div
              className="sc-container bg-[#e4e4e4]"
              style={scContainerStyles}
            >
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
                  src={item.screenshot_files?.staging_vs_prod_before}
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
            <div
              className="sc-container bg-[#e4e4e4]"
              style={scContainerStyles}
            >
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
      <ScreenshotLayout>
        <CustomBreadcrumb
          items={[
            { title: <Link to={`/${siteName}`}>Runs</Link> },
            { title: "Pages" },
          ]}
        />
        <Title level={2}>
          List of pages & screenshots under{" "}
          <span style={{ color: "#66b3ba" }}>{siteName}</span>
        </Title>
        <Collapse items={items} />
      </ScreenshotLayout>
    );
  }
};

export default SitePage;
