import { addLocaleData } from 'react-intl';

import locale_en from 'react-intl/locale-data/en';
import locale_fr from 'react-intl/locale-data/fr';

import translations_en from './en';
import translations_fr from './fr';

export const translations = {
    'en': translations_en,
    'fr': translations_fr
};

addLocaleData( [ ...locale_fr, ...locale_en ] );

export const getLanguage = ( lang=null ) => {

    return "fr"; // Only fr for now

    if( !lang )
        lang = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

    let k = lang.toLowerCase()

    if( Object.keys( translations ).includes( k ) ){

        return translations[k];
    }

    return "en";
}

export const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
// const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];
// const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;
