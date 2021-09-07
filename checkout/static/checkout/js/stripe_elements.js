/*
    Core logic/payment flow for this comes from here:
    https://stripe.com/docs/payments/accept-a-payment

    CSS from here:
    https://stripe.com/docs/stripe-js
*/

var stripe_public_key = $('#id_stripe_public_key').text().slice(1, -1);
var client_secret = $('#id_client_secret').text().slice(1, -1);
var stripe = Stripe(stripe_public_key);
var elements = stripe.elements();
var style = {
    base: {
        color: '#000',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#dc3545',
        iconColor: '#dc3545'
    }
};
var card = elements.create('card', {style: style});
card.mount('#card-element');

// Handle realtime validation errors on the card element
card.addEventListener('change', function (event) {
    var errorDiv = document.getElementById('card-errors');
    if (event.error) {
        var html = `
            <span class="icon" role="alert">
                <i class="fas fa-times"></i>
            </span>
            <span>${event.error.message}</span>
        `;
        $(errorDiv).html(html);
    } else {
        errorDiv.textContent = '';
    }
});

// Handle from submit
var form = document.getElementById('payment-form');

var resultContainer = document.getElementById('payment-result');
cardElement.on('change', function(event) {
  if (event.error) {
    resultContainer.textContent = event.error.message;
  } else {
    resultContainer.textContent = '';
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();
  resultContainer.textContent = "";
  stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  }).then(handlePaymentMethodResult);
});

function handlePaymentMethodResult(result) {
  if (result.error) {
    // An error happened when collecting card details, show it in the payment form
    resultContainer.textContent = result.error.message;
  } else {
    // Otherwise send paymentMethod.id to your server (see Step 3)
    fetch('/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_method_id: result.paymentMethod.id })
    }).then(function(result) {
      return result.json();
    }).then(handleServerResponse);
  }
}

function handleServerResponse(responseJson) {
  if (responseJson.error) {
    // An error happened when charging the card, show it in the payment form
    resultContainer.textContent = responseJson.error;
  } else {
    // Show a success message
    resultContainer.textContent = 'Success!';
  }
}