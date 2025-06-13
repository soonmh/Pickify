require('dotenv').config()
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()
const { ObjectId, GridFSBucket } = require('mongodb');
const multer = require('multer');
const stream = require('stream');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const saltRounds=10;
const nodemailer = require('nodemailer');   
// const session = require('express-session');

const allowedOrigins = [
  'http://127.0.0.1:5501',
  'http://localhost:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_NAME,   
        pass: process.env.EMAIL_APP_PASSWORD
    }
})
let db
// app.use(cors());
app.use(express.json())

connectToDb((err) => {
    if(!err) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})

// Function to create indexes
async function createIndexes() {
    if (!db) {
        console.error("Database connection not established. Cannot create indexes.");
        return;
    }

    try {
        const userCollection = db.collection('User');

        await userCollection.createIndex({ email: 1 }, { unique: true });
        console.log("Index on 'email' created/ensured.");

        await userCollection.createIndex({ name: 1 }, { unique: true });
        console.log("Index on 'name' created/ensured.");

        // Important: sparse: true for googleId means it won't index documents without this field.
        await userCollection.createIndex({ googleId: 1 }, { unique: true, sparse: true });
        console.log("Index on 'googleId' created/ensured.");

        console.log("All indexes created successfully!");
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
}

app.get('/User', (req, res) => {
    let users = []
    
    db.collection('User')
    .find()
    .forEach(user => users.push(user))
    .then(() => {
        res.status(200).json(users)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })
      
});

app.post('/login', async (req, res) =>{
    const { username, password } = req.body;

    const user = await db.collection('User').findOne({
        $or: [{ name: new RegExp(`^${username}$`, 'i') }, { email: new RegExp(`^${username}$`, 'i') }] // Case-insensitive for login
    });

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Handle password comparison only if the user has a password (i.e., not a Google-only user)
    if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect password' });
        }
    } else {
        // If the user has no password (e.g., Google user), and they are trying to log in with a password, it's an error.
        // Or you might want to prompt them to use Google login.
        return res.status(401).json({ success: false, error: 'This account uses Google Sign-In. Please log in with Google.' });
    }
    res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        user: { 
            userId: user._id.toString(),
            email: user.email,
            name: user.name
        }
    });
});

// ✅ MODIFIED: app.post('/User') to handle Google users (no password) and enforce uniqueness
app.post('/User', async (req, res) => {
    const user = req.body;

    // Server-side duplicate check for email (case-insensitive)
    const existingEmailUser = await db.collection('User').findOne({ email: new RegExp(`^${user.email}$`, 'i') });
    if (existingEmailUser) {
        return res.status(409).json({ success: false, error: 'Email address already registered.' });
    }

    // Server-side duplicate check for username (case-insensitive)
    const existingUsernameUser = await db.collection('User').findOne({ name: new RegExp(`^${user.name}$`, 'i') });
    if (existingUsernameUser) {
        return res.status(409).json({ success: false, error: 'Username already taken.' });
    }

    // Hash password only if provided (for traditional signup)
    if (user.password) {
        // ✅ Validate password here for traditional signup
        const passwordError = validatePassword(user.password);
        if (passwordError) {
            return res.status(400).json({ success: false, error: passwordError });
        }

        const hashPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashPassword;
    } else {
        // If no password (e.g., Google user), ensure it's explicitly null
        user.password = null;
    }

    try {
        const result = await db.collection('User')
            .insertOne(user);
        res.status(201).json({ success: true, userId: result.insertedId });
    } catch (err) {
        console.error("Database insertion error:", err);
        if (err.code === 11000) {
            if (err.keyPattern.email) {
                return res.status(409).json({ success: false, error: 'Email address already registered.' });
            }
            if (err.keyPattern.name) {
                return res.status(409).json({ success: false, error: 'Username already taken.' });
            }
        }
        res.status(500).json({success: false, error: 'Failed to create user'})
    }
});

// ✅ NEW ENDPOINT: Handle Google Login (if user already exists via Google)
app.post('/googleLogin', async (req, res) => {
    const { email, googleId, picture } = req.body; // Added 'picture' to body for consistency if frontend sends it

    try {
        // 1. Try to find user by googleId first (for existing Google-linked accounts)
        let user = await db.collection('User').findOne({ googleId: googleId });

        if (user) {
            // User found by googleId, update picture if it changed
            if (picture && user.picture !== picture) {
                await db.collection('User').updateOne(
                    { _id: user._id },
                    { $set: { picture: picture } }
                );
                user.picture = picture; // Update user object for response
            }
            return res.status(200).json({
                success: true,
                message: 'Google login successful',
                user: {
                    userId: user._id.toString(), // Ensure _id is string
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            });
        }

        // 2. If not found by googleId, try to find by email (for linking existing password-based accounts)
        user = await db.collection('User').findOne({ email: new RegExp(`^${email}$`, 'i') });

        if (user) {
            // User found by email
            if (!user.googleId) {
                // Existing password user, link Google ID
                await db.collection('User').updateOne(
                    { _id: user._id },
                    { $set: { googleId: googleId, picture: picture || user.picture } } // Set googleId and potentially update picture
                );
                // Update user object with new googleId and picture before sending response
                user.googleId = googleId;
                user.picture = picture || user.picture;

                return res.status(200).json({
                    success: true,
                    message: 'Account linked and Google login successful',
                    user: {
                        userId: user._id.toString(), // Ensure _id is string
                        email: user.email,
                        name: user.name,
                        picture: user.picture
                    }
                });
            } else if (user.googleId !== googleId) {
                // Email exists but is already linked to a *different* Google ID
                return res.status(409).json({ success: false, error: 'Email already registered with a different Google account. Please use the original Google account or standard login.' });
            }
            // This case should ideally not be reached if the first 'user' check by googleId passed
            // It means email matched, googleId existed, and it matched the current googleId (redundant, but safe)
            return res.status(200).json({
                success: true,
                message: 'Google login successful',
                user: {
                    userId: user._id.toString(), // Ensure _id is string
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            });
        }

        // 3. If neither found, indicate that it's a new user and frontend should prompt for registration
        // Your frontend's `handleGoogleCredential` already handles this via `checkEmailAvailability`
        // and then showing the username modal, so we'll return a specific status/message for it.
        return res.status(404).json({ success: false, error: 'New Google user. Please proceed with registration.' });

    } catch (err) {
        console.error('Error in Google login:', err);
        res.status(500).json({ success: false, error: 'Server error during Google login.' });
    }
});

app.get('/checkEmailAvailability', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required.' });
    }
    try {
        const existingUser = await db.collection('User').findOne({ email: new RegExp(`^${email}$`, 'i') }); // Case-insensitive check
        res.status(200).json({ isAvailable: !existingUser });
    } catch (err) {
        console.error('Error checking email availability:', err);
        res.status(500).json({ error: 'Server error checking email availability.' });
    }
});

