from getpass import getpass
from linecache import cache
import subprocess
import os
import sys
import shutil

import decky_plugin

SP_DEST = "org.mpris.MediaPlayer2.spotify"

MP_PATH = "/org/mpris/MediaPlayer2"
MP_MEMB_PLAYER = "org.mpris.MediaPlayer2.Player"
MP_MEMB = "org.mpris.MediaPlayer2"
PROP_PATH = "org.freedesktop.DBus.Properties.Get"
PROP_SET_PATH = "org.freedesktop.DBus.Properties.Set"

class Plugin:
    player = SP_DEST
    previousCachedImage = ""
    cacheDir : str = ""
    symLinkPath : str = ""

    def _get_dbus_env(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = f'unix:path=/run/user/{os.getuid()}/bus'
        return env

    def _sp_player_dbus(self, command, parameters):
      
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {MP_MEMB_PLAYER}.{command} \
            {parameters} > /dev/null", stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]

    def _sp_dbus(self, command, parameters):
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {MP_MEMB}.{command} \
            {parameters} > /dev/null", stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]

    def _sp_dbus_set(self, command, parameters):
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_SET_PATH} string:\"{MP_MEMB_PLAYER}\" \
            string:\"{command}\" {parameters} ", stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]

    async def _sp_open(self, uri):
        return self._sp_player_dbus(self, "OpenUri", f"string:{uri}")

    async def sp_play(self):
        return self._sp_player_dbus(self, "PlayPause", "")

    async def sp_pause(self):
        return self._sp_player_dbus(self, "Pause", "")
    
    async def sp_next(self):
        return self._sp_player_dbus(self, "Next", "")

    async def sp_previous(self):
        return self._sp_player_dbus(self, "Previous", "")

    async def sp_seek(self, amount):
        return self._sp_player_dbus(self, "Seek", f"int64:\"{amount}\"")

    async def sp_set_position(self, position : int, trackid : str):
        return self._sp_player_dbus(self, "SetPosition", f"objpath:\"{trackid}\" int64:\"{position}\"")

    async def sp_set_volume(self, volume):
        return self._sp_dbus_set(self, "Volume", f"variant:double:{volume}")

    async def sp_track_status(self):
        result =  subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'PlaybackStatus' \
            | tail -1 \
            | cut -d \"\\\"\" -f2 | tr -d \"\n\"" \
            ,stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        return result

    async def sp_track_progress(self):
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'Position' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        return result

    async def sp_get_volume(self):
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'Volume' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        return result

    async def sp_can_seek(self):
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'CanSeek' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        return result

    async def sp_test_volume_control(self):
        oldVolume = await self.sp_get_volume(self)

        print("Volume test: " + oldVolume)
        sys.stdout.flush()

        if oldVolume == "":
            return "false"
        if oldVolume != "0":
            return "true"

        await self.sp_set_volume(self, 0.01)
        newVolume = await self.sp_get_volume(self)
        if oldVolume != newVolume:
            await self.sp_set_volume(self, oldVolume)
            return "true"
        return "false"

    async def sp_identity(self, orgPath: str):
        result = subprocess.Popen(f"dbus-send --print-reply --dest={orgPath} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB}\" string:'Identity' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev" \
            , stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0].replace("\"", "").replace("\n", "")
        return result

    async def get_meta_data(self):
        try:
            result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
                string:\"{MP_MEMB_PLAYER}\" string:'Metadata' \
                | grep -Ev \"^method\"                           `# Ignore the first line.`   \
                | grep -Eo '(\"(.*)\")|(\\b[0-9][a-zA-Z0-9.]*\\b)' `# Filter interesting fiels.`\
                | sed -E '2~2 a|'                              `# Mark odd fields.`         \
                | tr -d '\n'                                   `# Remove all newlines.`     \
                | sed -E 's/\\|/\\n/g'                           `# Restore newlines.`        \
                | sed -E 's/(xesam:)|(mpris:)//'               `# Remove ns prefixes.`      \
                | sed -E 's/^\"//'                              `# Strip leading...`         \
                | sed -E 's/\"$//'                              `# ...and trailing quotes.`  \
                | sed -E 's/\"+/|/'                             `# Regard "" as seperator.`  \
                | sed -E 's/ +/ /g'                            `# Merge consecutive spaces.`",  
                stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        except:
            result = "Unavailable"
        return result
    
    async def cache_album_art(self, artUrl: str):
        if (not artUrl.startswith('file:///')):
            return artUrl
        if (self.previousCachedImage != ""):
            os.remove(self.previousCachedImage)
            self.previousCachedImage = ""

        artUrl = artUrl.removeprefix('file://')
        if (not os.path.exists(artUrl)):
            return ""
        
        baseName = os.path.basename(artUrl)
        target = os.path.join(self.cacheDir, baseName)

        print("[MusicControl] Cache-copying: " +  artUrl + " to" + target)
        sys.stdout.flush()

        shutil.copy2(artUrl, target)
        self.previousCachedImage = target

        return ("https://steamloopback.host/images/deckycache_musicControl/" + baseName)

    async def sp_list_media_players(self):
        result = subprocess.Popen(f"dbus-send --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus org.freedesktop.DBus.ListNames",
        stdout=subprocess.PIPE, shell=True, env=self._get_dbus_env(self), universal_newlines=True).communicate()[0]
        stripped = result.split('array [')[1].split(']')[0].replace("\n", "", 1).replace("\n", ",") \
            .replace(" ", "").replace("string", "").replace("\"", "").rstrip(',')
        services = stripped.split(',')
        
        mediaPlayers = []
        for service in services:
            if service.find('org.mpris.MediaPlayer2') != -1:
                mediaPlayers.append(service)

        servicesString = ""
        mediaPlayerCount = len(mediaPlayers)
        for i in range(mediaPlayerCount):
            servicesString += mediaPlayers[i]
            if i < mediaPlayerCount - 1:
                servicesString += ','
        return servicesString
    
    async def sp_set_media_player(self, player : str):
        self.player = player

    async def sp_get_media_player(self):
        return self.player

    async def _main(self):
        print(f"[MusicControl] UID: {os.getuid()}")
        sys.stdout.flush()
        self.cacheDir = os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, "cache")
        self.symLinkPath = os.path.join(decky_plugin.DECKY_USER_HOME, ".local/share/Steam/steamui/images/deckycache_musicControl")

        self.previousCachedImage = ""
        self.player = SP_DEST

        try:
            if os.path.exists(self.cacheDir):
                shutil.rmtree(self.cacheDir)
        except:
            print(f"[MusicControl] Failed to clear cache folder")

        if not os.path.exists(self.cacheDir):
            os.makedirs(self.cacheDir)
        
        if (not os.path.exists(self.symLinkPath)):
            os.symlink(self.cacheDir, self.symLinkPath, True)

        pass
