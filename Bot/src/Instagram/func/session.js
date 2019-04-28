import Nightmare from 'nightmare';

import { ExceptionInstagramLoginFailed, ExceptionInstagramLoginSuspect } from '../Exceptions';

import { getSelector } from '../utils/Selectors';
import SELECTORS from '../utils/Selectors';

import { timeout } from '../../lib/misc';

export default ( nightmare, logger ) => ({

    login: async( {login, password} )=>{
 
        let {
            loginField, passwordField, submitButton
        } = await getSelector(SELECTORS.CATEGORIES.LOGIN, logger);

        logger.info(`Login as ${login}`);

        // TODO if error here ? write log
        await nightmare
            .goto( 'https://www.instagram.com/accounts/login/' )
            .wait( loginField );

        let emptyFields = await nightmare
            .evaluate( $ =>
                document.querySelector( $ ).value==""
            , loginField);

        if( !emptyFields ) await nightmare.refresh();

        let result = await nightmare
            .wait( submitButton )
            .wait( 1000 ) // TODO see if it avoids errors
            .type( loginField, login )
            .type( passwordField, password )
            .click( submitButton )
            .wait(() => (
                document.querySelector('.coreSpriteDesktopNavProfile') != null ||
                document.querySelector('a._pzcwu._rqivq') != null ||
                document.querySelector('#slfErrorAlert') != null ||
                document.querySelector('._3574j._8kbw5') != null
            ))
            .evaluate(() => ({
                mainPage: document.querySelector('.coreSpriteDesktopNavProfile')!==null,
                dlAppPage: document.querySelector('a._pzcwu._rqivq') != null,
                error: document.querySelector('#slfErrorAlert') != null,
                suspect: document.querySelector('._3574j._8kbw5') != null
            }))

        if( result.suspect ) throw new ExceptionInstagramLoginSuspect();
        if (result.error) throw new ExceptionInstagramLoginFailed();
        if (result.mainPage) return true;
        if (result.dlAppPage) {
            await nightmare.click('a._pzcwu._rqivq').wait('.coreSpriteDesktopNavProfile');
            // TODO if error ?
            return true;
        }

        // Unhandled error.
        throw ExceptionInstagram();
        return false;

    },
    loginSuspect: async( {login, password} )=>{
        
        let {
            loginField, passwordField, submitButton
        } = await getSelector(SELECTORS.CATEGORIES.LOGIN, logger);
    
        logger.info(`login as ${login}`);
    
        // TODO if error here ? write log
        let result = await nightmare
            .goto('https://www.instagram.com/accounts/login/')
            .refresh() // Ok fucking solution, to empty fields on reconnection but no better solution for the moment.
            .wait(submitButton)
            .wait(1000) // TODO see if it avoids errors
            .type(loginField, login)
            .type(passwordField, password)
            .click(submitButton)
        
        let finished = null ;
        
        while( !finished ){
            finished = await nightmare
                .evaluate(()=>document.querySelector('nav._68u16._gft4l')!=null)
            
                await timeout(500);
        }
        
        return true;

    },
})