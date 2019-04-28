/*
 * Handle app data manipulation (profile images, config files and so on).
 */

// TODO file/folder const list exported.

import { getAppUserFolder } from './misc';

var request = require('request');
var fs = require('fs');

export const PROFILE_IMG_FOLDER = `${getAppUserFolder()}/data/profile_images`;

export const saveProfileImg = ( uri, username ) => {

    request( uri )
        .pipe( fs.createWriteStream( `${PROFILE_IMG_FOLDER}/${username}.jpg` ) );
};
