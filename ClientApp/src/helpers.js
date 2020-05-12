export const getMillions = (v) => Math.floor(+v / 1e6);
export const getBillions = (v) => (+v / 1e9).toFixed(2);
export const getBillionsFromMillions = (v) => +v / 1e3;

export const getDateStringFromUnixTime = (unitTime) => new Date(+unitTime * 1000).toISOString().substring(0, 10);