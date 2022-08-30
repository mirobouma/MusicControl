import { Focusable } from "decky-frontend-lib";
import { VFC } from "react";

export const InfoPage: VFC = () => {
  return (
    <Focusable>
      Music Control allows you to control any media playback that is currently
      running that implements the MPRIS dbus interface. <br />
      Examples of application that are supported:
      <ul>
        <li>Spotify</li>
        <li>Cider</li>
        <li>Chrome / Firefox</li>
        <li>Strawberry</li>
      </ul>
      Only the flatpak versions of these applications have been tested, and not
      all of them might support the full feature set, so it is recommended to
      use the discover store to install the applications.
    </Focusable>
  );
};
