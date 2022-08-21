import {
  definePlugin,
  findAllModules,
  findModule,
  findModuleChild,
  ServerAPI,
} from "decky-frontend-lib";

import { FaMusic } from "react-icons/fa";

import { Title } from "./components/title";
import { Content } from "./components/content";
import { AppContextProvider } from "./context/context";
import * as python from "./python";

declare global {
  interface Window {
    findAllModules: any;
    findModule: any;
    findModuleChild: any;
  }
}

window.findAllModules = findAllModules;
window.findModule = findModule;
window.findModuleChild = findModuleChild;

export default definePlugin((serverApi: ServerAPI) => {
  python.setServer(serverApi);

  return {
    title: <Title />,
    content: (
      <AppContextProvider>
        <Content />
      </AppContextProvider>
    ),
    icon: <FaMusic />,
  };
});
