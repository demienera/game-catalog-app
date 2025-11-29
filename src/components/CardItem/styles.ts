import { CSSProperties } from "react";

export const useCardItemStyles = () => {
  return {
    card: {
      minWidth: 200,
      width: "100%",
      height: "100%",
      position: "relative",
      border: "none",
      transition: "border-color 0.3s ease",
    } as CSSProperties,
    likeIcon: (liked: boolean): CSSProperties =>
      ({
        position: "absolute",
        top: 12,
        right: 12,
        fontSize: 22,
        color: liked ? "#eb2f96" : "#999",
        cursor: "pointer",
      }) as CSSProperties,
    deleteIcon: {
      position: "absolute",
      top: 12,
      left: 12,
      fontSize: 20,
      color: "#999",
      cursor: "pointer",
    } as CSSProperties,
    cardTitle: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      display: "block",
      maxWidth: "100%",
      fontSize: 19,
    } as CSSProperties,
    cardImg: {
      height: 180,
      objectFit: "cover",
    } as CSSProperties,
  };
};
