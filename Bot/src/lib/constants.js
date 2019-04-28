export default {
    UNKNOWN:-2,
    ERROR:-1,
    INIT:0, // Waiting to be analysed.
    ANALIZED:6, // Analyse ok, score computed, can be followed
    ASK_FOLLOW:2,
    FOLLOWED:3,
    UNFOLLOWED:4,
    IGNORED:5,
}