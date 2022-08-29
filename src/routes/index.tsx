import { SidebarNavigation } from "decky-frontend-lib";
import { VFC } from "react";
import { InfoPage } from "./pages/info";
import { TroubleshootingPage } from "./pages/troubleshooting";
import { UsagePage } from "./pages/usage";

export const InfoRoute: VFC = () => {
  return (
    <SidebarNavigation
      title="MusicControl"
      showTitle
      pages={[
        {
          title: "Info",
          content: <InfoPage />,
          route: "/decky/musiccontrol/info/info",
        },
        {
          title: "Usage",
          content: <UsagePage />,
          route: "/decky/musiccontrol/info/usage",
        },
        {
          title: "Troubleshooting",
          content: <TroubleshootingPage />,
          route: "/decky/musiccontrol/info/troubleshooting",
        },
      ]}
    />
  );
};
