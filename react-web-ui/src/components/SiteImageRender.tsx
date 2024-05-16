import { FileImageOutlined } from "@ant-design/icons";
import { Image, Spin } from "antd";
import { useState } from "react";

interface SiteImageRenderProps {
  src: string | undefined;
  alt: string | undefined;
}

const imgStyle: React.CSSProperties = {
  width: 240,
  objectFit: "cover",
};

const SiteImageRender = ({ src, alt }: SiteImageRenderProps) => {
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  return src ? (
    <>
      {!imgLoaded && (
        <Spin
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "160px",
          }}
        />
      )}
      <Image
        style={{ ...imgStyle, display: !imgLoaded ? "none" : "block" }}
        alt={alt}
        src={src}
        onLoad={() => setImgLoaded(true)}
      />
    </>
  ) : (
    <div
      style={{
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        rowGap: "1em",
        border: "1px solid #aeaeae",
        borderRadius: "3px",
      }}
    >
      <FileImageOutlined style={{ fontSize: "3em", color: "#777" }} />
      <p
        style={{
          fontSize: "1em",
          fontWeight: "400",
          color: "#777",
        }}
      >
        No site image yet.
      </p>
    </div>
  );
};

export default SiteImageRender;