// New endpoint to check username availability
app.get('/checkUsernameAvailability', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }
    try {
        const existingUser = await db.collection('User').findOne({ name: new RegExp(`^${username}$`, 'i') }); // Case-insensitive check
        res.status(200).json({ isAvailable: !existingUser });
    } catch (err) {
        console.error('Error checking username availability:', err);
        res.status(500).json({ error: 'Server error checking username availability.' });
    }
});

const verificationCodes = {}; 

app.post('/VerificationCode', async (req, res) => {
    const { userEmail } = req.body;
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

    verificationCodes[userEmail] = { code, expiry };
    console.log(`Generated code for ${userEmail}: ${code}`);

    try {
        await sendVerificationEmail(userEmail, code);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.post('/verifyCode', async (req, res) => {
    const { email, code } = req.body;
    const storedCodeData = verificationCodes[email];

    if (!storedCodeData) {
        return res.status(400).json({ success: false, error: 'No verification code found for this email. Please request a new one.' });
    }

    if (storedCodeData.expiry < new Date()) {
        delete verificationCodes[email]; // Remove expired code
        return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
    }

    if (storedCodeData.code !== code) {
        return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    // Code is valid and not expired, delete it after successful verification
    delete verificationCodes[email];
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
});


function generateVerificationCode(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(to,code){
    const emailContent={
        from: process.env.EMAIL_NAME,
        to,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`
    }
    await transporter.sendMail(emailContent);
}

app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contactMessage = {
            name: name.trim(),
            email: email.trim(),
            subject: subject ? subject.trim() : '',
            message: message.trim(),
            date: new Date()
        };

        const result = await db.collection('messages').insertOne(contactMessage);

        if (result.acknowledged) {
            res.status(200).json({ 
                success: true, 
                message: 'Message sent successfully!' 
            });
        } else {
            throw new Error('Failed to insert message into database');
        }

    } catch (err) {
        console.error('Error saving contact message:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again later.' 
        });
    }
});

// ✅ NEW ENDPOINT: Forgot Password - Request Reset Link
app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    try {
        const user = await db.collection('User').findOne({ email: new RegExp(`^${email}$`, 'i') });

        // IMPORTANT SECURITY NOTE: Always respond generically even if the email doesn't exist
        // to prevent email enumeration attacks.
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
        }

        // Generate a unique token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = Date.now() + 3600000; // 1 hour from now

        // Store the token and its expiration in the user document
        await db.collection('User').updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: tokenExpiration
                }
            }
        );

        // Construct the reset link (make sure this matches your client-side path)
        const resetLink = `http://localhost:3000/resetpasswordpage.html?token=${resetToken}`;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_NAME,
            to: user.email,
            subject: 'Pickify - Password Reset Request',
            html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetLink}">Reset Password Link</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>Thanks,<br/>The Pickify Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                // Even on email send error, we return success: true for security reasons
                return res.status(200).json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
            }
            console.log('Password reset email sent:', info.response);
            res.status(200).json({ success: true, message: 'If an account exists with this email, a password reset link has been sent.' });
        });

    } catch (error) {
        console.error('Server error during forgot password:', error);
        res.status(500).json({ success: false, error: 'Internal server error. Please try again later.' });
    }
});

// ✅ NEW ENDPOINT: GET /resetpasswordpage.html (serve the reset password page and validate token)
app.get('/resetpasswordpage.html', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Invalid or missing token.');
    }

    try {
        const user = await db.collection('User').findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
        });

        if (!user) {
            // Token is invalid or expired
            return res.status(400).send('Password reset token is invalid or has expired. Please request a new one.');
        }

        // Serve the HTML page, passing the token if needed by the frontend script
        // Note: You can either render it dynamically or just send the static file
        // and let the client-side JS read the URL parameter.
        res.sendFile(path.join(__dirname, 'Code', 'resetpasswordpage.html')); 
        
    } catch (error) {
        console.error('Server error validating token:', error);
        res.status(500).send('Internal server error during token validation.');
    }
});


