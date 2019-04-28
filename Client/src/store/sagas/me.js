import { put, takeEvery } from 'redux-saga/effects';

import {
	GET_ME_REQUEST, GetMeSucceded, GetMeFailed,
	POST_ACCOUNT_REQUEST, PostAccountSucceded, PostAccountFailed,
	DELETE_ACCOUNT_REQUEST, DeleteAccountSucceded, DeleteAccountFailed,
	POST_ACCOUNT_SPY_REQUEST, PostAccountSpySucceded, PostAccountSpyFailed,
	DELETE_ACCOUNT_SPY_REQUEST, DeleteAccountSpySucceded, DeleteAccountSpyFailed,
	PATCH_ACCOUNT_RUN_REQUEST, PatchAccountRunSucceded, PatchAccountRunFailed
} from '../actions/me';

import Api from '../api/api';

Api.GetMe().then(d=>{console.log(d)})

function* fetchGetMe(action) {

	const response = yield Api.GetMe();

	if( response.success ){
		yield put( GetMeSucceded({ me: response.data.me }) );
	} else {
		yield put( GetMeFailed({ error: response.error }) );
	}
}

function* fetchPostAccount(action) {

	let { data } = action;

	const response = yield Api.PostAccount( data );

	if( response.success ){
		yield put( PostAccountSucceded( response.data ) );
	} else {
		yield put( PostAccountFailed({ error: response.error }) );
	}
}

function* fetchDeleteAccount(action) {

	const response = yield Api.DeleteAccount( action.data.accountid );
	if( response.success ){
		yield put( DeleteAccountSucceded( { accountid: action.data.accountid } ) );
	} else {
		yield put( DeleteAccountFailed({ error: response.error }) );
	}
}

function* fetchPostAccountSpy(action) {

	let { accountid, spy } = action.data;

	const response = yield Api.PostAccountSpy( accountid, {name:spy} );
	if( response.success ){
		yield put( PostAccountSpySucceded({ accountid, spy: response.data.spy }) );
	} else {
		yield put( PostAccountSpyFailed({ error: response.error }) );
	}
}

function* fetchDeleteAccountSpy(action) {

	let { accountid, spyname } = action.data;

	const response = yield Api.DeleteAccountSpy( accountid, spyname );
	if( response.success ){
		yield put( DeleteAccountSpySucceded({ accountid, spyname }) );
	} else {
		yield put( DeleteAccountSpyFailed({ accountid, error: response.error }) );
	}
}

function* fetchPatchAccountRun(action) {

	let { accountid, value } = action.data;

	const response = yield Api.PatchAccountRun( accountid, {value} );
	if( response.success ){
		yield put( PatchAccountRunSucceded({ run: value, accountid }) );
	} else {
		yield put( PatchAccountRunFailed({ accountid, error: response.error }) );
	}
}

function* me_sagas() {

	yield takeEvery( GET_ME_REQUEST, fetchGetMe );
	yield takeEvery( POST_ACCOUNT_REQUEST, fetchPostAccount );
	yield takeEvery( DELETE_ACCOUNT_REQUEST, fetchDeleteAccount );
	yield takeEvery( POST_ACCOUNT_SPY_REQUEST, fetchPostAccountSpy );
	yield takeEvery( DELETE_ACCOUNT_SPY_REQUEST, fetchDeleteAccountSpy );
	yield takeEvery( PATCH_ACCOUNT_RUN_REQUEST, fetchPatchAccountRun );

}

export default me_sagas;