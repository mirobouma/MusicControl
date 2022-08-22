import { CSSProperties } from "react";

export const musicControlDividerStyle: CSSProperties = {
  content: "",
  bottom: "-0.5px",
  left: "0",
  right: "0",
  height: "1px",
  background: "#23262e",
  width: "calc(100% + 32px)",
  marginLeft: "-16px",
  marginRight: "-16px",
};

export const musicControlButtonStyleFirst: CSSProperties = {
  marginLeft: "0px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 0px 0px 0px",
  minWidth: "0",
};

export const musicControlButtonStyle: CSSProperties = {
  marginLeft: "5px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 0px 0px 0px",
  minWidth: "0",
};

export const musicControlFieldDividerStyle: CSSProperties = {
  content: "",
  bottom: "-0.5px",
  left: "0",
  right: "0",
  height: "1px",
  background: "#23262e",
  width: "100%",
  marginTop: "5px",
  marginBottom: "5px",
};

export const musicControlFieldStyle: CSSProperties = {
  width: "180px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};
