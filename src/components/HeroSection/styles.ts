import { theme } from "antd";
import { CSSProperties } from "react";

const { useToken } = theme;

export const useHeroSectionStyles = () => {
  const { token } = useToken();

  return {
    container: (bgImage: string): CSSProperties => ({
      padding: 24,
      flexGrow: 1,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 15,
      background: token.colorBgContainer,
      borderRadius: 0,
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }),
    title: {
      margin: 0,
      maxWidth: 900,
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
      textAlign: "center",
      color: token.colorPrimary,
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    } as CSSProperties,
    subtitle: {
      maxWidth: 650,
      fontSize: "clamp(1rem, 2vw, 1.2rem)",
      textAlign: "center",
      color: token.colorTextBase,
      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    } as CSSProperties,
    link: {
      marginTop: token.marginMD,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: 10,
      color: token.colorTextBase,
      padding: "6px 15px",
      backgroundColor: token.colorBgContainer,
      textDecoration: "none",
      display: "inline-block",
    } as CSSProperties,
  };
};
