/* eslint-disable @typescript-eslint/no-explicit-any */
const PREFIX = "MBTB_";

export const localStorageGet = (key: string) => {
	if (!key) return;
	return localStorage.getItem(PREFIX + key);
};

export const localStorageGetBool = (key: string) => {
	if (!key) return;
	return localStorageGet(key) === "true";
};

export const localStorageGetArray = (key: string) => {
	if (!key) return;
	const data = localStorageGet(key);
	if (!data) return;
	return data.split(",");
};

export const localStorageSet = (key: string, val: string) => {
	if (!key) return;
	return localStorage.setItem(PREFIX + key, val);
};

export const localStorageSetBool = (key: string, val: boolean) => {
	if (!key) return;
	return localStorageSet(key, String(val));
};

export const localStorageSetArray = (key: string, arr: any[]) => {
	if (!key) return;
	return localStorageSet(key, arr.join(","));
};

export const localStorageRemove = (key: string) => {
	if (!key) return;
	return localStorage.removeItem(PREFIX + key);
};
