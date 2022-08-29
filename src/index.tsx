import { definePlugin, ServerAPI, SteamSpinner } from "decky-frontend-lib";
import { FaMusic } from "react-icons/fa";
import { Title } from "./components/title";
import { Content } from "./components/content";
import { AppContextProvider } from "./context/context";
import * as python from "./python";
import { InfoRoute } from "./routes";
import { Suspense } from "react";

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);
  serverApi.routerHook.addRoute("/decky/musiccontrol/info", InfoRoute, () => {
    return (
      <Suspense
        fallback={
          <div
            style={{
              marginTop: "40px",
              height: "calc( 100% - 40px )",
              overflowY: "scroll",
            }}
          >
            <SteamSpinner />
          </div>
        }
      >
        <InfoRoute />
      </Suspense>
    );
  });

  return {
    title: <Title />,
    content: (
      <AppContextProvider>
        <Content />
      </AppContextProvider>
    ),
    icon: <FaMusic />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky/musiccontrol/info");
    },
  };
});
