import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './components/App.jsx';
import registerServiceWorker from './registerServiceWorker';

import store from './store/store';

import { CardElement, injectStripe, Elements, StripeProvider } from 'react-stripe-elements';

ReactDOM.render(
    <Provider store={store}>
        <StripeProvider apiKey="pk_test_LwL4RUtinpP3PXzYirX2jNfR">
            <Elements>
                <App />
            </Elements>
        </StripeProvider>
	</Provider>, document.getElementById('root')
);
registerServiceWorker();
