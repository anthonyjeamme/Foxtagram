import Constants from '../../lib/constants';

// Used to control scanner speed.
export const getNAnalized = ( database ) => {
    return database.getUsers({state:Constants.ANALIZED}).length;
}
// Used to control data volume.
export const getNInit = ( database ) => {
    return database.getUsers({state:Constants.INIT}).length; // TODO Heavy. Find better solution ?
}