const createCustomer = async (event) => {   
    // create object from input values 
    let newCustomerObject = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        product_id: document.getElementById('product').value,
        schedule: document.getElementById('schedule').value,
        employee_id: document.getElementById('cleaner').value
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newCustomerObject).forEach(key => {
        if (newCustomerObject[key] === "") {
            newCustomerObject[key] = null;
        }
    });

    // validate first_name & last_name (non-nulls in model)
    if (newCustomerObject.first_name && newCustomerObject.last_name) {

        const response = await fetch(`/admin/customers/create/`, {
            method: 'POST',
            body: JSON.stringify(newCustomerObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/customers`
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
    }
    else {
        alert('first name and last name are required')
    }
};

const updateCustomer = async (event) => {   
    console.log("here")
    // create object from input values 
    let newCustomerObject = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        product_id: document.getElementById('product').value,
        schedule: document.getElementById('schedule').value,
        employee_id: document.getElementById('cleaner').value
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newCustomerObject).forEach(key => {
        if (newCustomerObject[key] === "") {
            newCustomerObject[key] = null;
        }
    });

    // validate first_name & last_name (non-nulls in model)
    if (newCustomerObject.first_name && newCustomerObject.last_name) {
        
        // get customer id from url
        urls = document.location.pathname.split('/')
        const ID = urls[urls.length - 1]

        // put call 
        const response = await fetch(`/admin/customers/edit/${ID}`, {
            method: 'PUT',
            body: JSON.stringify(newCustomerObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/customers`
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
    }
    else {
        alert('first name and last name are required')
    }
};

const deleteCustomer = async (event) => {
    urls = document.location.pathname.split('/')
    const ID = urls[urls.length - 1]
    const response = await fetch(`/admin/customers/edit/${ID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        window.location.href = `/admin/customers`
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody);
    }
}   
