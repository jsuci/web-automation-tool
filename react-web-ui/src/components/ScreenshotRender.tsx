import { FileImageOutlined } from "@ant-design/icons";
import { Image, Spin } from "antd";
import { useState } from "react";

interface ScreenshotRenderProps {
  src: string | undefined;
}

const imgStyle: React.CSSProperties = {
  width: "150px",
  height: "250px",
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ScreenshotRender = ({ src }: ScreenshotRenderProps) => {
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  return src ? (
    <>
      {!imgLoaded && (
        <div style={imgStyle}>
          <Spin />
        </div>
      )}
      <Image
        style={{ ...imgStyle, display: !imgLoaded ? "none" : "block" }}
        src={src}
        onLoad={() => setImgLoaded(true)}
      />
    </>
  ) : (
    <div
      style={{
        ...imgStyle,
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
        No screenshot yet.
      </p>
    </div>
  );
};

export default ScreenshotRender;
