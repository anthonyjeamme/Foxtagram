// Exceptions
export function ExceptionInstagramAccount404(username) {
    this.message = `${username} doesn't exists.`;
    this.name = 'ExceptionInstagramAccount404';
};

export function ExceptionInstagramPost404(postID) {
    this.message = `${postID} doesn't exists.`;
    this.name = 'ExceptionInstagramPost404';
}

export function ExceptionInstagramNoInternet() {
    this.message = 'No internet connexion.'
    this.name = 'ExceptionInstagramNoInternet';
};

export function ExceptionInstagramNotLoggedIn() {
    this.message = 'Not logged in.';
    this.name = 'ExceptionInstagramNotLoggedIn';
}

export function ExceptionInstagramAlreadyFollowed() {
    this.message = 'Already followed';
    this.name = 'ExceptionInstagramAlreadyFollowed';
}

export function ExceptionInstagramLikesLinkNotFound(postID) {
    this.message = `Likes link not found on ${postID}`;
    this.name = 'ExceptionInstagramLikesLinkNotFound';
}
export function ExceptionInstagramNotFollowed(username) {
    this.message = `${username} not followed`;
    this.name = 'ExceptionInstagramNotFollowed';
}

export function ExceptionInstagramAlreadyAskFollow() {
    this.message = 'Already ask to follow.';
    this.name = 'ExceptionInstagramAlreadyAskFollow';
}

export function ExceptionInstagramLoginFailed() {
    this.message = "Bad login";
    this.name = 'ExceptionInstagramLoginFailed';
}

export function ExceptionInstagramLoginSuspect() {
    this.message = "Suspect account";
    this.name = 'ExceptionInstagramLoginSuspect';
}

export function ExceptionInstagram() {
    this.message = "unknown error";
    this.name = "ExceptionInstagram";
}

export function ExceptionFollowBlocked() {
    this.message = "Follow actions blocked.";
    this.name = "ExceptionFollowBlocked";
}

export function ExceptionUnfollowBlocked() {
    this.message = "Unollow actions blocked.";
    this.name = "ExceptionUnfollowBlocked";
}

export function ExceptionPostAlreadyLiked( postID ) {
    this.message = `Post ${postID} already liked.`;
    this.name = "ExceptionPostAlreadyLiked";
}

export function ExceptionLikedBlocked( postID ) {
    this.message = `Like blocked on ${postID}post.`;
    this.name = "ExceptionLikedBlocked";
}