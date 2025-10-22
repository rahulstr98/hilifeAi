const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const User = require("../../model/login/auth");
const { Pool } = require('pg');
const argon2 = require('argon2');


// PostgreSQL pool connection setup
const pool = new Pool({
    host: '192.168.8.6',          // Your PostgreSQL server address
    user: 'ttsbs',       // PostgreSQL user (e.g., 'postgres')
    password: 'TTSAdm$2023',     // Password for the PostgreSQL user
    database: 'postfixadmin',      // Database where virtual users are stored
    // port: 5432,                  // Default PostgreSQL port
});


const testConnection = async () => {
    try {
        // Attempt to connect to the database
        const client = await pool.connect();
        // Optionally, run a simple query to further test
        const result = await client.query('SELECT NOW() AS current_time');
        // Release the client back to the pool
        client.release();
    } catch (error) {
    } finally {
        // End the pool (close all connections)
        await pool.end();
    }
};

// Run the test connection function
// testConnection();

// Controller to create a user in LDAP
exports.getMailedUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM mailbox'); // Fetch all users

        // Check if any users were found
        if (result.rowCount > 0) {
            res.status(200).json(result.rows); // Return the users as JSON
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Single Users from postfix
exports.getSingleMailedUser = async (employeename) => {
    try {
        const result = await pool.query('SELECT * FROM mailbox WHERE name = $1', [employeename]); // Fetch all users
        // Check if any users were found
        if (result.rowCount > 0) {
            // res.status(200).json(result.rows); // Return the users as JSON
            return { singleUser: result.rows }

        }
    } catch (error) {
        return { userExist: false }
    }
};


// Get Hierarchy Based Filtered users from postfix
exports.getMultipleUsers = async (employeenames) => {
    try {
        const result = await pool.query('SELECT * FROM mailbox WHERE name = ANY($1)', [employeenames]);
        // Check if any users were found
        if (result.rowCount > 0) {
            return { users: result.rows }
        }
    } catch (error) {
        return { userExist: false }
    }
};


exports.createUserMaildomain = catchAsyncErrors(async (req, res, next) => {
    try {
        const { username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry } = req.body;

        // Hash the password using Argon2 with specified parameters
        const finalHashedPassword = await argon2.hash(password, {
            type: argon2.argon2i, // Use Argon2i
            memoryCost: 32768,         // Set memory cost to 32768 (32MB)
            timeCost: 5,           // Set time cost to 5 iterations
            parallelism: 1         // Set parallelism to 1 thread
        });

        // Prepend the prefix {ARGON2I}
        const hashedPassword = `{ARGON2I}${finalHashedPassword}`;



        // Calculate password expiry date (one year from created date)
        const createdDate = created ? new Date(created) : new Date(); // Use provided created date or current date
        const passwordExpiry = new Date(createdDate);
        passwordExpiry.setFullYear(passwordExpiry.getFullYear() + 1); // Set to one year from created date

        // Calculate token validity (one minute after created date)
        const tokenValidity = new Date(createdDate);
        tokenValidity.setMinutes(tokenValidity.getMinutes() + 1); // Set to one minute after created date

        // Insert the user data into the database
        const result = await pool.query(
            `INSERT INTO mailbox (
                username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`,
            [
                username,
                hashedPassword, // Insert the hashed password
                name,
                maildir,
                quota,
                created || new Date(),    // Default to current date if not provided
                modified || new Date(),   // Default to current date if not provided
                active ?? true,           // Default to true if not provided
                domain || null,           // Default to null if not provided
                local_part || null,       // Default to null if not provided
                phone || '',              // Default to an empty string if not provided
                email_other || '',        // Default to an empty string if not provided
                token || '',              // Default to an empty string if not provided
                tokenValidity.toISOString(),
                passwordExpiry.toISOString()  // Default as per your table definition
            ]
        );

        // If the user was successfully created
        if (result.rowCount === 1) {
            const newUser = result.rows[0];
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } else {
            res.status(500).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//from Employee Create

// exports.createUserMailFromEmployeeCreate = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { username, password, name, maildir, quota, domain, local_part, created, modified, active, phone, email_other, token } = req.body;

//         const resultFirst = await pool.query('SELECT * FROM domain');
//         const extractedDomains = resultFirst?.rows?.map((data) => data?.domain)

//         let domainArray = [];
//         let isArray = false;

//         if (domain.includes(',')) {
//             domainArray = domain.split(','); // Split domain into an array
//             isArray = true;
//         }



//         let availedDomains = isArray ? domainArray?.filter((item) => extractedDomains?.includes(item)) : [];
//         let availedDomain = !isArray ? extractedDomains?.includes(domain) : "";

//         // Collect unavailable domains
//         const unavailableDomains = isArray ? domainArray.filter((item) => !extractedDomains.includes(item)) : (availedDomain ? [] : [domain]);



//         // Check if any domain is unavailable in the database
//         if ((isArray && unavailableDomains.length >= 0) || (!isArray && !availedDomain)) {
//             return res.status(400).json({
//                 message: `The following domains are not available: ${unavailableDomains.join(', ')}`,
//                 unavailableDomains
//             });
//         }

//           // Check if the username already exists in the mailbox table
//           const existingUserResult = await pool.query('SELECT * FROM mailbox WHERE username = $1', [`${username}@${isArray ? domainArray[0] : domain}`]);

//           if (existingUserResult.rowCount > 0) {
//               return res.status(400).json({ message: 'Username already exists in the Domain Mails Table' });
//           }

//         // Hash the password using Argon2
//         const finalHashedPassword = await argon2.hash(password, {
//             type: argon2.argon2i, // Use Argon2i
//             memoryCost: 32768,    // Set memory cost to 32MB
//             timeCost: 5,          // Set time cost to 5 iterations
//             parallelism: 1        // Set parallelism to 1 thread
//         });

//         // Prepend the prefix {ARGON2I}
//         const hashedPassword = `{ARGON2I}${finalHashedPassword}`;

//         // Calculate the quota in bytes (MB to bytes)
//         const quotaInBytes = String(Number(quota) * 1048576);

//         // Calculate password expiry date (one year from created date)
//         const createdDate = created ? new Date(created) : new Date();
//         const passwordExpiry = new Date(createdDate);
//         passwordExpiry.setFullYear(passwordExpiry.getFullYear() + 1); // Set expiry one year from created date

//         // Calculate token validity (one minute after created date)
//         const tokenValidity = new Date(createdDate);
//         tokenValidity.setMinutes(tokenValidity.getMinutes() + 1); // Set token validity one minute after creation

//         if (isArray) {
//             // Handle multiple domains asynchronously
//             const overallArray = availedDomains.map(async (domainItem) => {
//                 return pool.query(
//                     `INSERT INTO mailbox (
//                         username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                     RETURNING *`,
//                     [
//                         `${username}@${domainItem}`,
//                         hashedPassword,
//                         name,
//                         `${domainItem}/${maildir}/`,
//                         quotaInBytes,
//                         created || new Date(),
//                         modified || new Date(),
//                         active ?? true,
//                         domainItem,
//                         local_part || null,
//                         phone || '',
//                         email_other || '',
//                         token || '',
//                         tokenValidity.toISOString(),
//                         passwordExpiry.toISOString()
//                     ]
//                 );
//             });

//             // Wait for all domain inserts to finish
//             const results = await Promise.all(overallArray);

//             res.status(201).json({ message: 'User Domain Mails created successfully for all domains', results });
//         } else {
//             // Single domain insert
//             const result = await pool.query(
//                 `INSERT INTO mailbox (
//                     username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                 RETURNING *`,
//                 [
//                     `${username}@${domain}`,
//                     hashedPassword,
//                     name,
//                     `${domain}/${maildir}/`,
//                     quotaInBytes,
//                     created || new Date(),
//                     modified || new Date(),
//                     active ?? true,
//                     domain || null,
//                     local_part || null,
//                     phone || '',
//                     email_other || '',
//                     token || '',
//                     tokenValidity.toISOString(),
//                     passwordExpiry.toISOString()
//                 ]
//             );

//             if (result.rowCount === 1) {
//                 const newUser = result.rows[0];
//                 res.status(201).json({ message: 'User Domain Mail created successfully', user: newUser });
//             } else {
//                 res.status(500).json({ message: 'Failed to create user' });
//             }
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


// exports.createUserMailFromEmployeeCreate = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { username, password, name, maildir, quota, domain, local_part, created, modified, active, phone, email_other, token } = req.body;

//         // Fetch available domains from the database
//         const resultFirst = await pool.query('SELECT * FROM domain');
//         const extractedDomains = resultFirst?.rows?.map((data) => data?.domain);

//         let domainArray = [];
//         let isArray = false;

//         // Check if multiple domains are provided
//         if (domain.includes(',')) {
//             domainArray = domain.split(','); // Split domain into an array
//             isArray = true;
//         }

//         let availedDomains = isArray ? domainArray?.filter((item) => extractedDomains?.includes(item)) : [];
//         let availedDomain = !isArray ? extractedDomains?.includes(domain) : "";

//         // Collect unavailable domains
//         const unavailableDomains = isArray ? domainArray.filter((item) => !extractedDomains.includes(item)) : (availedDomain ? [] : [domain]);

//         // Create user data for availed domains
//         if (availedDomains.length > 0 || availedDomain) {
//             // Hash the password using Argon2
//             const finalHashedPassword = await argon2.hash(password, {
//                 type: argon2.argon2i, // Use Argon2i
//                 memoryCost: 32768,    // Set memory cost to 32MB
//                 timeCost: 5,          // Set time cost to 5 iterations
//                 parallelism: 1        // Set parallelism to 1 thread
//             });

//             // Prepend the prefix {ARGON2I}
//             const hashedPassword = `{ARGON2I}${finalHashedPassword}`;

//             // Calculate the quota in bytes (MB to bytes)
//             const quotaInBytes = String(Number(quota) * 1048576);

//             // Calculate password expiry date (one year from created date)
//             const createdDate = created ? new Date(created) : new Date();
//             const passwordExpiry = new Date(createdDate);
//             passwordExpiry.setFullYear(passwordExpiry.getFullYear() + 1); // Set expiry one year from created date

//             // Calculate token validity (one minute after created date)
//             const tokenValidity = new Date(createdDate);
//             tokenValidity.setMinutes(tokenValidity.getMinutes() + 1); // Set token validity one minute after creation

//             if (isArray) {
//                 // Handle multiple domains asynchronously
//                 const overallArray = availedDomains.map(async (domainItem) => {
//                     return pool.query(
//                         `INSERT INTO mailbox (
//                             username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                         RETURNING *`,
//                         [
//                             `${username}@${domainItem}`,
//                             hashedPassword,
//                             name,
//                             `${domainItem}/${maildir}/`,
//                             quotaInBytes,
//                             created || new Date(),
//                             modified || new Date(),
//                             active ?? true,
//                             domainItem,
//                             local_part || null,
//                             phone || '',
//                             email_other || '',
//                             token || '',
//                             tokenValidity.toISOString(),
//                             passwordExpiry.toISOString()
//                         ]
//                     );
//                 });

//                 // Wait for all domain inserts to finish
//                 const results = await Promise.all(overallArray);

//                 return res.status(201).json({ 
//                     message: 'User Domain Mails created successfully for availed domains', 
//                     results, 
//                     unavailableDomains 
//                 });
//             } else {
//                 // Single domain insert
//                 const result = await pool.query(
//                     `INSERT INTO mailbox (
//                         username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                     RETURNING *`,
//                     [
//                         `${username}@${domain}`,
//                         hashedPassword,
//                         name,
//                         `${domain}/${maildir}/`,
//                         quotaInBytes,
//                         created || new Date(),
//                         modified || new Date(),
//                         active ?? true,
//                         domain || null,
//                         local_part || null,
//                         phone || '',
//                         email_other || '',
//                         token || '',
//                         tokenValidity.toISOString(),
//                         passwordExpiry.toISOString()
//                     ]
//                 );

//                 if (result.rowCount === 1) {
//                     const newUser = result.rows[0];
//                     return res.status(201).json({ 
//                         message: 'User Domain Mail created successfully', 
//                         user: newUser, 
//                         unavailableDomains 
//                     });
//                 }
//             }
//         }

//         // Return unavailable domains if none could be created
//         return res.status(400).json({
//             message: `The following domains are not available: ${unavailableDomains.join(', ')}`,
//             unavailableDomains
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// exports.createUserMailFromEmployeeCreate = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { username, password, name, maildir, quota, domain, local_part, created, modified, active, phone, email_other, token } = req.body;

//         // Fetch available domains from the database
//         const resultFirst = await pool.query('SELECT * FROM domain');
//         const extractedDomains = resultFirst?.rows?.map((data) => data?.domain);

//         let domainArray = [];
//         let isArray = false;

//         // Check if multiple domains are provided
//         if (domain.includes(',')) {
//             domainArray = domain.split(','); // Split domain into an array
//             isArray = true;
//         }

//         // Filter available and unavailable domains
//         let availedDomains = isArray ? domainArray?.filter((item) => extractedDomains?.includes(item)) : [];
//         let availedDomain = !isArray ? extractedDomains?.includes(domain) : "";

//         // Collect unavailable domains
//         const unavailableDomains = isArray ? domainArray.filter((item) => !extractedDomains.includes(item)) : (availedDomain ? [] : [domain]);

//         //for duplicate condition
//         const existingUserResult = await pool.query('SELECT * FROM mailbox WHERE username = $1', [`${username}@${isArray ? domainArray[0] : domain}`]);

//         if (existingUserResult.rowCount > 0) {
//             return res.status(400).json({ message: 'Username already exists in the Domain Mails Table' });
//         }

//         // Check if any availed domain exists
//         if (availedDomains.length > 0 || availedDomain) {
//             // Hash the password using Argon2
//             const finalHashedPassword = await argon2.hash(password, {
//                 type: argon2.argon2i, // Use Argon2i
//                 memoryCost: 32768,    // Set memory cost to 32MB
//                 timeCost: 5,          // Set time cost to 5 iterations
//                 parallelism: 1        // Set parallelism to 1 thread
//             });

//             // Prepend the prefix {ARGON2I}
//             const hashedPassword = `{ARGON2I}${finalHashedPassword}`;

//             // Calculate the quota in bytes (MB to bytes)
//             const quotaInBytes = String(Number(quota) * 1048576);

//             // Calculate password expiry date (one year from created date)
//             const createdDate = created ? new Date(created) : new Date();
//             const passwordExpiry = new Date(createdDate);
//             passwordExpiry.setFullYear(passwordExpiry.getFullYear() + 1); // Set expiry one year from created date

//             // Calculate token validity (one minute after created date)
//             const tokenValidity = new Date(createdDate);
//             tokenValidity.setMinutes(tokenValidity.getMinutes() + 1); // Set token validity one minute after creation

//             if (isArray) {
//                 // Handle multiple available domains asynchronously
//                 const overallArray = availedDomains.map(async (domainItem) => {
//                     return pool.query(
//                         `INSERT INTO mailbox (
//                             username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                         RETURNING *`,
//                         [
//                             `${username}@${domainItem}`,
//                             hashedPassword,
//                             name,
//                             `${domainItem}/${maildir}/`,
//                             quotaInBytes,
//                             created || new Date(),
//                             modified || new Date(),
//                             active ?? true,
//                             domainItem,
//                             local_part || null,
//                             phone || '',
//                             email_other || '',
//                             token || '',
//                             tokenValidity.toISOString(),
//                             passwordExpiry.toISOString()
//                         ]
//                     );
//                 });

//                 // Wait for all available domain inserts to finish
//                 const results = await Promise.all(overallArray);

//                 return res.status(201).json({
//                     message: `User Domain Mails created successfully for availed domains. The following domains are not available: ${unavailableDomains.join(', ')}`,
//                     results,
//                     unavailableDomains
//                 });
//             } else {
//                 // Single domain insert for a single domain
//                 const result = await pool.query(
//                     `INSERT INTO mailbox (
//                         username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
//                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//                     RETURNING *`,
//                     [
//                         `${username}@${domain}`,
//                         hashedPassword,
//                         name,
//                         `${domain}/${maildir}/`,
//                         quotaInBytes,
//                         created || new Date(),
//                         modified || new Date(),
//                         active ?? true,
//                         domain || null,
//                         local_part || null,
//                         phone || '',
//                         email_other || '',
//                         token || '',
//                         tokenValidity.toISOString(),
//                         passwordExpiry.toISOString()
//                     ]
//                 );

//                 if (result.rowCount === 1) {
//                     const newUser = result.rows[0];
//                     return res.status(201).json({
//                         message: `User Domain Mail created successfully. The following domains are not available: ${unavailableDomains.join(', ')}`,
//                         user: newUser,
//                         unavailableDomains
//                     });
//                 }
//             }
//         }

//         // Return unavailable domains if none could be created
//         return res.status(400).json({
//             message: `The following domains are not available: ${unavailableDomains.join(', ')}`,
//             unavailableDomains
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


exports.createUserMailFromEmployeeCreate = catchAsyncErrors(async (req, res, next) => {
    try {
        const { username, password, name, maildir, quota, domain, local_part, created, modified, active, phone, email_other, token } = req.body;

        // Fetch available domains from the database
        const resultFirst = await pool.query('SELECT * FROM domain');
        const extractedDomains = resultFirst?.rows?.map((data) => data?.domain);

        let domainArray = [];
        let isArray = false;

        // Check if multiple domains are provided
        if (domain.includes(',')) {
            domainArray = domain.split(','); // Split domain into an array
            isArray = true;
        }

        // Filter available and unavailable domains
        let availedDomains = isArray ? domainArray?.filter((item) => extractedDomains?.includes(item)) : [];
        let availedDomain = !isArray ? extractedDomains?.includes(domain) : "";

        // Collect unavailable domains
        const unavailableDomains = isArray ? domainArray.filter((item) => !extractedDomains.includes(item)) : (availedDomain ? [] : [domain]);

        // Check if username exists for each available domain
        const existingUserResult = isArray
            ? await pool.query('SELECT * FROM mailbox WHERE username = ANY($1::text[])', [domainArray.map((d) => `${username}@${d}`)])
            : await pool.query('SELECT * FROM mailbox WHERE username = $1', [`${username}@${domain}`]);

        // If a username is already availed in any domain
        if (existingUserResult.rowCount > 0) {
            const existingDomains = existingUserResult.rows.map((row) => row.domain);
            const nonExistingDomains = isArray
                ? availedDomains.filter((d) => !existingDomains.includes(d))
                : (availedDomain && !existingDomains.includes(domain)) ? [domain] : [];

            if (nonExistingDomains.length === 0) {
                return res.status(400).json({
                    message: 'Username already exists in all provided domains.',
                    unavailableDomains,
                });
            }

            // Proceed with creating user for non-existing domains
            const results = await Promise.all(
                nonExistingDomains.map(async (domainItem) => {
                    return pool.query(
                        `INSERT INTO mailbox (
                            username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                        RETURNING *`,
                        [
                            `${username}@${domainItem}`,
                            await hashPassword(password),
                            name,
                            `${domainItem}/${maildir}/`,
                            calculateQuotaInBytes(quota),
                            created || new Date(),
                            modified || new Date(),
                            active ?? true,
                            domainItem,
                            local_part || null,
                            phone || '',
                            email_other || '',
                            token || '',
                            calculateTokenValidity(created).toISOString(),
                            calculatePasswordExpiry(created).toISOString(),
                        ]
                    );
                })
            );

            return res.status(201).json({
                message: `User Domain Mails created successfully for some domains. Username already exists for these domains: ${existingDomains.join(', ')}.`,
                results,
                unavailableDomains: existingDomains,
            });
        }

        // If no username is found in any domain, proceed with normal logic
        if (availedDomains.length > 0 || availedDomain) {
            // Hash password and calculate quota, token validity, and password expiry
            const hashedPassword = await hashPassword(password);
            const quotaInBytes = calculateQuotaInBytes(quota);
            const createdDate = created ? new Date(created) : new Date();
            const passwordExpiry = calculatePasswordExpiry(createdDate);
            const tokenValidity = calculateTokenValidity(createdDate);

            if (isArray) {
                const results = await Promise.all(
                    availedDomains.map(async (domainItem) => {
                        return pool.query(
                            `INSERT INTO mailbox (
                                username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                            RETURNING *`,
                            [
                                `${username}@${domainItem}`,
                                hashedPassword,
                                name,
                                `${domainItem}/${maildir}/`,
                                quotaInBytes,
                                created || new Date(),
                                modified || new Date(),
                                active ?? true,
                                domainItem,
                                local_part || null,
                                phone || '',
                                email_other || '',
                                token || '',
                                tokenValidity.toISOString(),
                                passwordExpiry.toISOString(),
                            ]
                        );
                    })
                );

                return res.status(201).json({
                    message: `User Domain Mails created successfully for availed domains. The following domains are not available: ${unavailableDomains.join(', ')}`,
                    results,
                    unavailableDomains,
                });
            } else {
                const result = await pool.query(
                    `INSERT INTO mailbox (
                        username, password, name, maildir, quota, created, modified, active, domain, local_part, phone, email_other, token, token_validity, password_expiry
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    RETURNING *`,
                    [
                        `${username}@${domain}`,
                        hashedPassword,
                        name,
                        `${domain}/${maildir}/`,
                        quotaInBytes,
                        created || new Date(),
                        modified || new Date(),
                        active ?? true,
                        domain || null,
                        local_part || null,
                        phone || '',
                        email_other || '',
                        token || '',
                        tokenValidity.toISOString(),
                        passwordExpiry.toISOString(),
                    ]
                );

                return res.status(201).json({
                    message: `User Domain Mail created successfully. The following domains are not available: ${unavailableDomains.join(', ')}`,
                    user: result.rows[0],
                    unavailableDomains,
                });
            }
        }

        return res.status(400).json({
            message: `The following domains are not available: ${unavailableDomains.join(', ')}`,
            unavailableDomains,
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Helper functions for hashing and calculations
const hashPassword = async (password) => {
    const finalHashedPassword = await argon2.hash(password, {
        type: argon2.argon2i,
        memoryCost: 32768,
        timeCost: 5,
        parallelism: 1
    });
    return `{ARGON2I}${finalHashedPassword}`;
};

const calculateQuotaInBytes = (quota) => {
    return String(Number(quota) * 1048576);
};

const calculatePasswordExpiry = (createdDate) => {
    const passwordExpiry = new Date(createdDate);
    passwordExpiry.setFullYear(passwordExpiry.getFullYear() + 1);
    return passwordExpiry;
};

const calculateTokenValidity = (createdDate) => {
    const tokenValidity = new Date(createdDate);
    tokenValidity.setMinutes(tokenValidity.getMinutes() + 1);
    return tokenValidity;
};





exports.queryCompanyMail = async (req, res) => {
    try {
        const { aggregationPipeline } = req.body;

        const users = await User.aggregate(aggregationPipeline);

        const result = await pool.query('SELECT * FROM mailbox'); // Fetch all users

        let mappedUsers = users?.flatMap((data) => {
            if (data?.companyemail?.includes(',')) {
                let emailArray = data?.companyemail?.split(',');

                return emailArray?.map((item) => ({

                    ...data,
                    companyemail: item

                }))
            } else {
                return data
            }
        }).map((item) => {
            let foundData = result.rows?.find((data) => data?.username === item.companyemail)
            if (foundData) {
                return {
                    ...item, status: 'Created'
                }
            } else {
                return {
                    ...item, status: 'Not Created'
                }
            }
        })

        return res.status(200).json({
            users: mappedUsers,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};


exports.updateDomainMailUser = catchAsyncErrors(async (req, res, next) => {
    const { usernames, password } = req.body;

    // Ensure usernames array and password are provided
    if (!Array.isArray(usernames) || usernames.length === 0 || !password) {
        return res.status(400).json({ message: 'Usernames and password are required' });
    }

    // Hash the password once
    const hashedPassword = await hashPassword(password);

    try {
        // Fetch the users from the database
        const result = await pool.query(
            'SELECT username FROM mailbox WHERE username = ANY($1)',
            [usernames]
        );

        if (result.rowCount > 0) {
            // Extract the found usernames
            const foundUsernames = result.rows.map(row => row.username);

            // Update the password for the found usernames
            const updateResult = await pool.query(
                'UPDATE mailbox SET password = $1 WHERE username = ANY($2)',
                [hashedPassword, foundUsernames]
            );

            if (updateResult.rowCount > 0) {
                return res.status(200).json({
                    message: 'Password updated successfully',
                    updatedCount: updateResult.rowCount
                });
            } else {
                return res.status(500).json({ message: 'Failed to update password' });
            }
        } else {
            return res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
