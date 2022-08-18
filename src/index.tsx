import {
  ButtonItem,
  definePlugin,
  Menu,
  MenuItem,
  showContextMenu,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  SliderField,
  staticClasses,
  DialogButton, 
  Focusable
} from "decky-frontend-lib";

import { CSSProperties, VFC, useState } from "react";
import { FaMusic, FaPlay, FaPause, FaFastForward, FaFastBackward } from "react-icons/fa";
import * as python from "./python";

import default_music from "../assets/default_music.png";

var firstTime: boolean = true;
var periodicHook: NodeJS.Timer | null = null;
var seekTimeout: NodeJS.Timer | null = null;
var volumeTimeout: NodeJS.Timer | null = null;

var changedProvider : boolean = false;
var isSeeking: boolean = false;
var isSettingVolume: boolean = false;
var serviceIsAvailable: boolean = false;
var currentSong: string = "Not Playing";
var currentArtist: string = "Unknown Artist";
var currentArtUrl: string = default_music;
var currentTrackId: string = "/not/used";
var currentTrackProgress: number = 0;
var currentTrackLength: number = 1;
var currentTrackStatus: string = "Paused";
var currentServiceProvider: string = ""
var providers: string[] = [];
var providersToIdentity = {}
var currentVolume: number = 1.0;
var canModifyVolume: boolean = false;
var canSeek: boolean = false;

var findDBUSServices = function() {};
var updateCurrentTrack = function(){};
var setDefaultValues = function(){};

