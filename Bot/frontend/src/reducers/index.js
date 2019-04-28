import { LOGGED } from '../actions/';

import initState from './initState'

const reducer = ( state=initState, action ) => {

    switch( action.type ) {

        case LOGGED: 
            return Object.assign({}, state, { logged:true, server:action.server });

        default:
        return state;
    }
}

export default reducer;