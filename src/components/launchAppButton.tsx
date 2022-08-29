import {
  ButtonItem,
  Menu,
  MenuItem,
  PanelSectionRow,
  showContextMenu,
} from "decky-frontend-lib";

import { useEffect, useState, VFC } from "react";
import * as python from "./../python";

type Flatpak = {
  name: string;
  package: string;
};
export const LaunchAppButton: VFC = () => {
  const [installedFlatpaks, setInstalledFlatpaks] = useState<Flatpak[]>([]);
  const [supportedFlatpaks, setSupportedFlatpaks] = useState<Flatpak[]>([]);
  const [currentlyRunningFlatpak, setCurrentlyRunningFlatpak] =
    useState<Flatpak | null>(null);

  const handleOnClickStart = (e: MouseEvent) =>
    showContextMenu(
      <Menu label="Select Media Player To Start" cancelText="Cancel">
        {supportedFlatpaks.map((flatpak: Flatpak) => {
          return (
            <MenuItem
              onSelected={() => {
                python.startFlatpak(flatpak.package);
                setCurrentlyRunningFlatpak(flatpak);
              }}
            >
              {flatpak.name}
            </MenuItem>
          );
        })}
      </Menu>,
      e.currentTarget ?? window
    );

  const handleOnClickStop = (e: MouseEvent) => {
    if (currentlyRunningFlatpak == null) return;
    python.stopFlatpak(currentlyRunningFlatpak?.package);
    setCurrentlyRunningFlatpak(null);
  };

  useEffect(() => {
    python.resolve(python.listFlatpaks(), (flatpakString: string) => {
      const flatpaks: Flatpak[] = JSON.parse(`[${flatpakString}]`);
      const supportedFlatpaks = flatpaks.filter((flatpak) => {
        return flatpak.package == "com.spotify.Client";
      });

      setInstalledFlatpaks(flatpaks);
      setSupportedFlatpaks(supportedFlatpaks);

      const supportedFlatpaksString = supportedFlatpaks.join(",");
      python.resolve(
        python.getRunningFlatpakFromList(supportedFlatpaksString),
        (runningFlatpak: string) => {
          if (runningFlatpak == "") {
            setCurrentlyRunningFlatpak(null);
            return;
          }

          const runningIndex = supportedFlatpaks.findIndex(
            (candidate) => candidate.package == runningFlatpak
          );
          if (runningIndex == -1) {
            setCurrentlyRunningFlatpak(null);
            return;
          }

          setCurrentlyRunningFlatpak(supportedFlatpaks[runningFlatpak]);
        }
      );
    });
  }, []);

  if (supportedFlatpaks?.length > 0 && currentlyRunningFlatpak == null) {
    return (
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleOnClickStart}>
          Start Flatpak
        </ButtonItem>
      </PanelSectionRow>
    );
  }

  if (currentlyRunningFlatpak != null) {
    return (
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleOnClickStop}>
          Stop {currentlyRunningFlatpak.name}
        </ButtonItem>
      </PanelSectionRow>
    );
  }

  return <div></div>;
};