const titleStyles: CSSProperties = {
  display: 'flex',
  paddingTop: '3px',
  paddingBottom: '14px',
  paddingRight: '16px',
  boxShadow: 'unset',
};

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
  python.setServer(serverAPI);

  setDefaultValues = function () {
    setServiceIsAvailable(false);
    setCurrentSong("Not Playing");
    setCurrentArtUrl(default_music);
    setCurrentArtist("Unknown Artist");
    setCurrentTrackLength(1);
    setCurrentTrackId("/not/used");
    setCurrentTrackProgress(0);
    setCurrentTrackStatus("Paused");
    setCurrentServiceProvider("");
    setCurrentVolume(1.0);
    setCanModifyVolume(false);
    setCanSeek(false);
    providers = []
  }

  const [currentSongGlobal, setCurrentSong_internal] = useState<string>(currentSong);
  const setCurrentSong = (value: string) => {
    if (value == "" || value == null || typeof(value) != 'string')
    {
      currentSong = "Not Playing";
      setCurrentSong_internal(currentSong);
      return;
    }
    
    currentSong = value;
    setCurrentSong_internal(value);
  };

  const [serviceAvailableGlobal, setServiceIsAvailable_internal] = useState<boolean>(serviceIsAvailable);
  const setServiceIsAvailable = (value: boolean) => {
    serviceIsAvailable = value;
    setServiceIsAvailable_internal(value);
  };

  const [canSeekGlobal, setCanSeek_internal] = useState<boolean>(canSeek);
  const setCanSeek = (value: boolean) => {
    canSeek = value;
    setCanSeek_internal(value);
  };

  const [currentArtistGlobal, setCurrentArtist_internal] = useState<string>(currentArtist);
  const setCurrentArtist = (value: string) => {
    if (value == "" || value == null || typeof(value) != 'string')
    {
      currentArtist = "Unknown Artist";
      setCurrentArtist_internal(currentArtist);
      return;
    }

    currentArtist = value;
    setCurrentArtist_internal(value);
  };

  const [currentArtUrlGlobal, setCurrentArtUrl_internal] = useState<string>(currentArtUrl);
  const setCurrentArtUrl = (value: string) => {
    // no support for file links yet :( sorry
    if (value == "" ||  value == null ||  typeof(value) != 'string' || (typeof(value) !== 'undefined' && value.startsWith('file:///')))
    {
      currentArtUrl = default_music;
      setCurrentArtUrl_internal(default_music);
      return;
    }
    
    currentArtUrl = value;
    setCurrentArtUrl_internal(value);
  };

  const [currentTrackStatusGlobal, setCurrentTrackStatus_internal] = useState<string>(currentTrackStatus);
  const setCurrentTrackStatus = (value: string) => {
    // no support for file links yet :( sorry
    if (value == "" ||  value == null || typeof(value) != 'string')
    {
      currentTrackStatus = "Paused";
      setCurrentTrackStatus_internal("Paused");
      return;
    }
    
    currentTrackStatus = value.replace(/(\r\n|\n|\r)/gm, "");
    setCurrentTrackStatus_internal(currentTrackStatus);
  };

  const [currentServiceProviderGlobal, setCurrentServiceProvider_internal] = useState<string>(currentServiceProvider);
  const setCurrentServiceProvider = (value: string) => {
    changedProvider = true;

    // no support for file links yet :( sorry
    if (value == "" ||  value == null || typeof(value) != 'string')
    {
      currentServiceProvider = "";
      setCurrentServiceProvider_internal("");
      setCanModifyVolume(false);
      return;
    }
    
    currentServiceProvider = value;
    setCurrentServiceProvider_internal(value);
    python.sp_set_media_player(currentServiceProvider);
  };

  const [currentTrackProgressGlobal, setCurrentTrackProgress_internal] = useState<number>(currentTrackProgress);
  const setCurrentTrackProgress = (value: number) => {
    if (isSeeking)
      return;

    if (isNaN(value))
    {
      currentTrackProgress = 0;
      setCurrentTrackProgress_internal(value);
      return;
    }
     
    currentTrackProgress = value;
    setCurrentTrackProgress_internal(value);
  };

  const [currentVolumeGlobal, setCurrentVolume_internal] = useState<number>(currentVolume);
  const setCurrentVolume = (value: number) => {
    if (isSettingVolume)
      return;

    if ((typeof value === 'number' && isFinite(value)) || (typeof value === 'string' && value !== "" && !isNaN(parseFloat(value))))
    {
      currentVolume = value;
      setCurrentVolume_internal(value);
      return;
    }
   
    currentVolume = 1.0;
    setCurrentVolume_internal(value);
  };

  const [canModifyVolumeGlobal, setCanModifyVolume_internal] = useState<boolean>(canModifyVolume);
  const setCanModifyVolume = (value: boolean) => {
    canModifyVolume = value;
    setCanModifyVolume_internal(value);
  };

  const [currentTrackIdGlobal, setCurrentTrackId_internal] = useState<string>(currentTrackId);
  const setCurrentTrackId = (value: string) => {
    if (value == "" ||  value == null || typeof(value) != 'string')
    {
      currentTrackId = "/not/used";
      setCurrentTrackId_internal(value);
      return;
    }
     
    currentTrackId = value;
    setCurrentTrackId_internal(value);
  };

  const [currentTrackLengthGlobal, setCurrentTrackLength_internal] = useState<number>(currentTrackLength);
  const setCurrentTrackLength = (value: number) => {
    if (isNaN(value))
    {
      currentTrackLength = 1;
      return;
    }
    currentTrackLength = value;
    setCurrentTrackLength_internal(value);
  };

  findDBUSServices = function() {
    python.resolve(python.sp_list_media_players(),  (mediaPlayers: string) => {
      if (mediaPlayers == "Unavailable" || mediaPlayers == null || typeof(mediaPlayers) != 'string' || mediaPlayers == "")
      {
        setDefaultValues();
        return;
      }

      providers = mediaPlayers.split(',');

      if (providers.length > 0 && currentServiceProvider == "")
      {
        setCurrentServiceProvider(providers[0]);
      }

      providers.forEach((provider: string) => {
        if (provider in providersToIdentity)
          return;

        python.resolve(python.sp_identity(provider),  (providerName: string) => {
          providersToIdentity[provider] = providerName;
        });
      });
      
      updateCurrentTrack();
    });
  };

  updateCurrentTrack = function () {
    python.resolve(python.getMetaData(),  (metaData: string) => {
      if (metaData == "Unavailable" || metaData == null  || typeof(metaData) != 'string' || metaData == "")
      {
        setDefaultValues();
        findDBUSServices();
        return;
      }
  
      if (serviceIsAvailable == false)
        setServiceIsAvailable(true);
      
      const variables = metaData.split('\n');
      var dataLookup  = {};

      variables.forEach((value: string) => {
        const keyValue = value.split('|');
        dataLookup[keyValue[0]] = keyValue[1];
      });

      setCurrentSong(dataLookup["title"]);
      setCurrentArtUrl(dataLookup["artUrl"]);
      setCurrentArtist(dataLookup["artist"]);
      setCurrentTrackLength(dataLookup["length"]);

       // In some rare cases for the first time the metaData can be correct but it won't have any actual info yet
      if (currentTrackId == "" && dataLookup["trackid"] != "")
      {
        // Force us the re-cache the volume/seek controls.
        changedProvider = true;
      }
      
      setCurrentTrackId(dataLookup["trackid"]);

      python.resolve(python.sp_track_progress(), setCurrentTrackProgress);
      python.resolve(python.sp_track_status(), setCurrentTrackStatus);

      if (changedProvider)
      {
        isSettingVolume = true;
        isSeeking = true;
        
        python.resolve(python.sp_test_volume_control(), (result: string) => {
            setCanModifyVolume(result == "true");
            isSettingVolume = false;
            if (result == "true")
              python.resolve(python.sp_get_volume(), setCurrentVolume);
        });

        python.resolve(python.sp_can_seek(), (result: string) => {
          setCanSeek(result == "true");
          isSeeking = false;
      });

        changedProvider = false;
      }

      if (canModifyVolume)
        python.resolve(python.sp_get_volume(), setCurrentVolume);
  });
  };

  if (firstTime) 
  {
    if (periodicHook != null) {
      clearInterval(periodicHook);
      periodicHook = null;
    }

    if (seekTimeout != null) {
      clearInterval(seekTimeout);
      seekTimeout = null;
    }

    if (volumeTimeout != null) {
      clearInterval(volumeTimeout);
      volumeTimeout = null;
    }

    isSettingVolume = false;
    isSeeking = false;

    firstTime = false;
    findDBUSServices();

    console.debug("Setting up periodic hook");
    periodicHook = setInterval(function() {
      findDBUSServices();
    }, 1000);
  }

  return (
    <PanelSection>
      <div className={staticClasses.PanelSectionTitle}> Currently playing</div>
      <div style={{display: 'flex', marginBottom: '5px'}}>
        <div style={{width: '80px', height:'80px'}}>
          <img style={{borderRadius: '5px', width: '80px', height:'80px'}} src={currentArtUrlGlobal} />
        </div>
        <div style={{width: '100%', marginLeft: '10px'}}>
          <div style={{width: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            {currentSongGlobal}
          </div>
          <div style={{
              content: "",
              bottom: '-0.5px',
              left: '0',
              right: '0',
              height: '2px',
              background: '#23262e',
              width: '100%',
              marginTop: '5px',
              marginBottom: '5px',
          }}></div>
          <div style={{width: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            {currentArtistGlobal}
          </div>
          <div style={{
              content: "",
              bottom: '-0.5px',
              left: '0',
              right: '0',
              height: '2px',
              background: '#23262e',
              width: '100%',
              marginTop: '5px',
              marginBottom: '5px',
          }}></div>
        </div>
      </div>
      {
      currentTrackLengthGlobal > 1 ?
      <SliderField value={currentTrackProgressGlobal / currentTrackLengthGlobal} min={0} max={1} step={0.05} disabled={!canSeekGlobal}
        onChange={(value: number) => {
          const roundedProgress = Math.round(value * currentTrackLength);
          python.execute(python.sp_setPosition(roundedProgress, currentTrackId));
          
          isSeeking = false;
          setCurrentTrackProgress(roundedProgress);
          isSeeking = true;

          clearTimeout(seekTimeout!);
          seekTimeout = setTimeout(() => {
            isSeeking = false;
          }, 1500);
      }}></SliderField> : <div></div>
      }
      <Focusable style={{marginTop: '10px', marginBottom: '10px', display: 'flex'}} flow-children='horizontal'>
        <DialogButton 
          style={{
            marginRight: '5px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px 0px 0px 0px',
            minWidth: '0'}}
          onClick={python.sp_previous}>
          <FaFastBackward style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
        <DialogButton
          style={{
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px 0px 0px 0px',
            minWidth: '0'}}
          onClick={python.sp_play}>
          {currentTrackStatusGlobal == "Playing" ? 
          <FaPause style={{ marginTop: '-4px', display: 'block' }} /> : 
          <FaPlay style={{ marginTop: '-4px', display: 'block' }} /> }
        </DialogButton>
        <DialogButton
          style={{
            marginLeft: '5px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px 0px 0px 0px',
            minWidth: '0'}}
          onClick={python.sp_next}>
          <FaFastForward style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
      </Focusable>
      <div style={{
        content: "",
        bottom: '-0.5px',
        left: '0',
        right: '0',
        height: '1px',
        background: '#23262e',
        width: '100%',
        marginTop: '5px',
        marginBottom: '5px',
      }}></div>
      {
      serviceAvailableGlobal && canModifyVolumeGlobal ?
      <div>
        <div className={staticClasses.PanelSectionTitle}>Playback Volume</div>
        <div>
          <SliderField value={Math.round(currentVolumeGlobal * 100)} min={0} max={100} step={1} 
            onChange={(value: number) => {
              value /= 100.0;
              python.execute(python.sp_set_volume(value));
              
              isSettingVolume = false;
              setCurrentVolume(value);
              isSettingVolume = true;

              clearTimeout(volumeTimeout!);
              volumeTimeout = setTimeout(() => {
                isSettingVolume = false;
              }, 1500);
          }}>
          </SliderField>
        </div>
      </div>
      : <div></div>
      }
      <PanelSectionRow>
        <ButtonItem
            layout="below"
            onClick={(e) =>
              showContextMenu(
                <Menu label="Select Provider" cancelText="Cancel" onCancel={() => {}}>
                  {
                    providers.map((provider: string, i: number) => {
                      return <MenuItem onSelected={() => {
                        setCurrentServiceProvider(provider);
                        python.sp_set_media_player(provider);
                      }}>
                        {provider in providersToIdentity ? providersToIdentity[provider] : 
                        provider.replace("org.mpris.MediaPlayer2.", "")}</MenuItem>
                    })
                  }
                </Menu>,
                e.currentTarget ?? window
              )
            }
          >
          {currentServiceProvider == "" ? "No Media Player Found" : 
            ((currentServiceProviderGlobal in providersToIdentity) ? 
            providersToIdentity[currentServiceProviderGlobal] 
            : currentServiceProviderGlobal.replace("org.mpris.MediaPlayer2.", ""))}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const Title: VFC<{}> = () => {
  return (
    <Focusable style={titleStyles} className={staticClasses.Title}>
        <div style={{ marginRight: 'auto', flex: 0.9 }}>Music Control</div>
    </Focusable>
  );
}

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <Title/>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaMusic />,
    onDismount() {
      clearInterval(periodicHook!);
      periodicHook = null;
      clearTimeout(seekTimeout!);
      seekTimeout = null;
      clearTimeout(volumeTimeout!);
      volumeTimeout = null;
    },
  };
});
