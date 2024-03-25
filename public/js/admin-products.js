const createProduct = async (event) => {   
    // create object from input values 
    let newProductObject = {
        name: document.getElementById('name').value,
        rate: document.getElementById('rate').value,
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newProductObject).forEach(key => {
        if (newProductObject[key] === "") {
            newProductObject[key] = null;
        }
    });

    // validate (non-nulls in model)
    if (newProductObject.name && newProductObject.rate) {

        // validate that rate is float
        let newFloat = newProductObject.rate
        newFloat = newFloat.replace(/,|\$/g, '');
        newFloat = parseFloat(newFloat);
        if (isNaN(newFloat)) {
            alert("Rate must be a number.")
            return 
        }
        newProductObject.rate = newFloat 

        // fetch
        const response = await fetch(`/admin/products/create/`, {
            method: 'POST',
            body: JSON.stringify(newProductObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/products`
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
        alert('name and rate are required')
    }
};

const updateProduct = async (event) => {   
    // create object from input values 
    let newProductObject = {
        name: document.getElementById('name').value,
        rate: document.getElementById('rate').value,
    }

    // convert any empty string values to null for sequelize storage
    Object.keys(newProductObject).forEach(key => {
        if (newProductObject[key] === "") {
            newProductObject[key] = null;
        }
    });

    // validate non-nulls in model
    if (newProductObject.name && newProductObject.rate) {
        
        // validate that rate is float
        let newFloat = newProductObject.rate
        newFloat = newFloat.replace(/,|\$/g, '');
        newFloat = parseFloat(newFloat);
        if (isNaN(newFloat)) {
            alert("Rate must be a number.")
            return 
        }
        newProductObject.rate = newFloat 

        // get id from url
        urls = document.location.pathname.split('/')
        const ID = urls[urls.length - 1]

        // put call 
        const response = await fetch(`/admin/products/edit/${ID}`, {
            method: 'PUT',
            body: JSON.stringify(newProductObject),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            window.location.href = `/admin/products`
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
        alert('name and rate are required')
    }
};

const deleteProduct = async (event) => {
    urls = document.location.pathname.split('/')
    const ID = urls[urls.length - 1]
    const response = await fetch(`/admin/products/edit/${ID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
        window.location.href = `/admin/products`
    }
    else {
        const responseBody = await response.json();
        console.log(responseBody);
        if (responseBody.message.name === "SequelizeForeignKeyConstraintError") {
            alert(`Please reassign customers before deleting the product.`);
        }
    }
}