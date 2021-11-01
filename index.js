var Mail = require('nodemailer');
const { from, of } = require('rxjs');
const { map, mergeMap, toArray, tap, filter} = require('rxjs/operators')
const SMTP_EMAIL = 'birthday@foodbar.com';
const SMTP_PASSWORD = '123456$$';
const SMTP_OUTGOING = 'SMTP.office365.com';
const SMTP_OUTGOING_PORT = 587;
const SMTP_ENCRYPTION = false;

// subject of sms/email
const subject = 'Happy birthday!';

// count of emails/sms sent
var count = 0;

// dataset, swap out variable for any array of data e.g mongodb array of data etc
const data = [
    {
        last_name: 'Doe',
        first_name: 'John',
        date_of_birth: '1982/08/10',
        email: 'john.doe@foobar.com'
    },
    {
        last_name: 'Ann',
        first_name: 'Mary',
        date_of_birth: '1975/09/11',
        email: 'mary.ann@foobar.com'
    }
];

// send email/sms to client, replace function with email or sms function wrapped in a promise.
var sendData = function(user) {
    return new Promise((resolve, reject) => {
        let smtpConfig = {
            host: SMTP_OUTGOING,
            port: SMTP_OUTGOING_PORT,
            secure: SMTP_ENCRYPTION,
            auth: {
                user: SMTP_EMAIL,
                pass: SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            },
            secureConnection: true,
            authMethod: 'PLAIN'
        };
        if (!SMTP_ENCRYPTION) {
            smtpConfig.tls['ciphers'] = 'SSLv3';
        }
        var mailOptions = {
            from: SMTP_EMAIL,
            to: user.email,
            subject: subject,
            html: birthdayEmail(user)
        };
        let transporter = Mail.createTransport(smtpConfig)
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(user);
                    };
                });
            }
        });
    })
}

// message to send to user
var birthdayEmail = function(user) {
    return `Happy birthday, dear ${user.first_name}!`
}

// check if birthdate is today
const isToday = (birthDate) => {
    console.log("Birth date: ",new Date(birthDate).toString());
    const today = new Date()
    return birthDate.getDate() == today.getDate() &&
        birthDate.getMonth() == today.getMonth() &&
        birthDate.getFullYear() == today.getFullYear()
}

from(data).pipe(
    mergeMap(user => {
        // get full year
        const year = new Date().getFullYear();
        // check if date is 29th of Feb
        if(new Date(user.date_of_birth) == new Date(year, 1, 29)){
            var date = new Date(user.date_of_birth);
            date.setDate(28);
            date.setMonth(1);
            user.date_of_birth = date;
            return of(user);
        }else{
            user.date_of_birth = new Date(user.date_of_birth);
            return of(user);
        }
    }),
    filter(user => isToday(new Date(user.date_of_birth)).toString()),
    tap(user => count++),
    mergeMap(user => sendData(user).then(emailed => console.log("Sending email")).catch(err => console.log("Error sending email: ", err)))
).subscribe(
    (sent) => console.log("Birthday Message sent"),
    (err)   =>  console.log("Error sending birthday message", err),
    ()  =>  console.log(`${count} birthday messages sent`)
)

