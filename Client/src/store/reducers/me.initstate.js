const ls_id = "me_state";

export const initState = localStorage.getItem(ls_id)?
    Object.assign({},JSON.parse(localStorage.getItem(ls_id)),{
        isLoaded: false,
        isFetching: false,
    }):{

    isLoaded: false,
    isFetching: false,
    credit:0,
    accounts:[]
}

export const $ = state => {

    localStorage.setItem(ls_id, JSON.stringify(state))
    return state;
}