const createUser = async (event) => { 
    // create object from input values 
    let newUserObject = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        access_level: document.getElementById('access_level').value,
        customer_id: document.getElementById('customer_id').value,
        employee_id: document.getElementById('employee_id').value,
    }

    // null out hidden user type drop down field 
    if (newUserObject.access_level == "customer") { 
        newUserObject.employee_id = ""
    }
    else {
        newUserObject.customer_id = ""
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newUserObject).forEach(key => {
        if (newUserObject[key] === "") {
            newUserObject[key] = null;
        }
    });

    // validate non-nulls in model
    if (newUserObject.username && newUserObject.password && newUserObject.access_level) { 

        //check password length
        if (newUserObject.password.length < 8) {
            return alert("password must be at least 8 characters")
        }
        
        // proceed
        const response = await fetch(`/admin/users/create/`, {
            method: 'POST',
            body: JSON.stringify(newUserObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/users`;
            return;
        }

        const data = await response.json();
        
        // Specific error messages
        if (data.message === 'username already exists') {
            alert(data.message)
        } 
        else if (data.message === 'user already has an account') {
            alert(data.message)
        }
        else {
            alert("An error occurred. Please check field entries and try again.");
        }
    }
    else {
        alert('username, password, and type are required')
    }
};

const updateUser = async (event) => {   
    // create object from input values 
    let newUserObject = {
        username: document.getElementById('username').value,
        access_level: document.getElementById('access_level').value,
        customer_id: document.getElementById('customer_id').value,
        employee_id: document.getElementById('employee_id').value,
    }

    // null out hidden user type drop down field 
    if (newUserObject.access_level == "customer") { 
        newUserObject.employee_id = ""
    }
    else {
        newUserObject.customer_id = ""
    }

    // if password was reset, include it in the newUserObject
    if (document.getElementById('password').value) {
        newUserObject.password = document.getElementById('password').value
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newUserObject).forEach(key => {
        if (newUserObject[key] === "") {
            newUserObject[key] = null;
        }
    });

    // validate non-nulls in model
    if (newUserObject.username) {

        // get id from url
        urls = document.location.pathname.split('/')
        const ID = urls[urls.length - 1]

        // put call 
        const response = await fetch(`/admin/users/edit/${ID}`, {
            method: 'PUT',
            body: JSON.stringify(newUserObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/users`
        }
        else {
            response.json().then(data => {
                console.log(data)
                if (data.message) {
                    alert(data.message)
                } else {
                    alert("An error occurred. Please try again.");
                }
            })
        }
    }
    else {
        alert('username, password, and type are required')
    }
};

const deleteUser = async (event) => {
    urls = document.location.pathname.split('/')
    const ID = urls[urls.length - 1]
    const response = await fetch(`/admin/users/edit/${ID}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        window.location.href = `/admin/users`
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody);
        alert("server error: unable to delete")
    }
}   

const generatePassword = async (event) => {
    urls = document.location.pathname.split('/')
    const ID = urls[urls.length - 1]
    const response = await fetch(`/admin/users/password/${ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        const responseBody = await response.json();
        if (responseBody.password) {
            document.getElementById("password").value = responseBody.password
        }
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody);
        alert("server error")
    }
}  

const emailCredentials  = async (user_id) => {
    console.log(user_id)

    const response = await fetch(`/admin/email/credentials/${user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        alert('Successfully emailed user new login credentials.')
        //window.location.href = `/admin/users`
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody.msg);
        alert("server error")
    }

}