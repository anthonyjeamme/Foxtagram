export const GET_ME_REQUEST = "GET_ME_REQUEST";
export const GET_ME_SUCCEEDED = "GET_ME_SUCCEEDED";
export const GET_ME_FAILED = "GET_ME_FAILED";

export const GetMeRequest = () => ({
    type: GET_ME_REQUEST
});
export const GetMeSucceded = (data) => ({
    type: GET_ME_SUCCEEDED,
    data
});
export const GetMeFailed = (error = null) => ({
    type: GET_ME_FAILED,
    error
});

export const POST_ACCOUNT_REQUEST = "POST_ACCOUNT_REQUEST";
export const POST_ACCOUNT_SUCCEEDED = "POST_ACCOUNT_SUCCEEDED";
export const POST_ACCOUNT_FAILED = "POST_ACCOUNT_FAILED";

export const PostAccountRequest = ( data ) => ({
    type: POST_ACCOUNT_REQUEST,
    data
});
export const PostAccountSucceded = (data) => ({
    type: POST_ACCOUNT_SUCCEEDED,
    data
});
export const PostAccountFailed = (error = null) => ({
    type: POST_ACCOUNT_FAILED,
    error
});

export const DELETE_ACCOUNT_REQUEST = "DELETE_ACCOUNT_REQUEST";
export const DELETE_ACCOUNT_SUCCEEDED = "DELETE_ACCOUNT_SUCCEEDED";
export const DELETE_ACCOUNT_FAILED = "DELETE_ACCOUNT_FAILED";

export const DeleteAccountRequest = ( data ) => ({
    type: DELETE_ACCOUNT_REQUEST,
    data
});
export const DeleteAccountSucceded = ( data ) => ({
    type: DELETE_ACCOUNT_SUCCEEDED,
    data
});
export const DeleteAccountFailed = (error = null) => ({
    type: DELETE_ACCOUNT_FAILED,
    error
});

export const POST_ACCOUNT_SPY_REQUEST = "POST_ACCOUNT_SPY_REQUEST";
export const POST_ACCOUNT_SPY_SUCCEEDED = "POST_ACCOUNT_SPY_SUCCEEDED";
export const POST_ACCOUNT_SPY_FAILED = "POST_ACCOUNT_SPY_FAILED";

export const PostAccountSpyRequest = (data) => ({
    type: POST_ACCOUNT_SPY_REQUEST,
    data
});
export const PostAccountSpySucceded = (data) => ({
    type: POST_ACCOUNT_SPY_SUCCEEDED,
    data
});
export const PostAccountSpyFailed = (error = null) => ({
    type: POST_ACCOUNT_SPY_FAILED,
    error
});

export const DELETE_ACCOUNT_SPY_REQUEST = "DELETE_ACCOUNT_SPY_REQUEST";
export const DELETE_ACCOUNT_SPY_SUCCEEDED = "DELETE_ACCOUNT_SPY_SUCCEEDED";
export const DELETE_ACCOUNT_SPY_FAILED = "DELETE_ACCOUNT_SPY_FAILED";

export const DeleteAccountSpyRequest = (data) => ({
    type: DELETE_ACCOUNT_SPY_REQUEST,
    data
});
export const DeleteAccountSpySucceded = (data) => ({
    type: DELETE_ACCOUNT_SPY_SUCCEEDED,
    data
});
export const DeleteAccountSpyFailed = (error = null) => ({
    type: DELETE_ACCOUNT_SPY_FAILED,
    error
});

export const PATCH_ACCOUNT_RUN_REQUEST = "PATCH_ACCOUNT_RUN_REQUEST";
export const PATCH_ACCOUNT_RUN_SUCCEEDED = "PATCH_ACCOUNT_RUN_SUCCEEDED";
export const PATCH_ACCOUNT_RUN_FAILED = "PATCH_ACCOUNT_RUN_FAILED";

export const PatchAccountRunRequest = ( data ) => ({
    type: PATCH_ACCOUNT_RUN_REQUEST,
    data
});
export const PatchAccountRunSucceded = ( data ) => ({
    type: PATCH_ACCOUNT_RUN_SUCCEEDED,
    data
});
export const PatchAccountRunFailed = (error = null) => ({
    type: PATCH_ACCOUNT_RUN_FAILED,
    error
});
