
/**
 * Two-dimensional Gaussian function
 *
 * @param {number} amplitude
 * @param {number} x0
 * @param {number} y0
 * @param {number} sigmaX
 * @param {number} sigmaY
 * @returns {Function}
 */
function makeGaussian( x0, y0, sigmaX, sigmaY) {
    return function( x0, y0, sigmaX, sigmaY, x, y) {
        var exponent = -(
                ( Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)))
                + ( Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2)))
            );
        return Math.pow(Math.E, exponent);
    }.bind(null,  x0, y0, sigmaX, sigmaY);
}

// Compute score from gaussian function.
// Gaussian curve params come from the model variable.
export const compute = ( model, user ) => {

    let gaussian = makeGaussian(  model.x0, model.y0, model.sigmaX, model.sigmaY );
    let result = gaussian( user.n_followers,user.n_following );
    return result;
}

export default{
    compute
}