const get_today = () => {
    const now = new Date();
    const losAngelesDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return format_date(losAngelesDate);
}
  
const format_date = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const savePayment = async (event) => {   
    // create object from input values 
    let newPaymentObject = {
        date: get_today(),
        customer_id: document.getElementById('customer_id').value,
        amount: document.getElementById('amount').value,
    }

    // validate amount is float
    let newFloat = newPaymentObject.amount
    newFloat = newFloat.replace(/,|\$/g, '');
    newFloat = parseFloat(newFloat);
    if (isNaN(newFloat)) {
        return alert("Rate must be a number.")
    }
    newPaymentObject.rate = newFloat 

    // fetch
    const response = await fetch(`/admin/payments/create/`, {
        method: 'POST',
        body: JSON.stringify(newPaymentObject),
        headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
        window.location.href = `/dashboard/`
    }
    else {
        response.json().then(data => {
            console.log(data)

            if (data.message.errors[0].type === "Validation error") {
                alert(`Malformed data in ${data.message.errors[0].path}`);

            } else {
                alert("An error occurred. Please try again.");
            }
        })
    }
};