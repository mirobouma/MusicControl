import { Focusable } from "decky-frontend-lib";
import { VFC } from "react";

export const UsagePage: VFC = () => {
  return (
    <Focusable>
      For the plugin to be able to see the media player, you need to follow
      these steps:
      <ol>
        <li>Install your music application through discover store.</li>
        <li>Add your music player as a non-steam game in desktop mode.</li>
        <li>
          Launch your music player in game mode and start playback of music.
        </li>
      </ol>
      <br />
      When the application has launched and you have started playback, you can
      switch to a game using the steam button while keeping the media player
      running in the background. The plugin should automatically detect the
      running media player and show controls for you. In the case of multiple
      running media players, you can select which one to control in the plugin
      panel.
    </Focusable>
  );
};
