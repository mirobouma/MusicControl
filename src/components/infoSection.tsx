import { PanelSectionRow } from "decky-frontend-lib";
import { VFC } from "react";

export const InfoSection: VFC<{ show: boolean }> = ({ show }) => {
  if (!show) return <div></div>;
  return (
    <PanelSectionRow>
      <div style={{ marginTop: "5px", padding: "0px" }}>
        Launch any media player through game mode that implements MPRIS and it
        will show up in this panel.
      </div>
    </PanelSectionRow>
  );
};
