import { readConfigFile, timeout } from '../lib/misc'
var Config = readConfigFile();

require('babel-polyfill');

export const SECONDS = 1000;
export const MINUTES = 60*SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;

var stats = {
    last_sequence_count: 0
}

var param = { // Values taken from https://elfsight.com/blog/2016/12/instagram-restrictions-limits-likes-followers-comments/
    min_action_time: 28*SECONDS,
    rand_action_time: 8*SECONDS,
    sequence_delay: 5*MINUTES,
    nb_sequence_actions: 30
}
var param_new_account = { // Values taken from https://elfsight.com/blog/2016/12/instagram-restrictions-limits-likes-followers-comments/
    min_action_time: 36*SECONDS,
    rand_action_time: 12*SECONDS,
    sequence_delay: 5*MINUTES,
    nb_sequence_actions: 30
}

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

// Periods
// Format : hh:mm
var periods = Config.follower.periods.map(e => {

    let from_split = e.from.split(':');
    let to_split = e.to.split(':');

    return {
        from: parseInt(from_split[0]) * 60 + parseInt(from_split[1]),
        to: parseInt(to_split[0]) * 60 + parseInt(to_split[1])
    }
});

const loadPeriods = () =>{
    Config = readConfigFile();

    periods = Config.follower.periods.map(e => {

        let from_split = e.from.split(':');
        let to_split = e.to.split(':');
    
        return {
            from: parseInt(from_split[0]) * 60 + parseInt(from_split[1]),
            to: parseInt(to_split[0]) * 60 + parseInt(to_split[1])
        }
    });
}

const in_periods = (date = new Date()) => {

    let now = date.getHours() * 60 + date.getMinutes();

    return periods.filter(e => (now >= e.from) && (now < e.to)).length > 0;
}

const next_period = (date = new Date()) => {

    if (in_periods(date)) return 0;

    let now = date.getHours() * 60 + date.getMinutes();

    let min = periods.map(e => e.from - now).filter(e => e > 0).min() + 2; // +2 to avoid exact time problems.

    // Calculate time to tomorrow.
    if( min === Infinity ){

        let time_to_midnight = 24*60 - now;
        let first_day_period = periods[0].from;
        min = time_to_midnight + first_day_period
    }

    return min * 60 * 1000;
}

export const smartwait = (date = new Date()) => {

    loadPeriods();

    Config = readConfigFile();
    let recent_account = Config.accounts.main.creation_dt + 20*DAYS > Date.now();

    let delai = next_period(date);

    let {
        min_action_time,
        rand_action_time,
        sequence_delay,
        nb_sequence_actions
    } = recent_account?param_new_account:param;


    if (delai === 0) {

        // Each 30 actions, wait 5 minutes.
        if (stats.last_sequence_count > param.nb_sequence_actions) {
            stats.last_sequence_count = 0;
            return param.sequence_delay;
        }

        stats.last_sequence_count++;

        return Math.floor(Math.random() * param.rand_action_time + param.min_action_time);
    } else {
        return delai;
    }
}

export const smartwaiting = async ( logger ) => {

    let delay = smartwait();
    if( logger )// && delay > 2*MINUTES )
        logger.debug(`Waiting ${beautifulDelay(delay)}`);
    await timeout(delay);
}

// Used to calibrate params
// Test function
const simulation = () => {

    let instagram_limit_per_day = 1000; // real : 1000
    let instagram_limit_per_hours = 200; // real : 200.

    let time_ms = 0;
    let delay;
    let actions_count = 0;

    let daily_block_actions = 0;
    let hour_block_actions = 0;

    let action_history = [];

    let fake_date = new Date();
    fake_date.setHours(1, 0, 0, 0);
    let fake_dt = fake_date.getTime(); // in ms

    while (time_ms < 24 * 60 * 60 * 1000) {

        // TODO check instagram security

        delay = smartwait(new Date(fake_dt + time_ms));
        time_ms += delay;

        if (actions_count < instagram_limit_per_day) {

            if (
                action_history.length < instagram_limit_per_hours + 1
                || (action_history[instagram_limit_per_hours].dt.getTime() + 1000 * 60 * 60) < fake_dt + time_ms
            ) { //&& 

                action_history.unshift({
                    dt: new Date(fake_dt + time_ms)
                });
                actions_count++;
            } else {
                hour_block_actions++;
            }
        } else
            daily_block_actions++;
    }

    console.log(`${actions_count} actions done`);
    console.log(`${daily_block_actions} actions blocked (daily)`);
    console.log(`${hour_block_actions} actions blocked (hour)`);
}

export const beautifulDelay = ( delay_ms ) => {

    let delay_sec = delay_ms/1000;

    if( delay_sec<60 )
        return `${delay_sec} s`;

    let delay_min = delay_sec/60;

    if( delay_min<60 )
        return `${Math.round(delay_min)} min`;

    let delay_h = Math.round(delay_min/60);

    return `${delay_h} h`;
}