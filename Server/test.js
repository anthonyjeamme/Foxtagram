var stripe = require("stripe")("sk_test_AjeoYnSJDCxNY7JPmd6LBkp3");

const App = async () => {
    
    const customer = await stripe.customers.create({
      email: 'jenny.rosen@example.com',
      source: "card_1CnT7zHgsMRlo4MtBzKe38xt"
    });

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{plan: 'plan_DDqSi8NNdFEbrR'}],
    });
    
    console.log(subscription)
}

App();
