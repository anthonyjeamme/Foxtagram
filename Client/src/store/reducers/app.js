import {
	CHANGE_LANGUAGE
} from '../actions/app.js';

import { initState, $ } from './app.initstate';

const reducer = ( state=initState, action ) => {

	switch( action.type ) {

		case CHANGE_LANGUAGE:
		return $(Object.assign({},state,{
			language: action.language
		}))

		default:
		return state;
	}
}

export default reducer;