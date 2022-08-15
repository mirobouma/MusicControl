# MusicControl

Music control plugin for [decky-loader](https://github.com/SteamDeckHomebrew/decky-loader).

### Usage

MusicControl allows you to control any playing media that implements the [MediaPlayer2.Player](https://specifications.freedesktop.org/mpris-spec/2.2/Player_Interface.html) DBUS interface.
Examples of applications you can control:
   - Spotify (flatpak)
   - Strawberry (flatpak)
   - Firefox (flatpak)

For the applications to show up, you must run the application through game mode, after that point you can control their music playback and switch to a game (music application needs to stay running in the background).

If multiple applications are running at the same time, you can select which program to control within the plugin tab.

