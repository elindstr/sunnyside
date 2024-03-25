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

const generateInvoice = async (event) => {
    const customer_id = document.getElementById("customer_id").value
    const date = get_today()
    const start_date = "2000-01-01"
    const end_date = document.getElementById("end_date").value

    console.log()
    const response = await fetch(`/admin/invoices/generate/`, {
        method: 'POST',
        body: JSON.stringify({customer_id, date, start_date, end_date}),
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        window.location.href = `/admin/invoices`
    }
    else {
        response.json().then(data => {
            console.log(data.message)


            if (data.message.name == "SequelizeDatabaseError" || data.message.name == "SequelizeForeignKeyConstraintError") {
                alert("Couldn't locate that database record.")
            }
            else if (data.message == 'no data') {
                alert('No invoice data in those parameters')
            }
            else {            
                alert("An error occurred. Check console.");
            }
        })
    }
}
