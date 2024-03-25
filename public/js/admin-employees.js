const createEmployee = async (event) => {   
    // create object from input values 
    let newEmployeeObject = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newEmployeeObject).forEach(key => {
        if (newEmployeeObject[key] === "") {
            newEmployeeObject[key] = null;
        }
    });

    // validate non-nulls in model
    if (newEmployeeObject.first_name && newEmployeeObject.last_name) {

        const response = await fetch(`/admin/employees/create/`, {
            method: 'POST',
            body: JSON.stringify(newEmployeeObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/employees`
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

const updateEmployee = async (event) => {   
    // create object from input values 
    let newEmployeeObject = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newEmployeeObject).forEach(key => {
        if (newEmployeeObject[key] === "") {
            newEmployeeObject[key] = null;
        }
    });

    // validate non-nulls in model
    if (newEmployeeObject.first_name && newEmployeeObject.last_name) {
        
        // get id from url
        urls = document.location.pathname.split('/')
        const ID = urls[urls.length - 1]

        // put call 
        const response = await fetch(`/admin/employees/edit/${ID}`, {
            method: 'PUT',
            body: JSON.stringify(newEmployeeObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/employees`
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

const deleteEmployee = async (event) => {
    urls = document.location.pathname.split('/')
    const ID = urls[urls.length - 1]
    const response = await fetch(`/admin/employees/edit/${ID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        window.location.href = `/admin/employees`
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody);
        if (responseBody.message.name === "SequelizeForeignKeyConstraintError") {
            alert(`Please reassign customers before deleting the employee.`);
        }
    }
}   