import { defaultState } from "../context/defaultState";

export const isValidStringValue = (value: unknown) => {
  return value != "" && value != null && typeof value == "string";
};

export const isValidStringValueInRecord = (
  record: Record<string, string>,
  key: string
) => {
  if (!(key in record)) return false;
  const value = record[key];

  return isValidStringValue(value);
};

export const isValidNumber = (value: unknown) => {
  return (
    (typeof value === "number" && isFinite(value)) ||
    (typeof value === "string" && value !== "" && !isNaN(parseFloat(value)))
  );
};

export const isValidNumberInRecord = (
  record: Record<string, string>,
  key: string
) => {
  if (!(key in record)) return false;
  const value = record[key];

  return isValidNumber(value);
};

export const getValidAlbumArtUrlInRecord = (
  record: Record<string, string>,
  key: string
) => {
  if (!(key in record)) return defaultState.currentArtUrl;
  const value = record[key];

  if (
    value == "" ||
    value == null ||
    typeof value != "string" ||
    (typeof value !== "undefined" && value.startsWith("file:///"))
  )
    return defaultState.currentArtUrl;

  return value;
};
