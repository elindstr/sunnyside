# Sunnyside Pools: a business management cloud solution

## Description

Styled for a fictitious pool cleaning service, this cloud-based Enterprise Resource Planning (ERP) system is easily restylable for any small business to manage employee, customer, and product databases, assign and track employee assignments, generate invoices and handle payments, and run accounting reports. From a public-facing landing page, administrators can login to their ERP dashboard, employees can login to manage their work schedules and log their services and expenses, and customers can login to view and pay their invoices.

## Technology

We use a MySQL database with [Sequelize](https://www.npmjs.com/package/sequelize) for object-relational modeling, a Node.js Express server organized in a Model-View-Controller (MVC) framework serving RESTful front-end API routes, and [Express Handlebars](https://www.npmjs.com/package/express-handlebars) as a templating engine. We use [generate-password](https://www.npmjs.com/package/generate-password) and [bcrypt](https://www.npmjs.com/package/bcrypt) for generating and hashing login credentials and [dotenv](https://www.npmjs.com/package/dotenv) for managing sensitive environmental variables. We use [Nodemailer](https://www.npmjs.com/package/nodemailer) to email users their login credentials and notify customers of invoices. And we use [Stripe](https://www.npmjs.com/package/stripe) as an online invoicing and payment handler.

The project is deployed on Heroku at https://sunnyside-699326087e54.herokuapp.com/ with [JawsDB](https://devcenter.heroku.com/articles/jawsdb) hosting our database.

## Screenshots

<img src="/screenshots/localhost_3001_admin_calendars.png" width="350px">
<img src="/screenshots/localhost_3001_admin_records__dateAfter=2023-11-01&dateBefore=2099-01-01&includeInvoice=true&includePayment=true&filterByCustomer=4.png" width="350px">
<img src="/screenshots/localhost_3001_admin_invoices_view_54.png" width="350px">