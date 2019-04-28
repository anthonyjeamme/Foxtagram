import {
	GET_ME_REQUEST, GET_ME_SUCCEEDED, GET_ME_FAILED,
	POST_ACCOUNT_REQUEST, POST_ACCOUNT_SUCCEEDED, POST_ACCOUNT_FAILED,
	DELETE_ACCOUNT_SUCCEEDED,
	PATCH_ACCOUNT_RUN_SUCCEEDED,
	POST_ACCOUNT_SPY_SUCCEEDED,
	DELETE_ACCOUNT_SPY_SUCCEEDED
} from '../actions/me.js';

import { initState, $ } from './me.initstate';

const reducer = ( state=initState, action ) => {

	switch( action.type ) {

		case GET_ME_REQUEST:
		return $(Object.assign({},state,{
			isFetching: true
		}));

		case GET_ME_SUCCEEDED:
		return $(Object.assign({},state,{
			isFetching: false,
			isLoaded: true,
		}, action.data.me));

		case GET_ME_FAILED:
		return $(Object.assign({},state,{
			isFetching: false
		}));

		case POST_ACCOUNT_REQUEST:

		return $(Object.assign({},state,{
			isFetching: true
		}));

		case POST_ACCOUNT_SUCCEEDED:
		return $(Object.assign({},state,{
			isFetching: false,
			accounts:[
				...state.accounts,
				action.data.account
			]
		}));

		case POST_ACCOUNT_FAILED:
		return $(Object.assign({},state,{
			isFetching: false
		}));

		case DELETE_ACCOUNT_SUCCEEDED:
		return $(Object.assign({},state,{
			accounts: state.accounts.filter( account => account.id != action.data.accountid )
		}));

		case PATCH_ACCOUNT_RUN_SUCCEEDED:
		return $(Object.assign({},state,{
			accounts: state.accounts.map( account => account.id === action.data.accountid ? (
				Object.assign({},account,{
					run: action.data.run
				})
			) : account)
		}));

		case POST_ACCOUNT_SPY_SUCCEEDED:
		return $(Object.assign({},state,{
			accounts: state.accounts.map( account => account.id === action.data.accountid ? (
				Object.assign({},account,{
					spys: [ ...account.spys, action.data.spy ]
				})
			) : account)
		}));

		case DELETE_ACCOUNT_SPY_SUCCEEDED:
		return $(Object.assign({},state,{
			accounts: state.accounts.map( account => account.id === action.data.accountid ? (
				Object.assign({},account,{
					spys: account.spys.filter( spy => spy.name !== action.data.spyname )
				})
			) : account)
		}));


		default:
		return state;
	}
}

export default reducer;