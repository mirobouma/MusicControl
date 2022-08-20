import { staticClasses, Focusable } from "decky-frontend-lib";
import { CSSProperties, VFC } from "react";

const titleStyles: CSSProperties = {
  display: "flex",
  paddingTop: "3px",
  paddingBottom: "14px",
  paddingRight: "16px",
  boxShadow: "unset",
};

export const Title: VFC<any> = () => {
  return (
    <Focusable style={titleStyles} className={staticClasses.Title}>
      <div style={{ marginRight: "auto", flex: 0.9 }}>Music Control</div>
    </Focusable>
  );
};
