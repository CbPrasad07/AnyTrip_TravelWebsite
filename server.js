const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: '5432',
        user: 'postgres',
        password: 'cb1234',
        database: 'demo'
    }
})

let intialPath = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(express.static(intialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "index.html"));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
})


app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.json('Fill all the fields');
    } else {
        // Hash the password before storing it in the database
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                res.status(500).json('Internal server error');
            } else {
                // Store the hashed password in the database
                db.select('email')
                    .from('users')
                    .where('email', '=', email)
                    .then(existingUser => {
                        if (existingUser.length > 0) {
                            res.json({ message: 'Account already exists' });
                        } else {
                            db("users").insert({
                                username: name,
                                email: email,
                                passwordd: hashedPassword // Store the hashed password
                            })
                            .returning(["username", "email"])
                            .then(data => {
                                res.json(data[0]);
                            })
                            .catch(err => {
                                console.error(err);
                                res.status(500).json('Internal server error');
                            });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json('Internal server error');
                    });
            }
        });
    }
});


app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    db.select('username', 'email', 'passwordd') 
    .from('users')
    .where({
        email: email,
    })
    .then(data => {
        if(data.length){
            bcrypt.compare(password, data[0].passwordd, (err, result) => {
                if (result) {
                    res.json(data[0]);
                } else {
                    res.json({ message: 'Email or password is incorrect' });
                }
            });
        } else {
            res.json({ message: 'Email or password is incorrect' });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json('Internal server error');
    });
})

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "1056483931058-psl2chhrv6f49rj47tejfqobhjlc7tue.apps.googleusercontent.com"; // Replace with your actual client ID

const client = new OAuth2Client(CLIENT_ID);

app.post('/google-auth', async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // Here, you can verify the user's email or other details
        const email = payload.email;
        // If verification is successful, respond with success
        res.json({ success: true, email });
    } catch (error) {
        // If verification fails, respond with error
        console.error('Google Sign-In error:', error);
        res.json({ success: false });
    }
});





// Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route for handling POST requests to the contact form
app.post('/contact', (req, res) => {
    // Log the submitted data
    console.log('Received contact form submission:');
    console.log('Name:', req.body.name);
    console.log('Email:', req.body.email);
    console.log('Message:', req.body.message);
    // Send a response to the client
    res.send('We recieved your message, we will get back to you soon!');
});

app.post('/feedback', (req, res) => {
    // Log the submitted data
    console.log('Received Feeback:');
    console.log('Name:', req.body.name);
    console.log('Email:', req.body.email);
    console.log('Message:', req.body.message);

    // Send a response to the client
    res.send('Thank you for your Feedback! We really appreciate it.');
});

// Start the server
/*app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/

app.listen(3000, (req, res) => {
    console.log('listening on port 3000......')
})



