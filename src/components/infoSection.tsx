import { ButtonItem, Router } from "decky-frontend-lib";
import { VFC } from "react";

export const InfoSection: VFC = () => {
  const onClickInfo = () => {
    Router.CloseSideMenus();
    Router.Navigate("/decky/musiccontrol/info");
  };

  return (
    <ButtonItem layout="below" bottomSeparator={false} onClick={onClickInfo}>
      Info
    </ButtonItem>
  );
};
