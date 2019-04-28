
export const SECONDS = 1000;
export const MINUTES = 60*SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;

export const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}