const createCustomer = async (event) => {   
    // create object from input values 
    let newCustomerObject = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        product_id: document.getElementById('product').value,
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

                if (data.errors[0].type === "Validation error") {
                    alert(`Malformed data in ${data.errors[0].path}`);

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

document.getElementById('submit').addEventListener('click', createCustomer);