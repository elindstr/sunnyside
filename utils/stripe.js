const { Customer, Invoice } = require('../models');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_TEST_KEY)

async function createStripeCustomer(email, name) {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
}

async function createInvoice(customerId, amountInCents, description) {
    // Create blank invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true, // Automatically finalize and move the invoice from draft to open
      collection_method: 'send_invoice', // to manually send invoice
      days_until_due: 0
    });
    
    // Add invoice item to invoice
    await stripe.invoiceItems.create({
        customer: customerId,
        amount: amountInCents,
        currency: 'usd',
        description,
        invoice: invoice.id
    });

    // Finalize the invoice after adding items
    await stripe.invoices.finalizeInvoice(invoice.id);

    return invoice;
}

async function sendInvoice(invoiceId) {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    return invoice.hosted_invoice_url
}


// getPaymentUrl
async function getPaymentUrl(newInvoiceObject, customerData, invoice_id) {
  const name = `${customerData.first_name} ${customerData.last_name}`;
  const email = customerData.email;
  const amountInCents = newInvoiceObject.amount * 100;
  const description = `For services through ${newInvoiceObject.end_date}`;

  // Get or create stripe customer id
  let stripeCustomerId;
  let customer = await Customer.findByPk(newInvoiceObject.customer_id, {
    attributes: ['stripe_customer_id'],
  });

  if (customer && customer.stripe_customer_id) {
    stripeCustomerId = customer.stripe_customer_id;
  } else {
    const stripeCustomer = await createStripeCustomer(email, name);
    stripeCustomerId = stripeCustomer.id;
    await Customer.update(
      { stripe_customer_id: stripeCustomerId },
      { where: { id: newInvoiceObject.customer_id } }
    );
  }

  // Create Stripe invoice and get payment URL
  const invoice = await createInvoice(stripeCustomerId, amountInCents, description);
  const paymentUrl = await sendInvoice(invoice.id);

  // Update your invoice table with Stripe details
  await Invoice.update(
    {
      stripe_invoice_id: invoice.id,
      stripe_payment_url: paymentUrl
    },
    { where: { id: invoice_id } }
  );

  // Return the payment URL
  return paymentUrl;
}

module.exports = { getPaymentUrl };
