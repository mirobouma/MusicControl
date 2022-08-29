import { Focusable } from "decky-frontend-lib";
import { VFC } from "react";

export const TroubleshootingPage: VFC = () => {
  return (
    <Focusable>
      Make sure you have followed the steps on the Usage page. If the plugin
      still does not detect running media players when it should fresh after
      installation, try restarting your steam deck first. If the problems
      persist, please make an issue on the github page or send a message in the
      MusicControl Support thread in the #support-plugins channel of the Steam
      Deck Homebrew Discord.
    </Focusable>
  );
};
