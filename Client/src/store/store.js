import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import me_reducer from './reducers/me';
import app_reducer from './reducers/app';

import me_saga from './sagas/me';

const sagaMiddleware = createSagaMiddleware();

export default createStore(
    combineReducers({
        app: app_reducer,
        me: me_reducer
    }),
    applyMiddleware(
        sagaMiddleware
    )
);

sagaMiddleware.run(me_saga);
