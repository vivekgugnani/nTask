const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API

sgMail.setApiKey(sendgridAPIKey)

const welcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vivek.gugnani04@gmail.com',
        subject: 'Welcome to Taskify',
        text: `Hi ${name}, Welcome to Taskify.`
    }).then(() => {
        console.log('sent')
    }).catch((e) => {
        console.log(e)
    })
}

const cancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vivek.gugnani04@gmail.com',
        subject: 'Cancellation Email',
        html: '<h1>Cancel your account</h1><br><p>Hi your email is now removed from our list.<br>Can you please tell us what\'s bad in our service</p>'
    })

}

module.exports = {
    welcomeEmail, cancellationEmail
}

