/*
 * Don't want to get fucking headache with not working existant libs (weird errors).
 */
class URL {

    constructor(url) {

        this.url = encodeURI(url);

        let main_cut = url.split('?');

        this.domains = main_cut[0]
        this.params = main_cut[1].split('&').map(e => {

            let s = e.split('=')

            return {
                key: s[0],
                value: s[1]
            }
        })
    }

    getParam(paramName) {

        return this.params.filter(e => e.key === paramName)[0].value

    }
};

export const getURLParam = ( url, paramName ) =>{
    
    url = encodeURI(url);

    let main_cut = url.split('?');

    let params = main_cut[1].split('&').map(e => {

        let s = e.split('=')

        return {
            key: s[0],
            value: s[1]
        }
    })

    return params.filter(e => e.key === paramName)[0].value
}

export const getURLParams = ( url ) =>{
    
    url = decodeURIComponent(url);

    let main_cut = url.split('?');

    let params = main_cut[1].split('&').map(e => {

        let s = e.split('=')

        return {
            key: s[0],
            value: s[1]
        }
    })

    return params.reduce( 
        ( acc, v ) => {

            acc[ v.key ] = v.value
            return acc;
        }
        ,{}
    )
}
