export const getMillions = (v) => Math.floor(+v / 1e6);
export const getBillions = (v) => +(+v / 1e9).toFixed(3);
export const getBillionsFromMillions = (v) => +v / 1e3;