import json
from linecache import cache
import subprocess
import os
import sys
import shutil
import logging

logger = logging.getLogger()

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

    def _sp_player_dbus(self, command, parameters):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {MP_MEMB_PLAYER}.{command} \
            {parameters} > /dev/null", stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]

    def _sp_dbus(self, command, parameters):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {MP_MEMB}.{command} \
            {parameters} > /dev/null", stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]

    def _sp_dbus_set(self, command, parameters):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        return subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_SET_PATH} string:\"{MP_MEMB_PLAYER}\" \
            string:\"{command}\" {parameters} ", stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]

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
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result =  subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'PlaybackStatus' \
            | tail -1 \
            | cut -d \"\\\"\" -f2 | tr -d \"\n\"" \
            ,stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
        return result

    async def sp_track_progress(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'Position' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
        return result

    async def sp_get_volume(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'Volume' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
        return result

    async def sp_can_seek(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result = subprocess.Popen(f"dbus-send --print-reply --dest={self.player} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB_PLAYER}\" string:'CanSeek' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev | tr -d \"\n\"" \
            , stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
        return result

    async def sp_test_volume_control(self):
        oldVolume = await self.sp_get_volume(self)

        logger.debug("Volume test: " + oldVolume)
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
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        result = subprocess.Popen(f"dbus-send --print-reply --dest={orgPath} {MP_PATH} {PROP_PATH} \
            string:\"{MP_MEMB}\" string:'Identity' \
            | tail -1 \
            | rev | cut -d' ' -f 1 | rev" \
            , stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0].replace("\"", "").replace("\n", "")
        return result

    async def get_meta_data(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
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
                stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
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

        logger.debug("Cache-copying: " +  artUrl + " to" + target)
        shutil.copy2(artUrl, target)
        self.previousCachedImage = target

        return ("https://steamloopback.host/images/deckycache_musicControl/" + baseName)

    async def get_flatpaks(self):
        proc = subprocess.Popen('flatpak list -d --app | awk  \'BEGIN {FS="\\t"} {print "{\\"name\\":\\""$1"\\",\\"package\\":\\""$3"\\"},"}\\\'', stdout=subprocess.PIPE, stderr=None, shell=True)
        packages = proc.communicate()[0]
        packages = packages.decode("utf-8")
        packages = packages[:-2]
        return packages
    
    async def start_music_flatpak(self, packageAddress : str):
        env = os.environ.copy()
        env["DISPLAY"] = ':0'

        try:
            subprocess.Popen(f"xhost +local:",
                stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]
            subprocess.Popen(f"xhost +si:localuser:root",
                stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]

            env = os.environ.copy()
            env["DISPLAY"] = ':0'
            
            result = subprocess.Popen(f"flatpak run {packageAddress}", stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]
            return result
        except Exception as e:
            logger.exception("Failed to start flatpak!")
            return str(e)

    async def stop_flatpak(self, packageAddress):
        result = subprocess.Popen(f"flatpak kill {packageAddress}",
        stdout=subprocess.PIPE, shell=True, universal_newlines=True).communicate()[0]
        return result

    async def is_flatpak_running(self, packageAddress):
        env = os.environ.copy()
        env["DISPLAY"] = ':0'

        result = subprocess.Popen(f"flatpak ps --columns=application",
        stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]
        return result.find(packageAddress) != -1
    
    async def get_running_flatpak_from_list(self, flatpakString : str):
        env = os.environ.copy()
        env["DISPLAY"] = ':0'

        flatpaks = flatpakString.split(',')
        runningFlatpaks = subprocess.Popen(f"flatpak ps --columns=application",
        stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True).communicate()[0]

        for flatpak in flatpaks:
            if runningFlatpaks.find(flatpak) != -1:
                return flatpak
        
        return ""


    async def sp_list_media_players(self):
        env = os.environ.copy()
        env["DBUS_SESSION_BUS_ADDRESS"] = 'unix:path=/run/user/1000/bus'
        
        result = subprocess.Popen(f"dbus-send --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus org.freedesktop.DBus.ListNames",
        stdout=subprocess.PIPE, shell=True, env=env, universal_newlines=True, user=1000).communicate()[0]
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
        self.cacheDir = "/home/deck/.deckycache/MusicControl"
        self.symLinkPath = "/home/deck/.local/share/Steam/steamui/images/deckycache_musicControl"

        self.previousCachedImage = ""
        self.player = SP_DEST

        if os.path.isdir(self.cacheDir):
            shutil.rmtree(self.cacheDir)

        if not os.path.isdir(self.cacheDir):
            os.makedirs(self.cacheDir)
        
        if (not os.path.exists(self.symLinkPath)):
            os.symlink(self.cacheDir, self.symLinkPath, True)

        pass