import { theme } from "antd";
import { CSSProperties } from "react";

const { useToken } = theme;

export const useLogoStyles = () => {
  const { token } = useToken();

  return {
    logo: {
      fontFamily: token.fontFamilySecondary,
      fontSize: 27,
      fontWeight: "bold",
      color: token.colorPrimary,
    } as CSSProperties,
  };
};
