import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card } from "antd";
import SiteImageRender from "../components/SiteImageRender";
import DashboardLayout from "../components/DashboardLayout";

const { Meta } = Card;

const siteCardsStyle: React.CSSProperties = {
  display: "flex",
  gap: "60px",
  flexWrap: "wrap",
  justifyContent: "center",
};

interface SiteData {
  siteName: string;
  imageUrl: string;
}

const Screenshots = () => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const sites = await axios.get("/api/sites");

      if (sites && sites.data.length > 0) {
        const siteRunPromises = sites.data.map(async (siteName: string) => {
          const run = await axios.get(`/api/runs?siteName=${siteName}`);

          return {
            siteName,
            run: run.data,
          };
        });

        const siteRuns = await Promise.all(siteRunPromises);

        if (siteRuns && siteRuns.length > 0) {
          const siteImagePromises = siteRuns.map(async (siteRunItem) => {
            const screenshots = await axios.get(
              `/api/pages?siteName=${siteRunItem.siteName}&runId=${siteRunItem.run[0]}`
            );

            const screenshotData = screenshots.data.screenshots.filter(
              (scData: any) => {
                const url = new URL(scData.url);
                return url.pathname === "/";
              }
            );

            if (screenshotData.length !== 0) {
              return {
                siteName: siteRunItem.siteName,
                imageUrl: screenshotData[0].screenshot_files.prod_before_update,
              };
            } else {
              return {
                siteName: "",
                imageUrl: "",
              };
            }
          });

          const siteImages = await Promise.all(siteImagePromises);

          console.log("siteImages", siteImages);

          setSites(siteImages);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  if (!loading && sites) {
    return (
      <DashboardLayout>
        <div className="siteCards" style={siteCardsStyle}>
          {sites.map(
            (siteData, index) =>
              siteData.siteName &&
              siteData.imageUrl && (
                <Card
                  key={index}
                  hoverable
                  style={{ width: 240 }}
                  cover={
                    <Link
                      to={`/${siteData.siteName}`}
                      style={{
                        height: 300,
                        overflow: "hidden",
                      }}
                    >
                      <SiteImageRender
                        alt={siteData.siteName}
                        src={siteData.imageUrl}
                      />
                    </Link>
                  }
                >
                  <Meta
                    title={
                      <Link to={`/${siteData.siteName}`}>
                        {siteData.siteName}
                      </Link>
                    }
                    style={{
                      textAlign: "center",
                    }}
                  />
                </Card>
              )
          )}
        </div>
      </DashboardLayout>
    );
  }
};

export default Screenshots;
