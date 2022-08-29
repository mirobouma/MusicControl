import {
  ButtonItem,
  Menu,
  MenuItem,
  showContextMenu,
} from "decky-frontend-lib";

import { VFC } from "react";
import {
  AppActions,
  ProviderIdentity,
  useStateContext,
} from "../context/context";
import * as python from "./../python";

type MediaProviderProps = {
  currentProvider: string;
};
export const MediaProviderButton: VFC<MediaProviderProps> = (
  props: MediaProviderProps
) => {
  const { state, dispatch } = useStateContext();

  const getDisplayNameForProvider = (provider: string) => {
    const providerIndex = state.providersToIdentity.findIndex(
      (mapping: ProviderIdentity) => mapping.provider == provider
    );

    if (providerIndex < 0)
      return provider.replace("org.mpris.MediaPlayer2.", "");

    return state.providersToIdentity[providerIndex].name;
  };

  const handleOnClick = (e: MouseEvent) =>
    showContextMenu(
      <Menu label="Select Media Player" cancelText="Cancel">
        {state.providers.map((provider: string) => {
          return (
            <MenuItem
              onSelected={() => {
                python.setMediaPlayer(provider);
                dispatch({
                  type: AppActions.SetCurrentServiceProvider,
                  value: provider,
                });
              }}
            >
              {getDisplayNameForProvider(provider)}
            </MenuItem>
          );
        })}
      </Menu>,
      e.currentTarget ?? window
    );

  return (
    <ButtonItem layout="below" bottomSeparator={false} onClick={handleOnClick}>
      {props.currentProvider == ""
        ? "No Media Player Found"
        : getDisplayNameForProvider(props.currentProvider)}
    </ButtonItem>
  );
};