// ✅ NEW ENDPOINT: POST /resetPassword - Handle Password Reset
app.post('/resetPassword', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, error: 'Token and new password are required.' });
    }

    // ✅ Validate the new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        return res.status(400).json({ success: false, error: passwordError });
    }

    try {
        const user = await db.collection('User').findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Password reset token is invalid or has expired.' });
        }

        // Hash the new password
        const hashPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password and clear the reset token fields
        await db.collection('User').updateOne(
            { _id: user._id },
            {
                $set: { password: hashPassword },
                $unset: { resetPasswordToken: "", resetPasswordExpires: "" } // Remove the token fields
            }
        );

        // Optionally, send a confirmation email that password has been reset
        const mailOptions = {
            from: process.env.EMAIL_NAME,
            to: user.email,
            subject: 'Pickify - Your Password Has Been Reset',
            html: `
                <p>This is a confirmation that the password for your Pickify account ${user.email} has just been changed.</p>
                <p>If you did not make this change, please contact support immediately.</p>
                <p>Thanks,<br/>The Pickify Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset confirmation email:', error);
            } else {
                console.log('Password reset confirmation email sent:', info.response);
            }
        });

        res.status(200).json({ success: true, message: 'Your password has been successfully reset.' });

    } catch (error) {
        console.error('Server error during password reset:', error);
        res.status(500).json({ success: false, error: 'Internal server error during password reset.' });
    }
});

function validatePassword(password) {
    // This regex should match the one in your client-side signup and resetpasswordpage.html
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?~\\/-]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return 'Password must be at least 8 characters long and include: ' +
               'one uppercase letter, one lowercase letter, one number, ' +
               'and one special character (!@#$%^&*...).';
    }
    return null; // Return null if password is valid
}

app.post('/saveTracks', async (req, res) => {
    // console.log("Hello");
    // console.log('Received body:', req.body);
    const track = req.body;

    if (typeof track !== 'object' || track === null) {
        return res.status(400).json({ error: 'Invalid data format, expected an object' });
    }

    try {
        const result = await db.collection('Music').insertOne(track);
        res.json({
            message: 'Track saved successfully',
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('DB insert error:', error);
        res.status(500).json({ error: 'Failed to save track' });
    }
});

app.get('/collectionNameList', async (req, res) => {

    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId or collectionName' });
    }
    // console.log(userId);

    db.collection('userCollection').find(
        { userId: new ObjectId(userId) }, { projection: { collectionName: 1, _id: 0} }
    ).toArray()
    .then(collections => {
        const allCollectionName = collections.map(col => col.collectionName);
        res.status(200).json(allCollectionName)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })

});

app.get('/userCollection', async (req, res) => {
    try {
        const { userId, collectionName } = req.query;
        if (!userId || !collectionName) {
            return res.status(400).json({ error: 'Missing userId or collectionName' });
        }
        // console.log(userId);
        // console.log(collectionName);
        const collection = await db.collection('userCollection').findOne(
            { 
                userId: new ObjectId(userId),
                collectionName: collectionName
            },
            { projection: { item: 1, collectionName: 1, description: 1 } }
        );
        if (!collection || !collection.item) {
            return res.status(404).json({ error: 'Collection not found or empty' });
        }

        // const movieIds = collection.item.map(id => parseInt(id));
        // console.log(collection.item);

        const enrichedItems = [];

        for (const entry of collection.item) {
            let data = null;
            // const itemId = typeof entry.itemId === 'string' ? entry.itemId : entry.itemId.toString();

            if (entry.type === 'movie') {
                data = await db.collection('Movie')
                .findOne({ tmdbId: parseInt(entry.itemId) },
                    {
                        projection: {
                            title: 1,
                            poster_path: 1,
                            release_date: 1,
                            original_language: 1
                        }
                    }
                );
                const baseUrl = "https://image.tmdb.org/t/p/w342";
                if (data) {
                    data = {
                        title: data.title,
                        image: `${baseUrl}${data.poster_path}`,
                        release_date: data.release_date,
                        info: data.original_language
                    };
                }
            } else if (entry.type === 'book') {
                data = await db.collection('books')
                .findOne({ _id: entry.itemId },
                    {
                        projection: {
                            title: 1,
                            image: 1,
                            year: 1,
                            author: 1
                        }
                    }
                );
                if (data) {
                    data = {
                        title: data.title,
                        image: data.image,
                        release_date: data.year,
                        info: data.author
                    };
                }
            } else if (entry.type === 'music') {
                data = await db.collection('Music')
                .findOne({ id: entry.itemId },
                    {
                        projection: {
                            name: 1,
                            poster_url: 1,
                            release: 1,
                            duration_seconds: 1
                        }
                    }
                );
                if (data) {
                    data = {
                        title: data.name,
                        image: data.poster_url,
                        release_date: data.release,
                        info: `${data.duration_seconds}s`
                    };
                }
            }
            // console.log(entry.itemId);
            // console.log(data);

            if (data) {
                enrichedItems.push({
                    type: entry.type,
                    objId: entry.objId,
                    infomation: data
                });
            }
        }

        res.status(200).json({
            collectionName: collection.collectionName,
            description: collection.description,
            items: enrichedItems
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/createCollection', async (req, res) => {
    const { userId, collectionName, collectionDescription } = req.body;

    const collection = {
        userId: new ObjectId(userId),
        collectionName: collectionName,
        description: collectionDescription,
        item: []
    };

    await db.collection('userCollection').insertOne(collection);
    res.json({ success: true });
});

app.delete('/deleteCollection', async (req, res) => {
    const { userId, currentCollectionName } = req.query;
    // console.log(userId);
    // console.log(currentCollectionName);
    try {
        const result = await db.collection('userCollection').deleteOne({
            userId: new ObjectId(userId),
            collectionName: currentCollectionName
        });

        if (result.deletedCount === 1) {
            res.json({ success: true, message: 'Collection deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Collection not found.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting collection.', error });
    }
});

app.delete('/editCollection', async (req, res) => {
    const { userId, currentCollectionName, nameTextAreaValue, descriptionTextAreaValue, listToRemove} = req.query;
    // console.log(userId);
    // console.log(currentCollectionName);
    try {
        const objectIdArray = JSON.parse(listToRemove).map(id => new ObjectId(id));
        // console.log(parsedListToRemove)
        let filter = {
            userId: new ObjectId(userId),
            collectionName: currentCollectionName
        };

        const updateOps = {
            $set: {
                collectionName: nameTextAreaValue,
                description: descriptionTextAreaValue
            }
        };

        const updateResult = await db.collection('userCollection').updateOne(filter, updateOps);

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }

        filter = {
            userId: new ObjectId(userId),
            collectionName: nameTextAreaValue
        };

        if (Array.isArray(objectIdArray) && objectIdArray.length > 0) {
            // console.log(objectIdArray)
            await db.collection('userCollection').updateOne(
                filter,
                {
                    $pull: {
                        item: {
                            objId: { $in: objectIdArray }
                        }
                    }
                }
            );
        }

        res.json({ success: true, message: 'Collection updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error editing collection.', error });
    }
});

app.post('/addToCollection', async (req, res) => {
    const { userId, collectionName, itemId, type } = req.query;

    if (!userId || !collectionName || !itemId || !type) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        let finalItemId = itemId;
        if (type === 'book') {
            try {
                finalItemId = new ObjectId(itemId);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid ObjectId for book type.' });
            }
        }

        const filter = {
            userId: new ObjectId(userId),
            collectionName: collectionName
        };

        const collection = await db.collection('userCollection').findOne(filter);
        if (!collection) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }
        
        const isDuplicate = collection.item.some(entry => 
            entry.itemId?.toString() === finalItemId.toString()
        );

        if (isDuplicate) {
            return res.status(400).json({ success: false, message: 'Item already exists in the collection.' });
        }
        const update = {
            $push: {
                item: {
                    objId: new ObjectId(),
                    itemId: finalItemId,
                    type: type
                }
            }
        };

        const result = await db.collection('userCollection').updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }

        res.json({ success: true, message: 'Item added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding item.', error });
    }
});

// GET /api/recommendation/:userId - Get personalized recommendations
app.get('/api/recommendation/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);

        console.log(`🎯 Fetching recommendations for user: ${userId}`);

        // Validate userId
        let userObjectId;
        try {
            userObjectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        // 1. Fetch user's favorite collection
        const userFavorites = await db.collection('userCollection')
            .findOne({ userId: userObjectId, collectionName: 'Favourite' });

        if (!userFavorites || !userFavorites.item || userFavorites.item.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'no_collections',
                message: 'No favorite items found. Add movies, music, or books to get recommendations!'
            });
        }

        // 2. Separate item IDs by type
        const movieIds = [];
        const musicIds = [];
        const bookIds = [];

        userFavorites.item.forEach(item => {
            if (item.type === 'movie' && typeof item.itemId === 'string') {
                movieIds.push(item.itemId);
            } else if (item.type === 'music' && typeof item.itemId === 'string') {
                musicIds.push(item.itemId);
            } else if (item.type === 'book' && item.itemId?.$oid) {
                bookIds.push(new ObjectId(item.itemId.$oid));
            } else {
                console.warn(`⚠️ Skipping invalid item:`, item);
            }
        });

        console.log('🎥 Movie IDs:', movieIds);
        console.log('🎵 Music IDs:', musicIds);
        console.log('📚 Book IDs:', bookIds);

        // 3. Fetch item details from respective collections (FIXED QUERIES)
        const [movies, music, books] = await Promise.all([
            movieIds.length > 0 ? db.collection('Movie').find({ tmdbId: { $in: movieIds.map(id => parseInt(id)) } }).toArray() : [],
            musicIds.length > 0 ? db.collection('Music').find({ id: { $in: musicIds } }).toArray() : [],
            bookIds.length > 0 ? db.collection('books').find({ _id: { $in: bookIds } }).toArray() : []
        ]);

        console.log('🎬 Fetched Movies:', movies.length);
        console.log('🎵 Fetched Music:', music.length);
        console.log('📚 Fetched Books:', books.length);

        // Add type information to fetched items since it's not in the documents
        const moviesWithType = movies.map(item => ({ ...item, type: 'movie' }));
        const musicWithType = music.map(item => ({ ...item, type: 'music' }));
        const booksWithType = books.map(item => ({ ...item, type: 'book' }));

        const allUserItems = [...moviesWithType, ...musicWithType, ...booksWithType];

        if (!allUserItems.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'invalid_items',
                message: 'No valid items found in your collections. Try adding more items to get recommendations!'
            });
        }

        // 4. Analyze user preferences (UPDATED FOR DIFFERENT STRUCTURES)
        const genreCounts = {};
        const typeCounts = { movie: 0, music: 0, book: 0 };

        allUserItems.forEach(item => {
            // Handle different genre structures
            if (item.type === 'movie' && item.genres && Array.isArray(item.genres)) {
                // Movies: genres as array of objects
                item.genres.forEach(genre => {
                    genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
                });
            } else if (item.type === 'music' && item.genre) {
                // Music: genre as single string
                genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
            } else if (item.type === 'book' && item.genre) {
                // Books: genre as single string
                genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
            }

            // Count types
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });

        console.log('📈 Genre Counts:', genreCounts);
        console.log('📊 Type Counts:', typeCounts);

        // Determine preferred genres and types
        const preferredGenres = Object.entries(genreCounts)
            .filter(([_, count]) => count >= 1) // Changed from > 1 to >= 1 for more recommendations
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        const preferredTypes = Object.entries(typeCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([type]) => type);

        console.log('🎭 User preferred genres:', preferredGenres);
        console.log('📊 User preferred types:', preferredTypes);

        // 5. Fetch recommendations (UPDATED QUERIES FOR DIFFERENT STRUCTURES)
        const recommendations = [];

        for (const type of preferredTypes) {
            let collectionName, query, excludeField;
            
            if (type === 'movie') {
                collectionName = 'Movie';
                excludeField = 'tmdbId';
                query = {
                    tmdbId: { $nin: movieIds.map(id => parseInt(id)) },
                    $or: [
                        { 'genres.name': { $in: preferredGenres } },
                        { vote_average: { $gte: 6.0 } } // Fallback for highly rated
                    ]
                };
            } else if (type === 'music') {
                collectionName = 'Music';
                excludeField = 'id';
                query = {
                    id: { $nin: musicIds },
                    $or: [
                        { genre: { $in: preferredGenres } },
                        { popularity: { $gte: 40 } } // Fallback for popular music
                    ]
                };
            } else if (type === 'book') {
                collectionName = 'books';
                excludeField = '_id';
                query = {
                    _id: { $nin: bookIds },
                    $or: [
                        { genre: { $in: preferredGenres } },
                        { rating: { $gte: 4 } } // Fallback for highly rated books
                    ]
                };
            }

            if (collectionName) {
                console.log(`🔍 Querying ${collectionName} with:`, JSON.stringify(query, null, 2));
                
                const typeRecommendations = await db.collection(collectionName)
                    .find(query)
                    .sort({ 
                        ...(type === 'movie' && { vote_average: -1, popularity: -1 }),
                        ...(type === 'music' && { popularity: -1 }),
                        ...(type === 'book' && { rating: -1, views: -1 })
                    })
                    .limit(Math.ceil(limit / preferredTypes.length))
                    .toArray();

                console.log(`✅ Found ${typeRecommendations.length} ${type} recommendations`);
                
                // Add type information to recommendations
                recommendations.push(...typeRecommendations.map(item => ({ ...item, type })));
            }
        }

        // 6. Shuffle and limit recommendations
        const shuffled = recommendations.sort(() => 0.5 - Math.random()).slice(0, limit);

        console.log(`✅ Generated ${shuffled.length} personalized recommendations`);

        return res.status(200).json({
            success: true,
            count: shuffled.length,
            data: shuffled,
            type: 'personalized',
            userPreferences: {
                totalItemsInCollections: allUserItems.length,
                preferredGenres,
                preferredTypes
            },
            message: `Recommendations based on your ${allUserItems.length} favorite items`
        });
    } catch (error) {
        console.error('❌ Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});
// GET /api/movies/top/:limit - Get top movies by popularity
app.get('/api/movies/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        console.log(`📊 Fetching top ${limit} movies by popularity...`);

        // Fetch movies sorted by popularity
        const movies = await db.collection('Movie')
            .find({})
            .sort({ popularity: -1 }) // Sort descending by popularity
            .limit(limit)
            .project({
                tmdbId: 1,
                title: 1,
                poster_path: 1,
                vote_average: 1,
                popularity: 1,
                vote_count: 1,
                genres: 1,
                release_date: 1,
                director : 1,
                duration : 1,
                runtime : 1,
                overview: 1
            })
            .toArray();

        console.log(`✅ Fetched ${movies.length} movies.`);
        return res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error('❌ Error fetching top movies:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top movies'
        });
    }
});

// GET /api/music/top - Get top 10 music by popularity
app.get('/api/music/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Default limit to 10, max 50
        console.log(`🎵 Fetching top ${limit} music by popularity...`);

        const music = await db.collection('Music')
            .find({})
            .sort({ popularity: -1 }) // Sort descending by popularity
            .limit(limit)
            .project({
                id: 1,
                name: 1,
                artists: 1,
                album: 1,
                release: 1,
                duration_seconds: 1,
                popularity: 1,
                explicit: 1,
                spotify_url: 1,
                poster_url: 1,
                genre: 1
            })
            .toArray();

        console.log(`✅ Fetched ${music.length} music items.`);
        return res.status(200).json({
            success: true,
            count: music.length,
            data: music
        });
    } catch (error) {
        console.error('❌ Error fetching top music:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top music'
        });
    }
});

// GET /api/books/top - Get top 10 books by views
app.get('/api/books/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Default limit to 10, max 50
        console.log(`📚 Fetching top ${limit} books by views...`);

        const books = await db.collection('books')
            .find({})
            .sort({ views: -1 }) // Sort descending by views
            .limit(limit)
            .project({
                title: 1,
                genre: 1,
                rating: 1,
                views: 1,
                image: 1,
                author: 1,
                year: 1,
                description: 1
            })
            .toArray();

        console.log(`✅ Fetched ${books.length} books.`);
        return res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('❌ Error fetching top books:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top books'
        });
    }
});

// GET /api/health - Health check for frontend
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Pickify Backend is running!',
        database: db ? 'Connected' : 'Disconnected'
    });
});

// --- GridFS Image Upload and Serving ---
// --- Profile Picture ---
// Endpoint to upload/update a profile picture
app.post('/user/profile-picture', upload.single('profileImageFile'), async (req, res) => {
    // if (!req.session.user || !req.session.user.id) {
    //     return res.status(401).json({ success: false, error: 'Not authenticated' });
    // }
    const id = req.query.userId;

    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'profile_pictures' });
    
    // Create a readable stream from the buffer
    const readablePhotoStream = new stream.PassThrough();
    readablePhotoStream.end(req.file.buffer);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
    });
    const fileId = uploadStream.id;

    readablePhotoStream.pipe(uploadStream)
        .on('error', (error) => {
            console.error("GridFS upload error:", error);
            return res.status(500).json({ success: false, error: 'Failed to upload image to GridFS.' });
        })
        .on('finish', async () => {
            console.log(`File ${req.file.originalname} uploaded to GridFS with id: ${fileId}`);
            try {
                const userId = new ObjectId(id);
                // Update the user document with the new GridFS file ID for profilePic
                // Assuming your User collection has a field like 'profilePic' to store this ID
                await db.collection('User').updateOne(
                    { _id: userId },
                    { $set: { profilePic: fileId } } // Store the GridFS file ID
                );

                res.json({ success: true, message: 'Profile picture updated!', fileId: fileId.toString() });

                // Update session
                // req.session.user.profilePicId = fileId.toString(); // Store as string in session
                // req.session.save(err => {
                //     if (err) console.error("Session save error after pic update:", err);
                //     res.json({ success: true, message: 'Profile picture updated!', fileId: fileId.toString() });
                // });
            } catch (dbError) {
                console.error("DB update error after GridFS upload:", dbError);
                // If DB update fails, you might want to delete the orphaned GridFS file
                bucket.delete(fileId, (deleteErr) => {
                    if (deleteErr) console.error("Failed to delete orphaned GridFS file:", deleteErr);
                });
                return res.status(500).json({ success: false, error: 'Failed to update user record.' });
            }
        });
});

// --- Background Picture ---
// Endpoint to upload/update a background picture
app.post('/user/background-picture', upload.single('backgroundImageFile'), async (req, res) => {
    // if (!req.session.user || !req.session.user.id) {
    //     return res.status(401).json({ success: false, error: 'Not authenticated' });
    // }

    const id = req.query.userId;

    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'background_pictures' }); // Use a different bucket
    
    const readablePhotoStream = new stream.PassThrough();
    readablePhotoStream.end(req.file.buffer);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
    });
    const fileId = uploadStream.id;

    readablePhotoStream.pipe(uploadStream)
        .on('error', (error) => {
            console.error("GridFS background upload error:", error);
            return res.status(500).json({ success: false, error: 'Failed to upload background image to GridFS.' });
        })
        .on('finish', async () => {
            console.log(`Background file ${req.file.originalname} uploaded to GridFS with id: ${fileId}`);
            try {
                const userId = new ObjectId(id);
                // Update the user document with the new GridFS file ID for backgroundPic
                await db.collection('User').updateOne(
                    { _id: userId },
                    { $set: { backgroundPic: fileId } } // Store the GridFS file ID in 'backgroundPic' field
                );
                res.json({ success: true, message: 'Background picture updated!', fileId: fileId.toString() });

                // Update session
                // req.session.user.backgroundPicId = fileId.toString(); // Store as string in session
                // req.session.save(err => {
                //     if (err) console.error("Session save error after background pic update:", err);
                //     res.json({ success: true, message: 'Background picture updated!', fileId: fileId.toString() });
                // });
            } catch (dbError) {
                console.error("DB update error after background GridFS upload:", dbError);
                bucket.delete(fileId, (deleteErr) => {
                    if (deleteErr) console.error("Failed to delete orphaned background GridFS file:", deleteErr);
                });
                return res.status(500).json({ success: false, error: 'Failed to update user record for background picture.' });
            }
        });
});

app.get('/user/getImage', async (req, res) => {
    const {userId} = req.query
    console.log('userId: '+userId);

    const id = new ObjectId(userId);
    console.log('id ' + id);
    
    try {
        const user = await db.collection('User').findOne({ _id: id});
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, profile: user.profilePic, background: user.backgroundPic });
    }
    catch (err) {
        console.error("Error fetching user image:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Generalized Endpoint to serve images from specified GridFS bucket
app.get('/image/:bucketName/:fileId', async (req, res) => {
    try {
        const { bucketName, fileId: fileIdString } = req.params;
        const fileId = new ObjectId(fileIdString);
        const bucket = new GridFSBucket(db, { bucketName: bucketName });

        const file = await db.collection(`${bucketName}.files`).findOne({ _id: fileId });
        if (!file) {
            return res.status(404).send('Image not found');
        }

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `inline; filename="${file.filename}"`);

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
        downloadStream.on('error', () => res.status(404).send('Image not found or error streaming'));
    } catch (error) { // Catch ObjectId creation error for invalid fileIdString
        console.error("Error serving image from GridFS:", error);
        res.status(500).send('Server error');
    }
});

// Endpoint to update username
app.post('/user/username', async (req, res) => {
    // if (!req.session.user || !req.session.user.id) {
    //     return res.status(401).json({ success: false, error: 'Not authenticated' });
    // }
    const userIdString = req.query.userId; // Renamed for clarity

    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Username cannot be empty.' });
    }
    

    try {
        const userObjectId = new ObjectId(userIdString); // Use userObjectId consistently

        // Proactively check if the new username is already taken by ANOTHER user
        const existingUserWithNewName = await db.collection('User').findOne({
            name: newUsername.trim()
        });

        console.log(existingUserWithNewName);

        if (existingUserWithNewName) {
            return res.status(409).json({ success: false, error: 'Username already taken. Please choose another.' });
        }

        // Proceed with the update
        const result = await db.collection('User').updateOne(
            { _id: userObjectId },
            { $set: { name: newUsername.trim() } }
        );

        if (result.matchedCount === 0) {
            // This case should ideally not happen if userId is valid and user exists
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (result.modifiedCount === 0 && result.matchedCount > 0) {
            // Username was the same as before, no actual update needed by the database
            return res.status(200).json({ 
                success: true, 
                message: 'Username is the same as before. No update performed.', 
                username: newUsername.trim() 
            });
        }
        
        // Successfully updated
        res.json({ 
            success: true, 
            message: 'Username updated successfully!', 
            username: newUsername.trim() 
        });

    } catch (error) {
        console.error('Error updating username:', error);
        // The unique index constraint error (11000) is a good fallback,
        // but the proactive check above should catch most cases.
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(409).json({ success: false, error: 'Username already taken. Please ensure it is unique.' });
        }
        if (error.name === 'BSONTypeError') { // Handle invalid ObjectId format
            return res.status(400).json({ success: false, error: 'Invalid user ID format.' });
        }
        res.status(500).json({ success: false, error: 'Server error while updating username.' });
    }
});

// Helper function to delete a file from GridFS
async function deleteGridFSFile(db, bucketName, fileIdString) {
    if (!fileIdString) {
        console.log(`No fileId provided for bucket ${bucketName}, skipping deletion.`);
        return;
    }
    try {
        const fileId = new ObjectId(fileIdString);
        const bucket = new GridFSBucket(db, { bucketName });
        await bucket.delete(fileId);
        console.log(`Successfully deleted file ${fileIdString} from bucket ${bucketName}.`);
    } catch (error) {
        // Log error but don't necessarily stop the entire account deletion
        console.error(`Error deleting file ${fileIdString} from bucket ${bucketName}:`, error.message);
        // If the error is "FileNotFound", it's not critical if we're trying to clean up.
        if (error.message.includes('FileNotFound')) {
            console.warn(`File ${fileIdString} not found in ${bucketName} during deletion, might have been already deleted.`);
        } else {
            // For other errors, you might want to re-throw or handle differently
        }
    }
}

// Endpoint to delete a user account
app.delete('/user/delete', async (req, res) => {
    // if (!req.session.user || !req.session.user.id) {
    //     return res.status(401).json({ success: false, error: 'Not authenticated. Please log in.' });
    // }

    const userIdString = req.query.userId;
    const profilePicId = req.query.profileId;
    const backgroundPicId = req.query.backgroundId;

    // const userIdString = req.session.user.id;
    const userObjectId = new ObjectId(userIdString);
    // const { profilePicId, backgroundPicId } = req.session.user; // Get from session

    try {
        console.log(`Attempting to delete account for user ID: ${userIdString}`);

        // 1. Delete Profile Picture from GridFS
        await deleteGridFSFile(db, 'profile_pictures', profilePicId);

        // 2. Delete Background Picture from GridFS
        await deleteGridFSFile(db, 'background_pictures', backgroundPicId);

        // 3. Delete user's collections (e.g., from 'userCollection')
        const collectionDeleteResult = await db.collection('userCollection').deleteMany({ userId: userObjectId });
        console.log(`Deleted ${collectionDeleteResult.deletedCount} entries from userCollection for user ${userIdString}.`);

        // 4. Delete the user document from 'User' collection
        const userDeleteResult = await db.collection('User').deleteOne({ _id: userObjectId });
        if (userDeleteResult.deletedCount === 0) {
            // This case should ideally not happen if session is valid and user exists
            return res.status(404).json({ success: false, error: 'User not found for deletion.' });
        }
        console.log(`Successfully deleted user document for ${userIdString}.`);
        res.status(200).json({ success: true, message: 'Account deleted successfully.' });

        // // 5. Destroy session and clear cookie
        // req.session.destroy(err => {
        //     if (err) {
        //         console.error('Session destruction error during account deletion:', err);
        //         // Still attempt to clear cookie and respond positively as user data is deleted
        //     }
        //     res.clearCookie('connect.sid'); // Default session cookie name
        //     res.status(200).json({ success: true, message: 'Account deleted successfully.' });
        // });

    } catch (error) {
        console.error('Error during account deletion process:', error);
        res.status(500).json({ success: false, error: 'Failed to delete account due to a server error.' });
    }
});


app.put('/user/changePassword', async (req, res) => {
    const {userId} = req.query
    const {password} = req.body;
    console.log('User password to be updated ' + password)

    const hashPassword = await bcrypt.hash(password, saltRounds);
    console.log('hashpassword ' + hashPassword)


    const id = new ObjectId(userId);

    db.collection('User').updateOne({ _id : id}, {$set: {password : hashPassword}})
    .then ( () => res.status(200).json({success: true, message: 'Password updated successfully!'}))
    .catch(err => res.status(500).json({success: false, error: err}));
});

app.post('/user/getPassword', async (req, res) => {
    
    const {userId} = req.query;
    const {password} = req.body;
    console.log('User password from req.body ' + password);
    
    try {
        const id = new ObjectId(userId);
        const user = await db.collection('User').findOne({_id: id});

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Correctly await the result of bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result (isMatch): ' + isMatch); // This will log true or false

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect password' });
        }

        // Successfully verified old password
        res.status(200).json({success: true, message: 'Password verified.'});

    } catch (err) {
        console.error('Error in /user/getPassword:', err);
        // Send a more generic error message to the client for security
        res.status(500).json({success: false, error: 'Server error during password verification.'});
    }
});

// Enhanced search API with better debugging - replace your existing search API
app.get('/api/search', async (req, res) => {
    try {
        const { query, type, genre, sort = 'rating', page = 1, limit = 8 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        console.log(`[${new Date().toISOString()}] 🔍 Search Request:`);
        console.log(`  Query: "${query}"`);
        console.log(`  Type: ${type}`);
        console.log(`  Genre: ${genre}`);
        console.log(`  Sort: ${sort}`);
        console.log(`  Page: ${pageNum}, Limit: ${limitNum}`);
        
        // Initialize results array and total count
        let results = [];
        let total = 0;
        
        // Define sort options
        const sortOptions = {
            rating: { 'vote_average': -1, 'rating': -1 },
            views: { 'popularity': -1, 'views': -1 }
        };
        
        // Build base filters
        const buildFilter = (queryText, contentType, genreFilter) => {
            const filter = {};
            
            // Add title search if query provided
            if (queryText && queryText.trim() !== '') {
                // Create case-insensitive regex for title search
                const titleRegex = new RegExp(queryText, 'i');
                
                // For movies
                if (contentType === 'all' || contentType === 'movie') {
                    filter.title = titleRegex;
                }
                // For music
                else if (contentType === 'music') {
                    filter.name = titleRegex;
                }
                // For books
                else if (contentType === 'book') {
                    filter.title = titleRegex;
                }
            }
            
            // Add genre filter if provided and not 'all'
            if (genreFilter && genreFilter !== 'all') {
                if (contentType === 'movie') {
                    // Use dot notation to filter on nested genre name in the array
                    filter['genres.name'] = genreFilter;
                    console.log(`  Movie genre filter: genres.name = "${genreFilter}"`);
                } else {
                    filter.genre = genreFilter;
                    console.log(`  ${contentType} genre filter: genre = "${genreFilter}"`);
                }
            }
            
            return filter;
        };
        
        // 1. Search based on content type
        if (type === 'all' || !type) {
            // Search in all collections
            
            // 1a. Search movies
            const movieFilter = buildFilter(query, 'movie', genre);
            console.log(`  Movie filter:`, JSON.stringify(movieFilter));
            
            const movies = await db.collection('Movie')
                .find(movieFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${movies.length} movies`);
                
            // Transform movie data to match our unified format
            const formattedMovies = movies.map(movie => {
                // Extract primary genre (first in the list) or default to 'unknown'
                const primaryGenre = movie.genres && movie.genres.length > 0 && movie.genres[0].name 
                    ? movie.genres[0].name 
                    : 'unknown';
                    
                // Get all genre names for display in details if needed
                const allGenres = movie.genres 
                    ? movie.genres.map(g => g.name).join(', ')
                    : 'unknown';
                
                return {
                    id: movie._id,
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    type: 'movie',
                    genre: primaryGenre,
                    allGenres: allGenres,
                    rating: movie.vote_average/2 || 0,
                    views: formatViews(movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000)) || 0,
                    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png',
                    director: movie.director || 'Unknown',
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
                    overview: movie.overview,
                    lastUpdated: movie.lastUpdated,
                    updatedBy: movie.updatedBy
                };
            });
            
            // 1b. Search music
            const musicFilter = buildFilter(query, 'music', genre);
            console.log(`  Music filter:`, JSON.stringify(musicFilter));
            
            const music = await db.collection('Music')
                .find(musicFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${music.length} music tracks`);
                
            // Transform music data
            const formattedMusic = music.map(track => ({
                id: track._id,
                title: track.name,
                type: 'music',
                genre: track.genre || 'unknown',
                rating: track.popularity ? track.popularity / 20 : 4.5, // Convert popularity to 5-star scale
                views: track.popularity * 10000 || 1000, // Create views from popularity
                image: track.poster_url || './assests/musicposter.png',
                artist: track.artists ? track.artists.join(', ') : 'Unknown',
                year: track.release ? new Date(track.release).getFullYear() : 'Unknown'
            }));
            
            // 1c. Search books
            const bookFilter = buildFilter(query, 'book', genre);
            console.log(`  Book filter:`, JSON.stringify(bookFilter));
            
            const books = await db.collection('books')
                .find(bookFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${books.length} books`);
                
            // Transform book data
            const formattedBooks = books.map(book => ({
                id: book._id,
                title: book.title,
                type: 'book',
                genre: book.genre || 'unknown',
                rating: book.rating || 4.5,
                views: book.views || 5000,
                image: book.image ,
                author: book.author || 'Unknown',
                year: book.year || 'Unknown',
                description: book.description
            }));
            
            // Combine all results
            results = [...formattedMovies, ...formattedMusic, ...formattedBooks];
            
        } else if (type === 'movie') {
            // Search only in movies
            const movieFilter = buildFilter(query, 'movie', genre);
            console.log(`  Movie-only filter:`, JSON.stringify(movieFilter));
            
            const movies = await db.collection('Movie')
                .find(movieFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${movies.length} movies`);
                
            results = movies.map(movie => {
                // Extract primary genre (first in the list) or default to 'unknown'
                const primaryGenre = movie.genres && movie.genres.length > 0 && movie.genres[0].name 
                    ? movie.genres[0].name 
                    : 'unknown';
                    
                // Get all genre names for display in details if needed
                const allGenres = movie.genres 
                    ? movie.genres.map(g => g.name).join(', ')
                    : 'unknown';
                
                return {
                    id: movie._id,
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    type: 'movie',
                    genre: primaryGenre,
                    allGenres: allGenres,
                    rating: movie.vote_average/2 || 0,
                    views: formatViews(movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000)) || 0,
                    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png',
                    director: movie.director || 'Unknown',
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
                    overview: movie.overview,
                    lastUpdated: movie.lastUpdated,
                    updatedBy: movie.updatedBy
                };
            });
            
        } else if (type === 'music') {
            // Search only in music
            const musicFilter = buildFilter(query, 'music', genre);
            console.log(`  Music-only filter:`, JSON.stringify(musicFilter));
            
            const music = await db.collection('Music')
                .find(musicFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${music.length} music tracks`);
                
            results = music.map(track => ({
                id: track._id,
                title: track.name,
                type: 'music',
                genre: track.genre || 'unknown',
                rating: track.popularity ? track.popularity / 20 : 4.5,
                views: track.popularity * 10000 || 1000,
                image: track.poster_url || './assests/musicposter.png',
                artist: track.artists ? track.artists.join(', ') : 'Unknown',
                year: track.release ? new Date(track.release).getFullYear() : 'Unknown'
            }));
            
        } else if (type === 'book') {
            // Search only in books
            const bookFilter = buildFilter(query, 'book', genre);
            console.log(`  Book-only filter:`, JSON.stringify(bookFilter));
            
            const books = await db.collection('books')
                .find(bookFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${books.length} books`);
                
            results = books.map(book => ({
                id: book._id,
                title: book.title,
                type: 'book',
                genre: book.genre || 'unknown',
                rating: book.rating || 4.5,
                views: book.views || 5000,
                image: book.image || './assests/bookposter.png',
                author: book.author || 'Unknown',
                year: book.year || 'Unknown',
                description: book.description
            }));
        }
        
        // Sort combined results
        if (sort === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'views') {
            results.sort((a, b) => b.views - a.views);
        }
        
        // Get total count
        total = results.length;
        
        // Apply pagination after sorting
        const paginatedResults = results.slice(skip, skip + limitNum);
        
        console.log(`[${new Date().toISOString()}] ✅ Search completed:`);
        console.log(`  Total results: ${total}`);
        console.log(`  Returned: ${paginatedResults.length} items (page ${pageNum})`);
        console.log(`  Sample genres:`, paginatedResults.slice(0, 3).map(r => `${r.title}: ${r.genre}`));
        
        return res.status(200).json({
            success: true,
            total: total,
            items: paginatedResults,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Search error:`, error);
        return res.status(500).json({
            success: false,
            error: 'Failed to search content'
        });
    }
});

