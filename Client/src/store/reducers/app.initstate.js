import { getLanguage } from '../../translations/translations';

const ls_id = "app_state";

export const initState = localStorage.getItem(ls_id)?
    JSON.parse(localStorage.getItem(ls_id)):
    {
        language: getLanguage()
    }

export const $ = state => {

    localStorage.setItem(ls_id, JSON.stringify(state))

    return state;
}