function formatViews(views) {
        if (typeof views === 'string') {
            return views;
        }
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        }
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

// GET /api/autocomplete - Endpoint for search suggestions
app.get('/api/autocomplete', async (req, res) => {
    try {
        const { query } = req.query;
        const limit = 6; // Limit to 6 suggestions
        
        if (!query || query.trim() === '') {
            return res.json({ suggestions: [] });
        }
        
        console.log(`🔍 Getting autocomplete suggestions for "${query}"`);
        
        // Create case-insensitive regex for search
        const searchRegex = new RegExp(query, 'i');
        
        // Search in all collections concurrently
        const [movies, music, books] = await Promise.all([
            // Search movies by title
            db.collection('Movie')
                .find({ title: searchRegex })
                .limit(limit)
                .project({ title: 1, poster_path: 1, vote_average: 1 })
                .toArray(),
                
            // Search music by name
            db.collection('Music')
                .find({ name: searchRegex })
                .limit(limit)
                .project({ name: 1, artists: 1, poster_url: 1 })
                .toArray(),
                
            // Search books by title
            db.collection('books')
                .find({ title: searchRegex })
                .limit(limit)
                .project({ title: 1, author: 1, image: 1 })
                .toArray()
        ]);
        
        // Format results to a common structure
        const movieSuggestions = movies.map(movie => ({
            id: movie._id,
            title: movie.title,
            type: 'movie',
            image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png'
        }));
        
        const musicSuggestions = music.map(track => ({
            id: track._id,
            title: track.name,
            type: 'music',
            image: track.poster_url || './assests/musicposter.png'
        }));
        
        const bookSuggestions = books.map(book => ({
            id: book._id,
            title: book.title,
            type: 'book',
            image: book.image || './assests/bookposter.png'
        }));
        
        // Combine and limit results
        const allSuggestions = [...movieSuggestions, ...musicSuggestions, ...bookSuggestions]
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, limit);
            
        console.log(`✅ Found ${allSuggestions.length} suggestions`);
        
        res.json({ suggestions: allSuggestions });
        
    } catch (error) {
        console.error('❌ Autocomplete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions'
        });
    }
});