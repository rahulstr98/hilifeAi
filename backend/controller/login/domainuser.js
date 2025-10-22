const ErrorHandler = require('../../utils/errorhandler');
const catchAsyncErrors = require('../../middleware/catchAsyncError');
const ldap = require('ldapjs');
const checkLDAPSetting = require('../../middleware/LDAPSetting.js');
const LDAPsetting = require('../../model/modules/ldapsetting/LDAPsetting');
const User = require('../../model/login/auth');
const ApplyLeave = require('../../model/modules/leave/applyleave');
const Holiday = require('../../model/modules/setup/holidayModel');
const MyCheckList = require('../../model/modules/interview/Myinterviewchecklist');
const Attendance = require('../../model/modules/attendance/attendance');
const Hirerarchi = require('../../model/modules/setup/hierarchy');
const Designation = require('../../model/modules/designation');
const fs = require('fs');
ldap.debug = true; // Enable debug logging
const moment = require('moment');
const cron = require('node-cron');

const { Hierarchyfilter } = require('../../utils/taskManagerCondition');


// LDAP configuration
// const ldapConfig = {
//     url: 'ldap://WIN-6E7HRLQDV25.HILIFE.AI',
//     bindDN: 'CN=Administrator,CN=Users,DC=HILIFE,DC=AI',
//     bindPassword: 'Hilife.Aiserver@2023',
//     baseDN: 'DC=HILIFE,DC=AI',
//     usersOU: 'OU=TESTING,DC=HILIFE,DC=AI',
// };
function getDojFilter() {
  const today = moment();

  const pastThreeDaysISO = [today.clone().format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];

  const currentDate = today.clone().format('YYYY-MM-DD');

  return {
    $nin: pastThreeDaysISO,
    $lte: currentDate,
  };
}

exports.createUserInLDAP = catchAsyncErrors(async (req, res, next) => {
  // const ldapConfig = {
  //   url: "ldaps://HILIFE.AI:636",
  //   bindDN: "CN=Administrator,CN=Users,DC=HILIFE,DC=AI",
  //   bindPassword: "Hilife.Aiserver@2023",
  //   baseDN: "DC=HILIFE,DC=AI",
  //   usersOU: "OU=TESTING,DC=HILIFE,DC=AI",
  // };

  const ldapConfig = {
    url: 'ldaps://TTSBS.COM:636',
    bindDN: 'CN=TTSLDAPADMIN,CN=Users,DC=TTSBS,DC=COM',
    bindPassword: 'TTSBSServer$202325#',
    baseDN: 'DC=TTSBS,DC=COM',
    usersOU: 'OU=Checking,DC=TTSBS,DC=COM',
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: {
      rejectUnauthorized: false, // Avoid TLS errors
    },
  });

  try {
    const { cn, sn, sAMAccountName, userPassword } = req.body;

    if (!cn || !sn || !sAMAccountName || !userPassword) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    // Sanitize and validate username
    const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedSAMAccountName.length > 20) {
      return next(new ErrorHandler('sAMAccountName must not exceed 20 characters', 400));
    }

    // Encode password in UTF-16LE
    const passwordBuffer = Buffer.from(`"${userPassword}"`, 'utf16le');

    const newUser = {
      cn: cn,
      sn: sn,
      sAMAccountName: sanitizedSAMAccountName,
      objectClass: ['top', 'person', 'organizationalPerson', 'user'],
      userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
      displayName: `${cn} ${sn}`,
      mail: `${sanitizedSAMAccountName}@hilife.ai`,
      givenName: cn,
      userAccountControl: '512',
      unicodePwd: passwordBuffer, // Correct password field for AD
    };

    console.log('New user object:', newUser);

    client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (bindErr) => {
      if (bindErr) {
        console.error('❌ LDAP Bind Failed:', bindErr);
        return next(new ErrorHandler('LDAP Bind failed', 500));
      }

      console.log('✅ LDAP Bind Successful!');

      const userDN = `CN=${cn},${ldapConfig.usersOU}`;
      console.log('User DN:', userDN);

      client.add(userDN, newUser, (addErr) => {
        if (addErr) {
          console.error('❌ Error adding user:', addErr);
          return next(new ErrorHandler('Failed to add user to LDAP', 500));
        }

        console.log('✅ User added successfully to LDAP');

        client.unbind((unbindErr) => {
          if (unbindErr) {
            console.error('❌ Error unbinding from LDAP:', unbindErr);
            return next(new ErrorHandler('Error unbinding from LDAP', 500));
          }

          console.log('✅ Unbound from LDAP');
          return res.status(200).json({ message: 'User added successfully to LDAP' });
        });
      });
    });
  } catch (err) {
    console.error('❌ Internal Server Error:', err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

exports.createUserInLDAPWithOu = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
  });
  console.log(req.body);
  try {
    const { cn, sn, sAMAccountName, userPassword, ou } = req.body;

    if (!cn || !sn || !sAMAccountName || !userPassword || !ou) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    // Sanitize sAMAccountName
    const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedSAMAccountName.length > 20) {
      return next(new ErrorHandler('sAMAccountName must not exceed 20 characters', 400));
    }

    // Encode password in UTF-16LE
    const passwordBuffer = Buffer.from(`"${userPassword}"`, 'utf16le');

    // Bind to LDAP
    client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, async (bindErr) => {
      if (bindErr) {
        console.error('❌ LDAP Bind Failed:', bindErr);
        return next(new ErrorHandler('LDAP Bind failed', 500));
      }
      console.log('✅ LDAP Bind Successful!');

      // **Step 1: Search for the correct OU DN**
      const searchOptions = {
        scope: 'sub', // Search within nested OUs
        filter: `(ou=${ou})`,
        attributes: ['distinguishedName'],
      };

      client.search(ldapConfig.baseDN, searchOptions, (searchErr, resNew) => {
        if (searchErr) {
          console.error('❌ LDAP Search Error:', searchErr);
          return next(new ErrorHandler('Error searching for OU', 500));
        }

        let foundOU = null;

        resNew.on('searchEntry', (entry) => {
          console.log(' Found Entry:', entry.pojo); // Debugging Output
          // entries.push(entry.pojo.objectName);
          foundOU = entry.pojo.objectName;
        });

        resNew.on('end', () => {
          if (!foundOU) {
            console.error('❌ OU Not Found:', ou);
            return next(new ErrorHandler('OU Not Found', 400));
          }

          console.log('✅ OU Found:', foundOU);

          // **Step 2: Construct correct User DN**
          const userDN = `CN=${cn},${foundOU}`;
          console.log('User DN:', userDN);

          const newUser = {
            cn: cn,
            sn: sn,
            sAMAccountName: sanitizedSAMAccountName,
            objectClass: ['top', 'person', 'organizationalPerson', 'user'],
            userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
            displayName: `${cn} ${sn}`,
            mail: `${sanitizedSAMAccountName}@hilife.ai`,
            givenName: cn,
            userAccountControl: ldapData[0]?.useraccountcontrol,
            unicodePwd: passwordBuffer,
          };

          // **Step 3: Add user in the correct OU**
          client.add(userDN, newUser, (addErr) => {
            if (addErr) {
              console.error('❌ Error adding user:', addErr);
              return next(new ErrorHandler('Failed to add user to LDAP', 500));
            }

            console.log('✅ User added successfully to LDAP');

            client.unbind((unbindErr) => {
              if (unbindErr) {
                console.error('❌ Error unbinding from LDAP:', unbindErr);
                return next(new ErrorHandler('Error unbinding from LDAP', 500));
              }

              console.log('✅ Unbound from LDAP');
              return res.status(200).json({ message: 'User added successfully to LDAP' });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('❌ Internal Server Error:', err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

exports.deleteUserByUsernameFromLDAP = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  // Create LDAPS Client with TLS options
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
    reconnect: true, // Enable auto-reconnect
  });
  try {
    if (!ldapData.length) {
      return next(new ErrorHandler('LDAP settings not found', 500));
    }

    const { username } = req.body;
    if (!username) {
      return next(new ErrorHandler('Username (sAMAccountName) is required', 400));
    }

    // Error handling for connection failures
    client.on('error', (err) => {
      console.error('LDAP Connection Error:', err);
    });

    // Bind to LDAP Server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    // Search for the user to get the DN (Distinguished Name)
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['dn'],
    };

    let userDN = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Failed to search LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          userDN = entry.objectName; // Get the Distinguished Name (DN)
        });

        res.on('end', () => {
          if (!userDN) {
            return reject(new ErrorHandler('User not found in LDAP', 404));
          }
          console.log('✅ LDAPS Search completed - Found user:', userDN);
          resolve();
        });

        res.on('error', (searchErr) => {
          console.error('LDAP Search Error:', searchErr);
          return reject(new ErrorHandler('Error searching LDAP for user', 500));
        });
      });
    });

    console.log('️ Deleting User:', userDN);

    // Delete the user from LDAP
    await new Promise((resolve, reject) => {
      client.del(userDN, (err) => {
        if (err) {
          console.error('LDAP Delete Error:', err);
          return reject(new ErrorHandler('Failed to delete user from LDAP', 500));
        }
        console.log('✅ User deleted successfully:', userDN);
        resolve();
      });
    });
  } catch (err) {
    console.error('Unhandled Error:', err);
    return next(new ErrorHandler(err.message || 'Internal Server Error', 500));
  } finally {
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('LDAP Unbind Error:', unbindErr);
        else console.log('✅ LDAPS Connection closed');
      });
    }
  }

  return res.status(200).json({ message: 'User deleted successfully from LDAP' });
});

exports.createOrganizationalUnit = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();
  if (!ldapData.length) {
    return next(new ErrorHandler('LDAP configuration not found', 500));
  }

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
    reconnect: true, // Enables auto-reconnect if needed
  });

  client.on('error', (err) => {
    console.error('❌ LDAP Client Error:', err.message);
    if (err.code === 'ECONNRESET') {
      console.warn('⚠️ Connection reset by LDAP server. Retrying...');
    }
  });

  const bindPromise = () => {
    return new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Error:', err.message);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });
  };

  try {
    const { ou } = req.body;
    if (!ou) {
      return next(new ErrorHandler('OU name is required', 400));
    }

    const ouDN = `OU=${ou},${ldapConfig.baseDN}`;
    console.log('Target OU DN:', ouDN);

    await bindPromise();

    // Check if the OU already exists
    const ouExists = await new Promise((resolve, reject) => {
      const searchOptions = {
        scope: 'sub',
        filter: `(ou=${ou})`,
      };

      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search Error:', err.message);
          return reject(new ErrorHandler('LDAP search failed', 500));
        }

        let found = false;
        res.on('searchEntry', (entry) => {
          console.log(' OU exists:', entry.object);
          found = true;
        });

        res.on('end', () => resolve(found));
        res.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr.message);
          reject(new ErrorHandler('LDAP search error', 500));
        });
      });
    });

    if (ouExists) {
      return res.status(400).json({ message: 'OU already exists' });
    }

    console.log('✅ Creating OU...');

    // Create the new OU
    await new Promise((resolve, reject) => {
      const ouEntry = {
        objectClass: ['top', 'organizationalUnit'],
        ou: ou,
      };

      client.add(ouDN, ouEntry, (err) => {
        if (err) {
          console.error('❌ Error creating OU:', err.message);
          return reject(new ErrorHandler('Failed to create OU', 500));
        }
        console.log('✅ OU created successfully');
        resolve();
      });
    });

    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });

    return res.status(201).json({ message: 'OU created successfully' });
  } catch (err) {
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
      });
    }
    return next(err);
  }
});

// exports.editOrganizationalUnit = catchAsyncErrors(async (req, res, next) => {
//   const ldapData = await LDAPsetting.find();

//   const ldapConfig = {
//     url: ldapData[0]?.ldapurl.startsWith("ldaps://")
//       ? ldapData[0]?.ldapurl
//       : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, "")}`,
//     bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
//     bindPassword: ldapData[0]?.ldappassword,
//     baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
//   };

//   const client = ldap.createClient({
//     url: ldapConfig.url,
//     tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
//     reconnect: true, // Enables auto-reconnect
//   });

//   client.on("error", (err) => {
//     console.error("❌ LDAP Client Error:", err.message);
//   });

//   const { oldOu, newOu } = req.body;
//   if (!oldOu || !newOu) {
//     return next(
//       new ErrorHandler("Both old and new OU names are required", 400)
//     );
//   }

//   const oldOUDN = `OU=${oldOu},${ldapConfig.baseDN}`;
//   const newOUDN = `OU=${newOu},${ldapConfig.baseDN}`;

//   console.log(" Attempting to rename OU...");
//   console.log("Old OU DN:", oldOUDN);
//   console.log("New OU DN:", newOUDN);

//   // Promisified LDAP Bind
//   const bindPromise = () =>
//     new Promise((resolve, reject) => {
//       client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
//         if (err) {
//           console.error("❌ LDAP Bind Error:", err.message);
//           return reject(new ErrorHandler("Failed to bind to LDAP server", 500));
//         }
//         console.log("✅ LDAP Bind successful");
//         resolve();
//       });
//     });

//   // Promisified LDAP Modify DN
//   const renameOUPromise = () =>
//     new Promise((resolve, reject) => {
//       client.modifyDN(oldOUDN, `OU=${newOu}`, (err) => {
//         if (err) {
//           console.error("❌ Error renaming OU:", err.message);
//           return reject(
//             new ErrorHandler("Failed to rename OU (Possible conflict)", 500)
//           );
//         }
//         console.log("✅ OU renamed successfully");
//         resolve();
//       });
//     });

//   try {
//     await bindPromise();
//     await renameOUPromise();

//     client.unbind((unbindErr) => {
//       if (unbindErr)
//         console.error("❌ Error unbinding LDAP client:", unbindErr.message);
//     });

//     return res.status(200).json({ message: "OU renamed successfully" });
//   } catch (err) {
//     client.unbind((unbindErr) => {
//       if (unbindErr)
//         console.error("❌ Error unbinding LDAP client:", unbindErr.message);
//     });
//     return next(err);
//   }
// });

exports.editOrganizationalUnit = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
    reconnect: true,
  });

  client.on('error', (err) => {
    console.error('❌ LDAP Client Error:', err.message);
  });

  const { oldOu, newOu } = req.body;
  if (!oldOu || !newOu) {
    return next(new ErrorHandler('Both old and new OU names are required', 400));
  }

  console.log(' Searching for OU:', oldOu);

  //  Step 1: Find the OU's Full DN in LDAP
  const searchOU = () =>
    new Promise((resolve, reject) => {
      const opts = {
        filter: `(ou=${oldOu})`,
        scope: 'sub', // Search in all OUs
        attributes: ['dn'], // Fetch Distinguished Name
      };

      const entries = [];

      client.search(ldapConfig.baseDN, opts, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search Error:', err.message);
          return reject(new ErrorHandler('Error searching for OU', 500));
        }

        res.on('searchEntry', (entry) => {
          console.log(' Found Entry:', entry.pojo); // Debugging Output
          entries.push(entry.pojo.objectName);
        });

        res.on('end', (result) => {
          if (entries.length === 0) {
            console.error('❌ OU not found:', oldOu);
            return reject(new ErrorHandler(`OU '${oldOu}' not found in LDAP`, 404));
          }

          console.log('✅ Found OU DN:', entries[0]);
          resolve(entries[0]); // Return the first found DN
        });

        res.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr.message);
          return reject(new ErrorHandler('LDAP search failed', 500));
        });
      });
    });

  //  Step 2: Rename the OU
  const renameOU = (oldOUDN) =>
    new Promise((resolve, reject) => {
      client.modifyDN(oldOUDN, `OU=${newOu}`, (err) => {
        if (err) {
          console.error('❌ Error renaming OU:', err.message);
          return reject(new ErrorHandler('Failed to rename OU (Possible conflict)', 500));
        }
        console.log('✅ OU renamed successfully');
        resolve();
      });
    });

  try {
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Error:', err.message);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    const oldOUDN = await searchOU();
    await renameOU(oldOUDN);

    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });

    return res.status(200).json({ message: 'OU renamed successfully' });
  } catch (err) {
    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });
    return next(err);
  }
});

exports.getOrganizationalUnits = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
    reconnect: true, // Enables auto-reconnect if needed
  });

  // Handle client errors
  client.on('error', (err) => {
    console.error('❌ LDAP Client Error:', err.message);
    if (err.code === 'ECONNRESET') {
      console.warn('⚠️ Connection reset by LDAP server. Retrying...');
    }
  });

  // Promisify LDAP bind
  const bindPromise = () => {
    return new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Error:', err.message);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });
  };

  // Promisify LDAP search
  const searchPromise = () => {
    return new Promise((resolve, reject) => {
      const options = {
        scope: 'sub', // Search all subdirectories
        filter: '(objectClass=organizationalUnit)', // Look only for OUs
        attributes: ['dn', 'ou', 'name'], // Retrieve Distinguished Name and OU name
      };

      client.search(ldapConfig.baseDN, options, (searchErr, searchRes) => {
        if (searchErr) {
          console.error('❌ LDAP Search Error:', searchErr.message);
          return reject(new ErrorHandler('Failed to search LDAP', 500));
        }

        const ouList = [];

        searchRes.on('searchEntry', (entry) => {
          const dn = entry.objectName; // Get the Distinguished Name (DN)
          const ouName = entry.attributes.find((attr) => attr.type === 'ou')?.values[0] || entry.attributes.find((attr) => attr.type === 'name')?.values[0] || dn;

          ouList.push({ dn, ouName });
        });

        searchRes.on('end', () => {
          // console.log("✅ LDAP Search Complete. Found OUs:", ouList);
          resolve(ouList);
        });

        searchRes.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr.message);
          reject(new ErrorHandler('Error searching LDAP for OUs', 500));
        });
      });
    });
  };

  try {
    await bindPromise();
    const ouList = await searchPromise();
    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });
    return res.status(200).json({ ouList });
  } catch (err) {
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
      });
    }
    return next(err);
  }
});

exports.deleteOrganizationalUnit = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certs
    reconnect: true, // Enables auto-reconnect
  });

  client.on('error', (err) => {
    console.error('❌ LDAP Client Error:', err.message);
  });

  const { ou } = req.body;
  if (!ou) {
    return next(new ErrorHandler('OU name is required', 400));
  }

  const ouDN = `OU=${ou},${ldapConfig.baseDN}`;
  console.log(' Target OU DN:', ouDN);

  // Promisified LDAP Bind
  const bindPromise = () =>
    new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Error:', err.message);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

  // Promisified LDAP Search
  const searchOUPromise = () =>
    new Promise((resolve, reject) => {
      const searchOptions = {
        scope: 'sub',
        filter: `(ou=${ou})`,
      };

      let found = false;

      const search = client.search(ldapConfig.baseDN, searchOptions, (err, resSearch) => {
        if (err) {
          console.error('❌ LDAP Search Error:', err.message);
          return reject(new ErrorHandler('LDAP search failed', 500));
        }

        resSearch.on('searchEntry', (entry) => {
          console.log('✅ OU found:', entry.object);
          found = true;
        });

        resSearch.on('end', () => {
          if (!found) {
            console.log('❌ OU does not exist, cannot delete.');
            return reject(new ErrorHandler('OU not found', 404));
          }
          resolve();
        });

        resSearch.on('error', (searchErr) => {
          console.error('❌ Error searching for OU:', searchErr.message);
          return reject(new ErrorHandler('LDAP search error', 500));
        });
      });
    });

  // Promisified LDAP Delete
  const deleteOUPromise = () =>
    new Promise((resolve, reject) => {
      client.del(ouDN, (err) => {
        if (err) {
          console.error('❌ Error deleting OU:', err.message);
          return reject(new ErrorHandler('Failed to delete OU', 500));
        }
        console.log('✅ OU deleted successfully');
        resolve();
      });
    });

  try {
    await bindPromise();
    await searchOUPromise();
    await deleteOUPromise();

    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });

    return res.status(200).json({ message: 'OU deleted successfully' });
  } catch (err) {
    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
    });
    return next(err);
  }
});

exports.getAllUsersFromLDAP = catchAsyncErrors(async (req, res, next) => {
  // LDAP configuration

  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  // Create LDAP client
  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    // Bind to the LDAP server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('LDAP Bind successful');
        resolve();
      });
    });

    // Search options - Filter only users & required attributes
    const searchOptions = {
      filter: '(objectClass=user)', // Fetch only user accounts
      scope: 'sub',
      // attributes: [
      //   "sAMAccountName",
      //   "cn",
      //   "mail",
      //   "memberOf",
      //   "userAccountControl",
      //   "password"
      // ], // Only required fields
      attributes: ['*'],
      timeLimit: 10,
    };

    // Search LDAP
    const users = await new Promise((resolve, reject) => {
      const userList = [];

      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Error searching LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          const user = {};
          entry.attributes.forEach((attr) => {
            user[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
          });
          userList.push(user);
        });

        res.on('error', (searchErr) => {
          console.error('LDAP Search Error:', searchErr);
          return reject(new ErrorHandler('Error searching LDAP for users', 500));
        });

        res.on('end', () => resolve(userList));
      });
    });

    client.unbind(); // Unbind from LDAP server after search
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    client.unbind();
    console.error(err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

exports.updateUserAccountControlInLDAP = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    const { username } = req.body;

    if (!username) {
      return next(new ErrorHandler('Username (sAMAccountName) is required', 400));
    }

    // 1️⃣ **Bind to LDAP Server**
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // 2️⃣ **Search for the User**
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['dn', 'userAccountControl'],
    };

    let userDN = null;
    let userAccountControl = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Failed to search LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          console.log('✅ Found LDAP Entry:', entry.pojo);

          userDN = entry.objectName;
          userAccountControl = parseInt(entry.attributes.find((attr) => attr.type === 'userAccountControl')?.values[0], 10);

          console.log(` userDN: ${userDN}`);
          console.log(` userAccountControl: ${userAccountControl}`);

          resolve(); // Resolve after finding the user
        });

        res.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr);
          reject(new ErrorHandler('Error searching LDAP for user', 500));
        });

        res.on('end', (result) => {
          if (!userDN) {
            reject(new ErrorHandler('Username not found in LDAP', 404));
          }
        });
      });
    });

    // 3️⃣ **Check if Modification is Needed**
    if (userAccountControl !== 546) {
      return next(new ErrorHandler(`User already has userAccountControl ${userAccountControl}, no update needed`, 400));
    }

    // 4️⃣ **Modify the `userAccountControl`**
    await modifyUserAccountControl(client, userDN, 514);

    client.unbind(); // **Unbind after successful operation**
    return res.status(200).json({ message: 'User account control updated successfully' });
  } catch (err) {
    client.unbind();
    console.error(err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

// **Helper function to modify `userAccountControl`**
async function modifyUserAccountControl(client, userDN, newValue) {
  const change = new ldap.Change({
    operation: 'replace',
    modification: new ldap.Attribute({
      type: 'userAccountControl',
      values: [`${newValue}`], // Ensure it's a string inside an array
    }),
  });

  return new Promise((resolve, reject) => {
    client.modify(userDN, [change], (err) => {
      if (err) {
        console.error('❌ LDAP Modify Error:', err);
        reject(new ErrorHandler('Failed to modify userAccountControl', 500));
      } else {
        console.log(`✅ Successfully updated userAccountControl to ${newValue} for ${userDN}`);
        resolve();
      }
    });
  });
}

async function getPasswordPolicy(client, baseDN) {
  const searchOptions = {
    scope: 'base', // Search only the base object
    filter: '(objectClass=domainDNS)', // Filter for the domainDNS object
    attributes: ['minPwdLength', 'pwdProperties', 'pwdHistoryLength', 'maxPwdAge', 'minPwdAge', 'lockoutThreshold', 'lockoutDuration'],
  };

  return new Promise((resolve, reject) => {
    client.search(baseDN, searchOptions, (err, res) => {
      if (err) {
        console.error('❌ LDAP Search Error:', err);
        return reject(new ErrorHandler('Failed to retrieve password policy', 500));
      }

      let policy = {};

      res.on('searchEntry', (entry) => {
        // Extract password policy attributes
        policy.minPwdLength = entry.attributes.find((attr) => attr.type === 'minPwdLength')?.values[0];
        policy.pwdProperties = entry.attributes.find((attr) => attr.type === 'pwdProperties')?.values[0];
        policy.pwdHistoryLength = entry.attributes.find((attr) => attr.type === 'pwdHistoryLength')?.values[0];
        policy.maxPwdAge = entry.attributes.find((attr) => attr.type === 'maxPwdAge')?.values[0];
        policy.minPwdAge = entry.attributes.find((attr) => attr.type === 'minPwdAge')?.values[0];
        policy.lockoutThreshold = entry.attributes.find((attr) => attr.type === 'lockoutThreshold')?.values[0];
        policy.lockoutDuration = entry.attributes.find((attr) => attr.type === 'lockoutDuration')?.values[0];

        resolve(policy);
      });

      res.on('error', (searchErr) => {
        console.error('❌ LDAP Search Error:', searchErr);
        reject(new ErrorHandler('Error retrieving password policy', 500));
      });

      res.on('end', (result) => {
        if (result.status !== 0) {
          reject(new ErrorHandler('Failed to retrieve password policy', 500));
        }
      });
    });
  });
}

async function checkPasswordStatus(client, userDN) {
  const searchOptions = {
    scope: 'base',
    filter: '(objectClass=user)',
    attributes: ['pwdLastSet', 'userAccountControl', 'msDS-UserPasswordExpiryTimeComputed', 'lockoutTime'],
  };

  const entry = await new Promise((resolve, reject) => {
    client.search(userDN, searchOptions, (err, res) => {
      if (err) {
        reject(new ErrorHandler('Failed to retrieve user attributes', 500));
      }

      res.on('searchEntry', (entry) => {
        resolve(entry);
      });

      res.on('error', (searchErr) => {
        reject(new ErrorHandler('Error retrieving user attributes', 500));
      });
    });
  });

  // Check pwdLastSet
  const pwdLastSet = entry.attributes.find((attr) => attr.type === 'pwdLastSet')?.values[0];
  if (pwdLastSet === '0') {
    console.log('Password has never been set. User must change it at next login.');
  } else {
    const pwdLastSetDate = new Date(parseInt(pwdLastSet, 10) / 10000 - 11644473600000);
    console.log('Password last set on:', pwdLastSetDate.toISOString());
  }

  // Check userAccountControl
  const userAccountControl = parseInt(entry.attributes.find((attr) => attr.type === 'userAccountControl')?.values[0], 10);
  if (userAccountControl & 0x800000) {
    console.log('Password has expired.');
  } else if (userAccountControl & 0x10000) {
    console.log('Password does not expire.');
  } else {
    console.log('Password is active and will expire based on policy.');
  }

  // Check msDS-UserPasswordExpiryTimeComputed
  const passwordExpiryTime = entry.attributes.find((attr) => attr.type === 'msDS-UserPasswordExpiryTimeComputed')?.values[0];
  if (passwordExpiryTime) {
    const expiryDate = new Date(parseInt(passwordExpiryTime, 10) / 10000 - 11644473600000);
    console.log('Password will expire on:', expiryDate.toISOString());
  } else {
    console.log('Password expiry time not available.');
  }

  // Check lockoutTime
  const lockoutTime = entry.attributes.find((attr) => attr.type === 'lockoutTime')?.values[0];
  if (lockoutTime === '0') {
    console.log('Account is not locked.');
  } else {
    console.log('Account is locked. Unlock it by setting lockoutTime to 0.');
  }
}

exports.unlockUserAccount = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    const { username } = req.body;
    if (!username) {
      return next(new ErrorHandler('Username (sAMAccountName) is required', 400));
    }

    // 1️⃣ **Bind to LDAP Server**
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // 2️⃣ **Search for the User**
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['dn', 'userAccountControl'],
    };

    let userDN = null;
    let userAccountControl = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Failed to search LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          console.log('✅ Found LDAP Entry:', entry.pojo || entry.object);

          userDN = entry.objectName; // Use `entry.objectName` for DN
          userAccountControl = parseInt(entry.attributes.find((attr) => attr.type === 'userAccountControl')?.values[0], 10);

          console.log(` userDN: ${userDN}`);
          console.log(` userAccountControl: ${userAccountControl}`);

          resolve();
        });

        res.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr);
          reject(new ErrorHandler('Error searching LDAP for user', 500));
        });

        res.on('end', (result) => {
          if (!userDN) {
            reject(new ErrorHandler('Username not found in LDAP', 404));
          }
        });
      });
    });

    // 3️⃣ **Check if Modification is Needed**
    if (!userAccountControl || userAccountControl === 512) {
      return next(new ErrorHandler(`User is already unlocked`, 400));
    }

    // 4️⃣ **Modify the `userAccountControl`**
    await modifyUserAccountControlNew(client, userDN, 512);

    // 5️⃣ **Unbind from LDAP**
    client.unbind();

    return res.status(200).json({ message: 'User account unlocked successfully' });
  } catch (err) {
    console.error(err);
    client.unbind();
    return next(new ErrorHandler('Internal server error', 500));
  }
});

//  **Helper Function to Modify userAccountControl**
const modifyUserAccountControlNew = async (client, userDN, newValue) => {
  return new Promise((resolve, reject) => {
    const changes = [
      new ldap.Change({
        operation: 'replace',
        modification: { pwdLastSet: ['0'] }, // ✅ Correct format
      }),
      new ldap.Change({
        operation: 'replace',
        modification: { userAccountControl: ['512'] }, // ✅ Correct format
      }),
    ];

    client.modify(userDN, changes, (modifyErr) => {
      if (modifyErr) {
        console.error('❌ Error modifying userAccountControl:', modifyErr);
        return reject(new ErrorHandler('Failed to unlock user account', 500));
      }

      console.log('✅ User account unlocked successfully');
      resolve();
    });
  });
};

exports.unlockUser = async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  if (!ldapData.length) {
    return res.status(500).json({ message: 'LDAP settings not found' });
  }

  const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

  const ldapConfig = {
    url: ldapUrl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  // Create LDAPS client
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
  });

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Bind to LDAP Server (LDAPS)
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAPS Bind failed:', err);
          return reject(new Error('LDAPS Bind failed'));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    // Search for the user DN
    const searchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`, // Search by sAMAccountName
      attributes: ['dn'],
    };

    const userDN = await new Promise((resolve, reject) => {
      let found = false;
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        res.on('searchEntry', (entry) => {
          if (entry && entry.objectName) {
            console.log('✅ Found user:', entry.objectName);
            found = true;
            resolve(entry.objectName); // Resolve with the user's DN
          } else {
            reject(new Error('Invalid search entry'));
          }
        });

        res.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('LDAP Search error'));
        });

        res.on('end', () => {
          if (!found) reject(new Error('User not found'));
        });
      });
    });

    console.log(' User DN:', userDN);

    // Unlock user by setting `lockoutTime` to 0
    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'lockoutTime',
        values: ['0'], // Unlocks the account
      }),
    });

    await new Promise((resolve, reject) => {
      client.modify(userDN, change, (err) => {
        if (err) {
          console.error('❌ Error unlocking user:', err);
          return reject(new Error('Failed to unlock user'));
        }
        console.log('✅ User unlocked successfully');
        resolve();
      });
    });

    return res.status(200).json({ message: 'User unlocked successfully' });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    // Ensure client unbinds even if an error occurs
    if (client) {
      try {
        // Add a small delay before unbinding to ensure all operations are complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Unbind the client
        client.unbind((err) => {
          if (err) console.error('❌ Error unbinding from LDAP:', err);
          console.log('✅ LDAP Client unbound successfully');
        });
      } catch (unbindErr) {
        console.error('❌ Unbind Error:', unbindErr);
      }
    }
  }
};

exports.getUserAttributes = async (req, res) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    console.log(' Searching for User:', username);

    // Bind to LDAP
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          reject(new Error('LDAP Bind failed'));
        } else {
          console.log('✅ LDAP Bind successful');
          resolve();
        }
      });
    });

    // Search user by sAMAccountName
    const searchOptions = {
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`, // Match by username
      scope: 'sub', // Search all OUs
      attributes: ['*'], // Fetch all attributes
    };

    const userAttributes = await new Promise((resolve, reject) => {
      let userData = null;

      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          reject(new Error('LDAP Search failed'));
          return;
        }

        res.on('searchEntry', (entry) => {
          console.log('✅ Found user:', entry.object);
          userData = entry.object;
        });

        res.on('error', (err) => {
          console.error('❌ LDAP Search Error:', err);
          reject(new Error('LDAP Search Error'));
        });

        res.on('end', () => {
          if (userData) {
            console.log('✅ Search completed successfully');
            resolve(userData);
          } else {
            console.log('❌ No user found in the search results');
            reject(new Error('User not found'));
          }
        });
      });
    });

    // Unbind after search
    client.unbind((err) => {
      if (err) {
        console.error('❌ Error unbinding from LDAP:', err);
      }
    });

    return res.status(200).json({ message: 'User details fetched', user: userAttributes });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    // Ensure the client is always unbound
    client.unbind((err) => {
      if (err) {
        console.error('❌ Error unbinding from LDAP:', err);
      }
    });
  }
};

exports.getUserFromLDAP = catchAsyncErrors(async (req, res, next) => {
  // LDAP configuration
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  // Create LDAP client
  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    const { username } = req.body; // Get username from request body
    if (!username) {
      return next(new ErrorHandler('Username is required', 400));
    }

    // Bind to the LDAP server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('LDAP Bind successful');
        resolve();
      });
    });

    // Search options - Filter for a specific user by sAMAccountName
    const searchOptions = {
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`, // Match by username
      scope: 'sub',
      attributes: ['*'], // Fetch all attributes
      timeLimit: 10,
    };

    // Search LDAP for the user
    const user = await new Promise((resolve, reject) => {
      let userData = null;

      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Error searching LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          userData = {};
          entry.attributes.forEach((attr) => {
            userData[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
          });
        });

        res.on('error', (searchErr) => {
          console.error('LDAP Search Error:', searchErr);
          return reject(new ErrorHandler('Error searching LDAP for user', 500));
        });

        res.on('end', () => {
          if (userData) {
            resolve(userData);
          } else {
            reject(new ErrorHandler('User not found', 404));
          }
        });
      });
    });

    client.unbind(); // Unbind from LDAP server after search
    return res.status(200).json({ user });
  } catch (err) {
    client.unbind();
    console.error(err);
    return next(new ErrorHandler(err.message || 'Internal server error', 500));
  }
});

exports.authenticateUser = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const { username, password } = req.body; // Get username & password from request

  if (!username || !password) {
    return next(new ErrorHandler('Username and password are required', 400));
  }

  // Construct user DN (Distinguished Name)
  const userDN = `CN=${username},OU=testing,${ldapConfig.baseDN}`;

  // Create LDAP client
  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    // Try to bind with user credentials (Authentication)
    await new Promise((resolve, reject) => {
      client.bind(userDN, password, (err) => {
        if (err) {
          console.error('❌ Authentication Failed:', err);
          return reject(new ErrorHandler('Invalid username or password', 401));
        }
        console.log('✅ Authentication Successful');
        resolve();
      });
    });

    client.unbind(); // Unbind after authentication
    return res.status(200).json({ message: 'Authentication successful', username });
  } catch (err) {
    client.unbind();
    return next(new ErrorHandler(err.message || 'Authentication failed', 401));
  }
});

exports.resetUserPassword = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return next(new ErrorHandler('Username and new password are required', 400));
  }

  const client = ldap.createClient({
    url: ldapConfig.url,
    reconnect: true, // Auto-reconnect if needed
    tlsOptions: { rejectUnauthorized: false }, // Ignore SSL cert issues
  });

  try {
    // **STEP 1: BIND TO LDAP AS ADMIN**
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Admin Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP', 500));
        }
        console.log('✅ LDAP Admin Bind Successful');
        resolve();
      });
    });

    // **STEP 2: SEARCH FOR USER DN**
    const userFilter = `(sAMAccountName=${username})`;
    let userDN = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, { filter: userFilter, scope: 'sub' }, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search Error:', err);
          return reject(new ErrorHandler('LDAP search failed', 500));
        }

        res.on('searchEntry', (entry) => {
          if (entry.dn) {
            userDN = entry.dn.toString(); // Convert DN to string
            console.log('✅ User Found:', userDN);
          }
        });

        res.on('end', () => {
          if (!userDN) {
            console.error(`❌ User not found in LDAP: ${username}`);
            return reject(new ErrorHandler('User not found in LDAP', 404));
          }
          resolve();
        });
      });
    });

    if (!userDN) {
      console.error(`❌ User ${username} not found`);
      return next(new ErrorHandler('User not found in LDAP', 404));
    }

    // **STEP 3: RESET PASSWORD**
    const encodedPassword = Buffer.from(`"${newPassword}"`, 'utf16le');

    const changePassword = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'unicodePwd',
        values: [encodedPassword],
      }),
    });

    // **STEP 4: Force password change at next login**
    const changePwdExpiry = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'pwdLastSet',
        values: ['0'], // Forces password change at next login
      }),
    });

    // **STEP 5: Ensure user account is enabled**
    const enableAccount = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        values: ['512'], // Normal account (enabled)
      }),
    });

    await new Promise((resolve, reject) => {
      client.modify(userDN, [changePassword, changePwdExpiry, enableAccount], (err) => {
        if (err) {
          console.error('❌ LDAP Password Reset Error:', err);
          return reject(new ErrorHandler('Failed to reset password', 500));
        }
        console.log('✅ Password Reset & Account Enabled Successfully');
        resolve();
      });
    });

    // **STEP 6: Graceful Unbind to Avoid ECONNRESET**
    setTimeout(() => {
      try {
        client.unbind((err) => {
          if (err) {
            console.error('❌ LDAP Unbind Error:', err);
          } else {
            console.log('✅ LDAP Connection Closed Successfully');
          }
        });
      } catch (unbindErr) {
        console.error('❌ Unbind Exception:', unbindErr);
      }
    }, 1000); // Delay unbind to allow proper cleanup

    return res.status(200).json({
      success: true,
      message: 'Password reset successful, user must change password at next login',
    });
  } catch (err) {
    console.error('❌ Error Occurred:', err);
    client.unbind();
    return next(new ErrorHandler(err.message || 'Internal Server Error', 500));
  }
});

exports.getLdapSchema = async (req, res) => {
  const ldapConfig = {
    url: 'ldap://192.168.85.4', // LDAP server
    bindDN: 'CN=Administrator,CN=Users,DC=HILIFEAI,DC=IN',
    bindPassword: 'Hilife.aiserver@2023',
    schemaDN: 'CN=Schema,CN=Configuration,DC=HILIFEAI,DC=IN', // Schema location
  };

  const client = ldap.createClient({ url: ldapConfig.url });

  try {
    console.log(' Connecting to LDAP Server...');

    // Bind to LDAP
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed: ' + err.message));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // Define search options
    const searchOptions = {
      filter: '(objectClass=*)', // Fetch all schema attributes
      scope: 'sub', // Subtree search
      attributes: ['*'], // Retrieve all attributes
      sizeLimit: 1000, // Prevent overload
      paged: { pageSize: 200 }, // Enable pagination
    };

    console.log(' Searching LDAP Schema at:', ldapConfig.schemaDN);

    const schemaAttributes = await new Promise((resolve, reject) => {
      let schemaData = [];

      const searchCallback = (err, res) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed: ' + err.message));
        }

        res.on('searchEntry', (entry) => {
          console.log('✅ Found Schema Entry:', entry.object || entry.json); // Debugging
          if (entry.object || entry.json) {
            schemaData.push(entry.object || entry.json);
          }
        });

        res.on('error', (err) => {
          console.error('❌ LDAP Search Error:', err);
          return reject(new Error('LDAP Search Error: ' + err.message));
        });

        res.on('end', () => {
          console.log(' LDAP Search Completed. Entries found:', schemaData.length);
          if (schemaData.length === 0) {
            return reject(new Error('No schema entries found'));
          }
          resolve(schemaData.filter((item) => item !== null && item !== undefined)); // Remove null values
        });
      };

      client.search(ldapConfig.schemaDN, searchOptions, searchCallback);
    });

    return res.status(200).json({ message: 'Schema details fetched', schema: schemaAttributes });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    client.unbind((err) => {
      if (err) {
        console.error('❌ Error unbinding from LDAP:', err);
      } else {
        console.log(' LDAP Connection Closed');
      }
    });
  }
};

exports.checkIfRolesExist = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({ url: ldapConfig.url });

  client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (bindErr) => {
    if (bindErr) {
      console.error('LDAP Bind Failed:', bindErr);
      client.unbind();
      return next(new ErrorHandler('LDAP Bind failed', 500));
    }

    console.log('LDAP Bind successful');

    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=group)', // Ensure this filter matches the correct object type
      attributes: ['cn'], // We only need the 'cn' (common name) attribute for roles
    };

    let roles = [];

    client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
      if (err) {
        console.error('LDAP Search Error:', err);
        client.unbind();
        return next(new ErrorHandler('LDAP Search failed', 500));
      }

      searchRes.on('searchEntry', (entry) => {
        console.dir(entry.pojo, { depth: null }); // Log the raw entry as a plain object

        // Use entry.pojo to access the LDAP entry attributes
        if (entry.pojo && entry.pojo.attributes) {
          const cnAttribute = entry.pojo.attributes.find((attr) => attr.type === 'cn');
          if (cnAttribute && cnAttribute.values && cnAttribute.values.length > 0) {
            const role = cnAttribute.values[0]; // Extract the role (group name)
            roles.push(role);
            console.log('Role found:', role);
          } else {
            console.log("'cn' attribute is missing or empty in entry:", entry.pojo);
          }
        } else {
          console.log('Entry object or attributes are undefined for:', entry.pojo);
        }
      });

      searchRes.on('error', (searchErr) => {
        console.error('LDAP Search Error:', searchErr);
        client.unbind();
        return next(new ErrorHandler('Error searching LDAP', 500));
      });

      searchRes.on('end', () => {
        client.unbind((unbindErr) => {
          if (unbindErr) {
            console.error('Unbind Error:', unbindErr);
            return next(new ErrorHandler('Error unbinding from LDAP', 500));
          }
          console.log('LDAP Unbound Successfully');

          // Return the roles in the response
          res.status(200).json({ success: true, roles });
        });
      });
    });
  });
});

exports.lockedAndUnlockedUsersList = async (req, res, next) => {
  try {
    const { type, registrationstatus = [], employementtype = [], accountstatus = [], status = [], company = [], branch = [], unit = [], team = [], department = [], designation = [], employee = [] } = req.body;

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    const aggregationPipeline = [
      {
        $match: {
          resonablestatus: { $nin: resonablestatusarray },
        },
      },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ];
    const localusers = await User.aggregate(aggregationPipeline);
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.getLockedAndUnlockedUsers = async (req, res, next) => {
  try {
    const ldapData = await LDAPsetting.find();

    if (!ldapData.length) {
      return res.status(400).json({ message: 'LDAP configuration not found' });
    }

    // Determine if using LDAP or LDAPS
    const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

    const ldapConfig = {
      url: ldapUrl,
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: {
        rejectUnauthorized: false, // Set to `true` in production with valid certificates
      },
    });

    // Bind to LDAP Server securely
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          reject(new Error('Failed to authenticate with LDAP server'));
        } else {
          console.log('✅ LDAP Bind successful');
          resolve();
        }
      });
    });

    // Search for all users
    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)', // Search for all users
      attributes: ['dn', 'sAMAccountName', 'lockoutTime', 'ou'],
      sizeLimit: 1000, // Prevent overload
      paged: { pageSize: 200 }, // Enable pagination
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          reject(new Error('Failed to retrieve users from LDAP'));
          return;
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {};

              user.dn = entry.pojo.objectName;
              user.username = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName')?.values?.[0] || 'Unknown';

              const lockoutTimeAttr = entry.pojo.attributes.find((attr) => attr.type === 'lockoutTime');
              const lockoutTime = lockoutTimeAttr?.values?.[0] ? parseInt(lockoutTimeAttr.values[0], 10) : 0;
              user.isLocked = lockoutTime > 0;

              user.ou = entry.pojo.attributes.find((attr) => attr.type === 'ou')?.values?.[0] || extractOUFromDN(user.dn);

              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing LDAP entry:', entryError);
            reject(new Error('Error processing LDAP user data'));
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('Error during LDAP search'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAP Search completed');
          resolve(userList);
        });
      });
    });

    // Categorize users by OU and lock status
    const categorizedUsers = users.reduce((acc, user) => {
      const ou = user.ou;
      const status = user.isLocked ? 'locked' : 'unlocked';

      if (!acc[ou]) {
        acc[ou] = { locked: [], unlocked: [] };
      }

      acc[ou][status].push(user);
      return acc;
    }, {});

    // Ensure client unbinds properly
    client.unbind((err) => {
      if (err) console.error('❌ Error unbinding from LDAP:', err);
    });

    // Extract users into a flat array
    const extractUsers = (data) => {
      return Object.values(data.users).flatMap((group) => [...(group.locked || []), ...(group.unlocked || [])]);
    };

    const usersFinal = extractUsers({ users: categorizedUsers });

    // Extract and filter input values
    const { type, employementtype = [], company = [], branch = [], unit = [], team = [], employee = [], organizationunits = [], accounttype = [] } = req.body;

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    // Fetch local user data
    const localusers = await User.aggregate([
      { $match: { resonablestatus: { $nin: resonablestatusarray } } },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ]);

    // Merge LDAP and local user data
    let mappedDatas = localusers
      .map((data) => {
        let foundData = usersFinal.find((item) => item?.username === data?.username);
        return {
          ...data,
          ...(foundData || {}),
          lockedstatus: foundData?.isLocked ? 'Locked' : 'Unlocked',
          employeementtype: data?.workmode === 'Internship' ? 'Internship' : 'Employee',
        };
      })
      .filter((filterData) => filterData?.ou);

    // Apply filters
    let filteredFinalDatas = mappedDatas.filter((data) => {
      return (
        company.includes(data?.company) &&
        organizationunits.includes(data?.ou) &&
        accounttype.includes(data?.lockedstatus) &&
        (type === 'Individual'
          ? branch.includes(data?.branch) && unit.includes(data?.unit) && team.includes(data?.team) && employee.includes(data?.companyname)
          : type === 'Team'
            ? branch.includes(data?.branch) && unit.includes(data?.unit) && team.includes(data?.team)
            : type === 'Unit'
              ? branch.includes(data?.branch) && unit.includes(data?.unit)
              : type === 'Branch'
                ? branch.includes(data?.branch)
                : true) // Default to "Company"
      );
    });

    return res.status(200).json({ users: filteredFinalDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

function extractOUFromDN(dn) {
  const ouRegex = /OU=([^,]+)/i; // Regex to match OU in the DN
  const match = dn.match(ouRegex);
  return match ? match[1] : 'Unknown'; // Return the OU or "Unknown" if not found
}

exports.lockUser = async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  if (!ldapData.length) {
    return res.status(500).json({ message: 'LDAP settings not found' });
  }

  const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

  const ldapConfig = {
    url: ldapUrl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  // Create LDAPS client
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
  });

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Bind to LDAP Server (LDAPS)
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAPS Bind failed:', err);
          return reject(new Error('LDAPS Bind failed'));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    // Search for the user DN
    const searchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`, // Search by sAMAccountName
      attributes: ['dn'],
    };

    const userDN = await new Promise((resolve, reject) => {
      let found = false;
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        res.on('searchEntry', (entry) => {
          if (entry && entry.objectName) {
            console.log('✅ Found user:', entry.objectName);
            found = true;
            resolve(entry.objectName); // Resolve with the user's DN
          } else {
            reject(new Error('Invalid search entry'));
          }
        });

        res.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('LDAP Search error'));
        });

        res.on('end', () => {
          if (!found) reject(new Error('User not found'));
        });
      });
    });

    console.log(' User DN:', userDN);

    // Lock user by setting `lockoutTime` to a non-zero value
    const lockoutTime = Date.now() * 10000 + 116444736000000000; // Convert current time to 100-nanosecond intervals
    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'lockoutTime',
        values: [lockoutTime.toString()], // Locks the account
      }),
    });

    await new Promise((resolve, reject) => {
      client.modify(userDN, change, (err) => {
        if (err) {
          console.error('❌ Error locking user:', err);
          return reject(new Error('Failed to lock user'));
        }
        console.log('✅ User locked successfully');
        resolve();
      });
    });

    return res.status(200).json({ message: 'User locked successfully' });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    // Ensure client unbinds even if an error occurs
    if (client) {
      try {
        // Add a small delay before unbinding to ensure all operations are complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Unbind the client
        client.unbind((err) => {
          if (err) console.error('❌ Error unbinding from LDAP:', err);
          console.log('✅ LDAP Client unbound successfully');
        });
      } catch (unbindErr) {
        console.error('❌ Unbind Error:', unbindErr);
      }
    }
  }
};

// exports.getDisabledAndEnabledUsers = async (req, res, next) => {
//   const ldapData = await LDAPsetting.find();

//   const ldapConfig = {
//     url: ldapData[0]?.ldapurl,
//     bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
//     bindPassword: ldapData[0]?.ldappassword,
//     baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
//   };

//   const client = ldap.createClient({ url: ldapConfig.url });

//   try {
//     // Bind to LDAP Server
//     await new Promise((resolve, reject) => {
//       client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
//         if (err) {
//           console.error("❌ LDAP Bind failed:", err);
//           reject(new Error("LDAP Bind failed"));
//         } else {
//           console.log("✅ LDAP Bind successful");
//           resolve();
//         }
//       });
//     });

//     // Search for all users
//     const searchOptions = {
//       scope: "sub",
//       filter: "(objectClass=user)", // Search for all users
//       attributes: ["dn", "sAMAccountName", "userAccountControl", "ou"],
//     };

//     const users = await new Promise((resolve, reject) => {
//       const userList = [];
//       client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
//         if (err) {
//           console.error("❌ LDAP Search failed:", err);
//           reject(new Error("LDAP Search failed"));
//           return;
//         }

//         searchRes.on("searchEntry", (entry) => {
//           try {
//             if (entry.pojo && entry.pojo.attributes) {
//               const user = {};
//               user.dn = entry.pojo.objectName;

//               // Extract sAMAccountName
//               const samAccountNameAttr = entry.pojo.attributes.find(
//                 (attr) => attr.type === "sAMAccountName"
//               );
//               user.username = samAccountNameAttr?.values?.[0] || "Unknown";

//               // Extract userAccountControl
//               const userAccountControlAttr = entry.pojo.attributes.find(
//                 (attr) => attr.type === "userAccountControl"
//               );
//               const userAccountControl = userAccountControlAttr?.values?.[0]
//                 ? parseInt(userAccountControlAttr.values[0], 10)
//                 : 512; // Default to enabled if missing

//               user.isDisabled = (userAccountControl & 2) !== 0; // ACCOUNTDISABLE flag check

//               // Extract OU
//               const ouAttr = entry.pojo.attributes.find(
//                 (attr) => attr.type === "ou"
//               );
//               user.ou = ouAttr?.values?.[0] || extractOUFromDN(user.dn);

//               userList.push(user);
//             }
//           } catch (entryError) {
//             console.error("❌ Error processing search entry:", entryError);
//             reject(new Error("Error processing search entry"));
//           }
//         });

//         searchRes.on("error", (err) => {
//           console.error("❌ LDAP Search error:", err);
//           reject(new Error("LDAP Search error"));
//         });

//         searchRes.on("end", () => {
//           console.log("✅ LDAP Search completed");
//           resolve(userList);
//         });
//       });
//     });

//     // Categorize users by OU and lock status
//     const categorizedUsers = users.reduce((acc, user) => {
//       const ou = user.ou;
//       const status = user.isDisabled ? "disabled" : "enabled";

//       if (!acc[ou]) {
//         acc[ou] = { enabled: [], disabled: [] };
//       }

//       acc[ou][status].push(user);
//       return acc;
//     }, {});

//     // Unbind the client
//     client.unbind((err) => {
//       if (err) console.error("❌ Error unbinding from LDAP:", err);
//     });

//     const extractUsers = (data) => {
//       let usersArray = [];
//       Object.values(data.users).forEach((group) => {
//         if (group.enabled) {
//           usersArray = usersArray.concat(group.enabled);
//         }
//         if (group.disabled) {
//           usersArray = usersArray.concat(group.disabled);
//         }
//       });
//       return usersArray;
//     };

//     const usersFinal = extractUsers({ users: categorizedUsers });

//     const {
//       type,
//       employementtype = [],
//       company = [],
//       branch = [],
//       unit = [],
//       team = [],
//       employee = [],
//       organizationunits = [],
//       accounttype = [],
//     } = req.body;

//     const resonablestatusarray = [
//       "Absconded",
//       "Hold",
//       "Terminate",
//       "Releave Employee",
//       "Not Joined",
//       "Postponed",
//       "Rejected",
//       "Closed",
//     ];

//     const aggregationPipeline = [
//       {
//         $match: {
//           resonablestatus: { $nin: resonablestatusarray },
//         },
//       },
//       {
//         $project: {
//           company: 1,
//           branch: 1,
//           unit: 1,
//           team: 1,
//           department: 1,
//           designation: 1,
//           empcode: 1,
//           username: 1,
//           companyname: 1,
//           workmode: 1,
//           originalpassword: 1,
//         },
//       },
//     ];
//     const localusers = await User.aggregate(aggregationPipeline);

//     let mappedDatas = localusers
//       ?.map((data) => {
//         let foundData = usersFinal?.find(
//           (item) => item?.username === data?.username
//         );
//         return {
//           ...data,
//           ...(foundData || {}),
//           accountstatus: foundData?.isDisabled ? "Disabled" : "Enabled",
//           employeementtype:
//             data?.workmode === "Internship" ? "Internship" : "Employee",
//         };
//       })
//       .filter((filterData) => filterData?.ou);

//     let filteredFinalDatas = mappedDatas?.filter((data) => {
//       return (
//         company?.includes(data?.company) &&
//         organizationunits?.includes(data?.ou) &&
//         accounttype?.includes(data?.accountstatus) &&
//         (type === "Individual"
//           ? branch?.includes(data?.branch) &&
//             unit?.includes(data?.unit) &&
//             team?.includes(data?.team) &&
//             employee?.includes(data?.companyname)
//           : type === "Team"
//           ? branch?.includes(data?.branch) &&
//             unit?.includes(data?.unit) &&
//             team?.includes(data?.team)
//           : type === "Unit"
//           ? branch?.includes(data?.branch) && unit?.includes(data?.unit)
//           : type === "Branch"
//           ? branch?.includes(data?.branch)
//           : true) // For "Company", no extra conditions are needed
//       );
//     });

//     return res.status(200).json({ users: filteredFinalDatas });
//   } catch (err) {
//     console.error("❌ Internal Error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Internal server error" });
//   }
// };

exports.getDisabledAndEnabledUsers = async (req, res, next) => {
  try {
    const ldapData = await LDAPsetting.find();
    if (!ldapData.length) {
      return next(new ErrorHandler('LDAP settings not found', 500));
    }

    // Ensure LDAP URL starts with ldaps://
    const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

    const ldapConfig = {
      url: ldapUrl,
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
    });

    // Handle unexpected connection errors
    client.on('error', (err) => {
      console.error('❌ LDAP Client Error:', err);
    });

    // Bind to LDAP server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed'));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // Search for users
    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)',
      attributes: ['dn', 'sAMAccountName', 'userAccountControl', 'ou'],
      sizeLimit: 1000, // Prevent overload
      paged: { pageSize: 200 }, // Enable pagination
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {};
              user.dn = entry.pojo.objectName;

              const samAccountNameAttr = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName');
              user.username = samAccountNameAttr?.values?.[0] || 'Unknown';

              const userAccountControlAttr = entry.pojo.attributes.find((attr) => attr.type === 'userAccountControl');
              const userAccountControl = userAccountControlAttr?.values?.[0] ? parseInt(userAccountControlAttr.values[0], 10) : 512;

              user.isDisabled = (userAccountControl & 2) !== 0; // ACCOUNTDISABLE flag check

              const ouAttr = entry.pojo.attributes.find((attr) => attr.type === 'ou');
              user.ou = ouAttr?.values?.[0] || extractOUFromDN(user.dn);

              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing search entry:', entryError);
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('LDAP Search error'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAP Search completed');
          resolve(userList);
        });
      });
    });

    // Categorize users
    const categorizedUsers = users.reduce((acc, user) => {
      const ou = user.ou;
      const status = user.isDisabled ? 'disabled' : 'enabled';

      if (!acc[ou]) {
        acc[ou] = { enabled: [], disabled: [] };
      }

      acc[ou][status].push(user);
      return acc;
    }, {});

    // Unbind the client properly
    await new Promise((resolve, reject) => {
      client.unbind((err) => {
        if (err) {
          console.error('❌ Error unbinding from LDAP:', err);
          reject(new Error('LDAP Unbind Error'));
        } else {
          console.log('✅ LDAP Unbind successful');
          resolve();
        }
      });
    });

    const extractUsers = (data) => {
      let usersArray = [];
      Object.values(data.users).forEach((group) => {
        if (group.enabled) {
          usersArray = usersArray.concat(group.enabled);
        }
        if (group.disabled) {
          usersArray = usersArray.concat(group.disabled);
        }
      });
      return usersArray;
    };

    const usersFinal = extractUsers({ users: categorizedUsers });

    const { type, employementtype = [], company = [], branch = [], unit = [], team = [], employee = [], organizationunits = [], accounttype = [] } = req.body;

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    const aggregationPipeline = [
      {
        $match: {
          resonablestatus: { $nin: resonablestatusarray },
        },
      },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ];
    const localusers = await User.aggregate(aggregationPipeline);

    let mappedDatas = localusers
      ?.map((data) => {
        let foundData = usersFinal?.find((item) => item?.username === data?.username);
        return {
          ...data,
          ...(foundData || {}),
          accountstatus: foundData?.isDisabled ? 'Disabled' : 'Enabled',
          employeementtype: data?.workmode === 'Internship' ? 'Internship' : 'Employee',
        };
      })
      .filter((filterData) => filterData?.ou);

    let filteredFinalDatas = mappedDatas?.filter((data) => {
      return (
        company?.includes(data?.company) &&
        organizationunits?.includes(data?.ou) &&
        accounttype?.includes(data?.accountstatus) &&
        (type === 'Individual'
          ? branch?.includes(data?.branch) && unit?.includes(data?.unit) && team?.includes(data?.team) && employee?.includes(data?.companyname)
          : type === 'Team'
            ? branch?.includes(data?.branch) && unit?.includes(data?.unit) && team?.includes(data?.team)
            : type === 'Unit'
              ? branch?.includes(data?.branch) && unit?.includes(data?.unit)
              : type === 'Branch'
                ? branch?.includes(data?.branch)
                : true)
      );
    });

    return res.status(200).json({ users: filteredFinalDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.disableDomainUser = async (req, res) => {
  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Ensure LDAPS is used
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    reconnect: true, // Auto-reconnect for stability
    tlsOptions: { rejectUnauthorized: false }, // Ignore SSL certificate validation (adjust as needed)
  });

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // **STEP 1: BIND TO LDAP SERVER**
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed'));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // **STEP 2: SEARCH FOR USER**
    const searchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
      attributes: ['dn', 'sAMAccountName', 'userAccountControl'],
    };

    let userDN = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        res.on('searchEntry', (entry) => {
          if (entry.pojo && entry.pojo.objectName) {
            userDN = entry.pojo.objectName;
            console.log('✅ User Found:', userDN);
          }
        });

        res.on('end', () => {
          if (!userDN) {
            console.error('❌ User not found:', username);
            return reject(new Error('User not found'));
          }
          resolve();
        });

        res.on('error', (searchErr) => {
          console.error('❌ LDAP Search Error:', searchErr);
          reject(new Error('LDAP Search error'));
        });
      });
    });

    // **STEP 3: DISABLE USER**
    const ACCOUNT_DISABLED = '514'; // Disable account flag

    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        values: [ACCOUNT_DISABLED],
      }),
    });

    await new Promise((resolve, reject) => {
      client.modify(userDN, change, (err) => {
        if (err) {
          console.error('❌ Error disabling user:', err);
          return reject(new Error('Failed to disable user'));
        }
        console.log('✅ User disabled successfully');
        resolve();
      });
    });

    // **STEP 4: GRACEFUL UNBIND**
    setTimeout(() => {
      client.unbind((err) => {
        if (err) {
          console.error('❌ LDAP Unbind Error:', err);
        } else {
          console.log('✅ LDAP Connection Closed Successfully');
        }
      });
    }, 1000);

    return res.status(200).json({ message: 'User disabled successfully' });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    client.unbind();
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.enableDomainUser = async (req, res) => {
  let client; // Declare client outside the try block for cleanup in finally

  try {
    const ldapData = await LDAPsetting.find();
    if (!ldapData.length) {
      return res.status(500).json({ message: 'LDAP configuration not found' });
    }

    const ldapConfig = {
      url: ldapData[0]?.ldapurl.replace(/^ldap:\/\//, 'ldaps://'),
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    const tlsOptions = {
      rejectUnauthorized: false, // Set to true if using a valid CA certificate
    };

    client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions,
      reconnect: true, // Enable automatic reconnect on failures
    });

    client.on('error', (err) => {
      console.error('❌ LDAP Client Error:', err);
      if (err.code === 'ECONNRESET') {
        console.error('❌ Connection reset by server. Retrying...');
      }
    });

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Secure Bind to LDAP Server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAPS Bind failed:', err);
          return reject(new Error('LDAPS Bind failed: ' + err.message));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    // Search for the user by username
    const searchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
      attributes: ['dn', 'sAMAccountName', 'userAccountControl'],
    };

    const userDN = await new Promise((resolve, reject) => {
      let found = false;
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAPS Search failed:', err);
          return reject(new Error('LDAPS Search failed: ' + err.message));
        }

        res.on('searchEntry', (entry) => {
          try {
            console.dir(entry.pojo, { depth: null });

            if (entry.pojo && entry.pojo.objectName) {
              found = true;
              resolve(entry.pojo.objectName);
            }
          } catch (entryError) {
            console.error('❌ Error processing search entry:', entryError);
            reject(new Error('Error processing search entry: ' + entryError.message));
          }
        });

        res.on('error', (searchErr) => {
          console.error('❌ LDAPS Search error:', searchErr);
          reject(new Error('LDAPS Search error: ' + searchErr.message));
        });

        res.on('end', () => {
          if (!found) {
            console.error('❌ User not found');
            reject(new Error('User not found'));
          }
        });
      });
    });

    console.log(' User DN:', userDN);

    const ACCOUNT_ENABLED = ldapData[0]?.useraccountcontrol; // Value to enable account

    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        values: [ACCOUNT_ENABLED],
      }),
    });

    // Perform the modification
    await new Promise((resolve, reject) => {
      client.modify(userDN, change, (err) => {
        if (err) {
          console.error('❌ Error enabling user:', err);
          return reject(new Error('Failed to enable user: ' + err.message));
        }
        console.log('✅ User enabled successfully');
        resolve();
      });
    });

    return res.status(200).json({ message: 'User enabled successfully' });
  } catch (err) {
    console.error('❌ Internal Error:', err);

    // Handle specific LDAP errors
    if (err.code === 'ECONNRESET') {
      return res.status(500).json({ message: 'LDAP connection reset. Please try again.' });
    }

    if (err.message.includes('Bind failed')) {
      return res.status(401).json({ message: 'Invalid LDAP credentials' });
    }

    if (err.message.includes('User not found')) {
      return res.status(404).json({ message: 'User not found in LDAP' });
    }

    if (err.message.includes('Failed to enable user')) {
      return res.status(500).json({ message: 'Failed to enable user in LDAP' });
    }

    // Generic error response
    return res.status(500).json({ message: err.message || 'Internal server error' });
  } finally {
    // Ensure client unbinds even if an error occurs
    if (client) {
      client.unbind((err) => {
        if (err) console.error('❌ Error unbinding from LDAPS:', err);
        else console.log('✅ LDAP Connection Closed Successfully');
      });
    }
  }
};

exports.createUsersInLDAP = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  if (!ldapData.length) {
    return next(new ErrorHandler('LDAP settings not found', 500));
  }

  // Ensure the URL starts with `ldaps://`
  const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

  const ldapConfig = {
    url: ldapUrl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  console.log(req.body);

  // Create LDAPS client with TLS options
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
  });

  const users = req?.body?.users; // Expecting an array of user objects

  if (!Array.isArray(users) || users.length === 0) {
    return next(new ErrorHandler('Request body must be an array of users', 400));
  }

  client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, async (bindErr) => {
    if (bindErr) {
      console.error('Error binding to LDAP:', bindErr);
      return next(new ErrorHandler('LDAP Bind failed', 500));
    }

    console.log('LDAP Bind successful');
    const results = [];

    for (const user of users) {
      const { cn, sn, sAMAccountName, userPassword, ous } = user;

      if (!cn || !sn || !sAMAccountName || !userPassword || !ous) {
        results.push({
          cn,
          status: 'failed',
          error: 'Missing required fields',
        });
        continue;
      }

      // ✅ Ensure sAMAccountName is valid
      const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 20);
      const userSearchFilter = `(sAMAccountName=${sanitizedSAMAccountName})`;

      console.log(`Searching for user ${cn} with filter: ${userSearchFilter}`);

      try {
        // 1. Search for existing user across the entire domain
        const foundUserDN = await new Promise((resolve, reject) => {
          let foundDN = null;
          client.search(ldapConfig.baseDN, { filter: userSearchFilter, scope: 'sub' }, (err, res) => {
            if (err) {
              console.error(`Error searching for user ${cn}:`, err);
              reject(err);
              return;
            }

            res.on('searchEntry', (entry) => {
              console.dir(entry.pojo, { depth: null }); // Debugging: Log the full entry structure

              if (entry.pojo && entry.pojo.attributes) {
                const user = {};
                user.dn = entry.pojo.objectName; // Extract the DN

                // Extract sAMAccountName and other attributes
                const samAccountNameAttr = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName');
                if (samAccountNameAttr) {
                  user.sAMAccountName = samAccountNameAttr.values[0]; // Extract the first value
                }

                console.log(`Found user:`, user); // Debugging: Log the extracted user
                foundDN = user.dn; // Use the DN for deletion
              }
            });

            res.on('end', () => {
              if (!foundDN) {
                console.log(`User ${cn} not found in LDAP.`);
              }
              resolve(foundDN || null);
            });

            res.on('error', (searchErr) => {
              console.error(`Search error for user ${cn}:`, searchErr);
              reject(searchErr);
            });
          });
        });

        // ✅ If user is found, remove them from the current OU
        if (foundUserDN) {
          console.log(`User ${cn} found in LDAP. Removing from current OU...`);
          await new Promise((resolve, reject) => {
            client.del(foundUserDN, (delErr) => {
              if (delErr) {
                console.error(`Error deleting user ${cn} from ${foundUserDN}:`, delErr);
                results.push({
                  cn,
                  ou: foundUserDN,
                  status: 'failed',
                  error: delErr.message,
                });
                reject(delErr);
              } else {
                console.log(`User ${cn} removed from ${foundUserDN}`);
                resolve();
              }
            });
          });
        }

        // 2. Add user to the new OU
        const passwordBuffer = Buffer.from(`"${userPassword}"`, 'utf16le');
        const newUser = {
          cn,
          sn,
          sAMAccountName: sanitizedSAMAccountName,
          // userPassword: encodedPassword,
          objectClass: ['top', 'person', 'organizationalPerson', 'user'],
          mail: `${sanitizedSAMAccountName}@hilife.ai`,
          givenName: cn,
          userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
          displayName: `${cn} ${sn}`,
          userAccountControl: '512',
          unicodePwd: passwordBuffer,
        };

        const userOU = `OU=${ous},${ldapConfig.baseDN}`;
        const userDN = `CN=${cn},${userOU}`;

        await new Promise((resolve, reject) => {
          client.add(userDN, newUser, (addErr) => {
            if (addErr) {
              console.error(`Error adding user ${cn} to ${ous}:`, addErr);
              results.push({
                cn,
                ou: ous,
                status: 'failed',
                error: addErr.message,
              });
              reject(addErr);
            } else {
              console.log(`User ${cn} added successfully to ${ous}`);
              results.push({ cn, ou: ous, status: 'success' });
              resolve();
            }
          });
        });
      } catch (error) {
        console.log(`Skipping ${cn} due to error, but continuing...`);
        results.push({ cn, status: 'failed', error: error.message });
      }
    }

    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error('Error unbinding from LDAP:', unbindErr);
        return next(new ErrorHandler('Error unbinding from LDAP', 500));
      }
      console.log('Unbound from LDAP');

      return res.status(200).json({
        message: 'User creation results',
        results,
      });
    });
  });
});

exports.deleteUsersInLDAP = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  if (!ldapData.length) {
    return next(new ErrorHandler('LDAP settings not found', 500));
  }

  // Ensure the URL starts with `ldaps://`
  const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

  const ldapConfig = {
    url: ldapUrl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  console.log(req.body);

  // Create LDAPS client with TLS options
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
  });

  const users = req.body.users; // Expecting an array of user objects with sAMAccountName

  if (!Array.isArray(users) || users.length === 0) {
    return next(new ErrorHandler('Request body must be an array of users', 400));
  }

  client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, async (bindErr) => {
    if (bindErr) {
      console.error('Error binding to LDAP:', bindErr);
      return next(new ErrorHandler('LDAP Bind failed', 500));
    }

    console.log('LDAP Bind successful');
    const results = [];

    for (const user of users) {
      const { sAMAccountName } = user;

      if (!sAMAccountName) {
        results.push({
          sAMAccountName,
          status: 'failed',
          error: 'Missing sAMAccountName',
        });
        continue;
      }

      // ✅ Ensure sAMAccountName is valid
      const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 20);
      const userSearchFilter = `(sAMAccountName=${sanitizedSAMAccountName})`;

      console.log(`Searching for user with sAMAccountName: ${sanitizedSAMAccountName}`);

      try {
        // 1. Search for existing user across the entire domain
        const foundUserDN = await new Promise((resolve, reject) => {
          let foundDN = null;
          client.search(ldapConfig.baseDN, { filter: userSearchFilter, scope: 'sub' }, (err, res) => {
            if (err) {
              console.error(`Error searching for user ${sAMAccountName}:`, err);
              reject(err);
              return;
            }

            res.on('searchEntry', (entry) => {
              console.dir(entry.pojo, { depth: null }); // Debugging: Log the full entry structure

              if (entry.pojo && entry.pojo.attributes) {
                const user = {};
                user.dn = entry.pojo.objectName; // Extract the DN

                // Extract sAMAccountName and other attributes
                const samAccountNameAttr = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName');
                if (samAccountNameAttr) {
                  user.sAMAccountName = samAccountNameAttr.values[0]; // Extract the first value
                }

                console.log(`Found user:`, user); // Debugging: Log the extracted user
                foundDN = user.dn; // Use the DN for deletion
              }
            });

            res.on('end', () => {
              if (!foundDN) {
                console.log(`User with sAMAccountName ${sAMAccountName} not found in LDAP.`);
              }
              resolve(foundDN || null);
            });

            res.on('error', (searchErr) => {
              console.error(`Search error for user ${sAMAccountName}:`, searchErr);
              reject(searchErr);
            });
          });
        });

        // ✅ If user is found, remove them
        if (foundUserDN) {
          console.log(`User with sAMAccountName ${sAMAccountName} found in LDAP. Removing...`);
          await new Promise((resolve, reject) => {
            client.del(foundUserDN, (delErr) => {
              if (delErr) {
                console.error(`Error deleting user ${sAMAccountName} from ${foundUserDN}:`, delErr);
                results.push({
                  sAMAccountName,
                  status: 'failed',
                  error: delErr.message,
                });
                reject(delErr);
              } else {
                console.log(`User ${sAMAccountName} removed from ${foundUserDN}`);
                results.push({
                  sAMAccountName,
                  status: 'success',
                  dn: foundUserDN,
                });
                resolve();
              }
            });
          });
        } else {
          results.push({
            sAMAccountName,
            status: 'failed',
            error: 'User not found in LDAP',
          });
        }
      } catch (error) {
        console.log(`Skipping ${sAMAccountName} due to error, but continuing...`);
        results.push({
          sAMAccountName,
          status: 'failed',
          error: error.message,
        });
      }
    }

    client.unbind((unbindErr) => {
      if (unbindErr) {
        console.error('Error unbinding from LDAP:', unbindErr);
        return next(new ErrorHandler('Error unbinding from LDAP', 500));
      }
      console.log('Unbound from LDAP');

      return res.status(200).json({
        message: 'User deletion results',
        results,
      });
    });
  });
});

exports.getUsersByAccountControl = catchAsyncErrors(async (req, res, next) => {
  // Fetch LDAP configuration from the database
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Ensure it's LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    tlsOptions: {
      rejectUnauthorized: false, // Set to true if using a valid CA certificate
    },
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: ldapConfig.tlsOptions,
  });

  try {
    // Bind to LDAPS Server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAPS Bind failed:', err);
          reject(new Error('LDAPS Bind failed'));
        } else {
          console.log('✅ LDAPS Bind successful');
          resolve();
        }
      });
    });

    // Search for all users
    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)', // Search for all users
      attributes: ['dn', 'sAMAccountName', 'userAccountControl', 'ou', 'sn', 'cn'],
      paged: {
        pageSize: 100, // Adjust the page size as needed
        pagePause: false,
      },
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAPS Search failed:', err);
          reject(new Error('LDAPS Search failed'));
          return;
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {};
              user.dn = entry.pojo.objectName;

              // Extract sAMAccountName
              const samAccountNameAttr = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName');
              user.username = samAccountNameAttr?.values?.[0] || 'Unknown';

              // Extract userAccountControl
              const userAccountControlAttr = entry.pojo.attributes.find((attr) => attr.type === 'userAccountControl');
              user.userAccountControl = userAccountControlAttr?.values?.[0] ? parseInt(userAccountControlAttr.values[0], 10) : 512; // Default to enabled if missing

              // Extract OU
              const ouAttr = entry.pojo.attributes.find((attr) => attr.type === 'ou');
              user.ou = ouAttr?.values?.[0] || extractOUFromDN(user.dn);

              // Extract sn (Surname)
              const snAttr = entry.pojo.attributes.find((attr) => attr.type === 'sn');
              user.sn = snAttr?.values?.[0] || 'Unknown';

              // Extract cn (Common Name)
              const cnAttr = entry.pojo.attributes.find((attr) => attr.type === 'cn');
              user.cn = cnAttr?.values?.[0] || 'Unknown';

              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing search entry:', entryError);
            reject(new Error('Error processing search entry'));
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAPS Search error:', err);
          reject(new Error('LDAPS Search error'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAPS Search completed');
          resolve(userList);
        });
      });
    });

    // Categorize users by userAccountControl
    const categorizedUsers = users.reduce((acc, user) => {
      const accountControl = user.userAccountControl.toString();
      if (!acc[accountControl]) {
        acc[accountControl] = [];
      }
      acc[accountControl].push(user);
      return acc;
    }, {});

    // Unbind the client
    client.unbind((err) => {
      if (err) console.error('❌ Error unbinding from LDAPS:', err);
    });

    // Extract users based on userAccountControl values
    const extractUsers = (data) => {
      let usersArray = [];
      Object.values(data.users).forEach((group) => {
        usersArray = usersArray.concat(group);
      });
      return usersArray;
    };

    const usersFinal = extractUsers({ users: categorizedUsers });

    const { type, status = [], company = [], branch = [], unit = [], team = [], employee = [], organizationunits = [], accounttype = [] } = req.body;
    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    const aggregationPipeline = [
      {
        $match: {
          resonablestatus: { $nin: resonablestatusarray },
        },
      },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ];
    const localusers = await User.aggregate(aggregationPipeline);
    let mappedDatas = usersFinal?.map((data) => {
      let foundData = localusers?.find((item) => item?.username === data?.username);
      return {
        ...data,
        ...(foundData || {}),
        accountstatus:
          data?.userAccountControl === 512
            ? 'Normal account + Password Required'
            : data?.userAccountControl === 544
              ? 'Normal account + Password Not Required'
              : data?.userAccountControl === 66048
                ? 'Password never expires'
                : data?.userAccountControl === 4096
                  ? 'Workstation Trust Account'
                  : data?.userAccountControl === 514
                    ? 'Account Disabled'
                    : data?.userAccountControl === 532480
                      ? 'Domain Controller Account'
                      : data?.userAccountControl === 546
                        ? 'Server Trust Account'
                        : '',
        employeementtype: foundData?.workmode === 'Internship' ? 'Internship' : 'Employee',
        matchstatus: foundData ? 'Matched' : 'Mismatched',
      };
    });

    let filteredFinalDatas = mappedDatas?.filter((data) => {
      if (status?.length === 1 && status?.includes('Mismatched')) {
        return !data?.companyname;
      } else if (status?.includes('Matched') && status?.includes('Mismatched')) {
        if (data?.matchstatus === 'Mismatched') {
          return true;
        } else {
          return (
            company?.includes(data?.company) && accounttype?.includes(data?.userAccountControl) && (type === 'Individual' ? branch?.includes(data?.branch) && unit?.includes(data?.unit) && team?.includes(data?.team) && employee?.includes(data?.companyname) : true) // Handle other cases
          );
        }
      } else {
        return (
          company?.includes(data?.company) && accounttype?.includes(data?.userAccountControl) && (type === 'Individual' ? branch?.includes(data?.branch) && unit?.includes(data?.unit) && team?.includes(data?.team) && employee?.includes(data?.companyname) : true) // Handle other cases
        );
      }
    });

    return res.status(200).json({ users: filteredFinalDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { oldUsername, newUsername, newCN, newSN } = req.body;

  if (!oldUsername || !newUsername || !newCN || !newSN) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Fetch LDAP configuration
  const ldapData = await LDAPsetting.find();
  if (!ldapData.length) {
    return res.status(500).json({ message: 'LDAP settings not found' });
  }

  const ldapUrl = ldapData[0]?.ldapurl.replace(/^ldap:\/\//, 'ldaps://');
  const ldapConfig = {
    url: ldapUrl,
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
    reconnect: true, // Enable automatic reconnect on failures
  });

  // Handle client error events
  client.on('error', (err) => {
    console.error('❌ LDAP Connection Error:', err);
  });

  try {
    // **Step 1: Bind to LDAP**
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed'));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // **Step 2: Search for User**
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${oldUsername})`,
      paged: true,
      sizeLimit: 1,
    };

    let userEntry = null;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        searchRes.on('searchEntry', (entry) => {
          userEntry = entry.pojo;
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('LDAP Search error'));
        });

        searchRes.on('end', () => {
          if (!userEntry) {
            console.error('❌ User not found:', oldUsername);
            return reject(new Error('User not found'));
          }
          console.log('✅ User found:', userEntry.objectName);
          resolve();
        });
      });
    });

    const userDN = userEntry.objectName;
    const oldCN = userEntry.cn;

    // **Step 3: Update sn attribute**
    const changes = [
      new ldap.Change({
        operation: 'replace',
        modification: new ldap.Attribute({ type: 'sn', values: [newSN] }),
      }),
    ];

    await new Promise((resolve, reject) => {
      client.modify(userDN, changes, (err) => {
        if (err) {
          console.error('❌ Failed to update sn attribute:', err);
          return reject(new Error('Failed to update user details'));
        }
        console.log('✅ Updated sn attribute');
        resolve();
      });
    });

    let newUserDN = userDN;

    // **Step 4: Rename CN if changed**
    if (newCN !== oldCN) {
      newUserDN = `CN=${newCN},${userDN.substring(userDN.indexOf(',') + 1)}`;

      await new Promise((resolve, reject) => {
        client.modifyDN(userDN, newUserDN, (err) => {
          if (err) {
            console.error('❌ Failed to rename CN:', err);
            return reject(new Error('Failed to rename user CN'));
          }
          console.log('✅ CN renamed successfully');
          resolve();
        });
      });
    }

    // **Step 5: Update sAMAccountName if changed**
    if (newUsername !== oldUsername) {
      const usernameChange = [
        new ldap.Change({
          operation: 'replace',
          modification: new ldap.Attribute({
            type: 'sAMAccountName',
            values: [newUsername],
          }),
        }),
      ];

      await new Promise((resolve, reject) => {
        client.modify(newUserDN, usernameChange, (err) => {
          if (err) {
            console.error('❌ Failed to update sAMAccountName:', err);
            return reject(new Error('Failed to update username'));
          }
          console.log('✅ sAMAccountName updated successfully');
          resolve();
        });
      });
    }

    // **Step 6: Unbind LDAP**
    setTimeout(() => {
      client.unbind((err) => {
        if (err) {
          console.error('❌ LDAP Unbind Error:', err);
        } else {
          console.log('✅ LDAP Connection Closed Successfully');
        }
      });
    }, 1000);

    return res.status(200).json({ message: 'User details updated successfully' });
  } catch (err) {
    console.error('❌ Internal Error:', err);

    // Close LDAP connection if an error occurs
    client.unbind((unbindErr) => {
      if (unbindErr) console.error('❌ Error unbinding from LDAP after failure:', unbindErr);
    });

    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

exports.checkLDAPConnection = catchAsyncErrors(async (req, res, next) => {
  const { ldapurl, cnname, cnnametwo, dcnameone, dcnametwo, ldappassword } = req.body;
  // Validate the LDAP URL
  try {
    new URL(ldapurl); // This will throw an error if the URL is invalid
  } catch (err) {
    console.error('❌ Invalid LDAP URL:', err);
    return res.status(400).json({
      success: false,
      message: 'Invalid LDAP URL',
      error: err.message,
    });
  }

  const ldapConfig = {
    url: ldapurl,
    bindDN: `CN=${cnname},CN=${cnnametwo},DC=${dcnameone},DC=${dcnametwo}`,
    bindPassword: ldappassword,
  };
  console.log(req.body);
  let client;
  try {
    client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
      reconnect: true, // Enables auto-reconnect if needed
    });

    client.on('error', (err) => {
      console.error('❌ LDAP Client Error:', err.message);
      if (err.code === 'ECONNRESET') {
        console.warn('⚠️ Connection reset by LDAP server. Retrying...');
      }
    });

    // Wrap bind in a promise
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Failed:', err.message);
          return reject(err);
        }
        console.log('✅ LDAP Connection Successful!');
        resolve();
      });
    });

    res.status(200).json({ success: true, message: 'LDAP Connection Successful' });
  } catch (err) {
    console.error('❌ LDAP Connection Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'LDAP Connection Failed',
      error: err.message,
    });
  } finally {
    // Ensure unbind is attempted only if the client is still connected
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
      });
    }
  }
});

exports.checkLDAPConnectionNew = catchAsyncErrors(async (req, res, next) => {
  // const ldapConfig = {
  //   url: "ldaps://HILIFE.AI:636",
  //   bindDN: "CN=Administrator,CN=Users,DC=HILIFE,DC=AI",
  //   bindPassword: "Hilife.Aiserver@2023",
  //   baseDN: "DC=HILIFE,DC=AI",
  //   usersOU: "OU=TESTING,DC=HILIFE,DC=AI",
  // };

  const ldapConfig = {
    url: 'ldaps://ttsbs.com:636',
    bindDN: 'CN=Administrator,CN=Users,DC=TTSBS,DC=COM',
    bindPassword: 'TTSBSServer$202325#',
    baseDN: 'DC=TTSBS,DC=COM',
    usersOU: 'OU=TESTING,DC=TTSBS,DC=COM',
  };

  let client;

  try {
    client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
      reconnect: true, // Enables auto-reconnect if needed
    });

    client.on('error', (err) => {
      console.error('❌ LDAP Client Error:', err.message);
      if (err.code === 'ECONNRESET') {
        console.warn('⚠️ Connection reset by LDAP server. Retrying...');
      }
    });

    // Wrap bind in a promise
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Failed:', err.message);
          return reject(err);
        }
        console.log('✅ LDAP Connection Successful!');
        resolve();
      });
    });

    res.status(200).json({ success: true, message: 'LDAP Connection Successful' });
  } catch (err) {
    console.error('❌ LDAP Connection Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'LDAP Connection Failed',
      error: err.message,
    });
  } finally {
    // Ensure unbind is attempted only if the client is still connected
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
      });
    }
  }
});

exports.createUserInLDAPWithFirstLogin = catchAsyncErrors(async (req, res, next) => {
  // const ldapConfig = {
  //   url: "ldaps://HILIFE.AI:636",
  //   bindDN: "CN=Administrator,CN=Users,DC=HILIFE,DC=AI",
  //   bindPassword: "Hilife.Aiserver@2023",
  //   baseDN: "DC=HILIFE,DC=AI",
  //   usersOU: "OU=TESTING,DC=HILIFE,DC=AI",
  // };

  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    usersOU: 'OU=TESTING,DC=HILIFE,DC=AI',
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  try {
    const { cn, sn, sAMAccountName, userPassword } = req.body;

    if (!cn || !sn || !sAMAccountName || !userPassword) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedSAMAccountName.length > 20) {
      return next(new ErrorHandler('sAMAccountName must not exceed 20 characters', 400));
    }

    const passwordBuffer = Buffer.from(`"${userPassword}"`, 'utf16le');

    const newUser = {
      cn: cn,
      sn: sn,
      sAMAccountName: sanitizedSAMAccountName,
      objectClass: ['top', 'person', 'organizationalPerson', 'user'],
      userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
      displayName: `${cn} ${sn}`,
      mail: `${sanitizedSAMAccountName}@hilife.ai`,
      givenName: cn,
      userAccountControl: '544', // 512 (Enabled) + 32 (Password must change at first login)
      unicodePwd: passwordBuffer,
    };

    console.log('New user object:', newUser);

    client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (bindErr) => {
      if (bindErr) {
        console.error('❌ LDAP Bind Failed:', bindErr);
        return next(new ErrorHandler('LDAP Bind failed', 500));
      }

      console.log('✅ LDAP Bind Successful!');

      const userDN = `CN=${cn},${ldapConfig.usersOU}`;
      console.log('User DN:', userDN);

      client.add(userDN, newUser, (addErr) => {
        if (addErr) {
          console.error('❌ Error adding user:', addErr);
          return next(new ErrorHandler('Failed to add user to LDAP', 500));
        }

        console.log('✅ User added successfully to LDAP');

        client.unbind((unbindErr) => {
          if (unbindErr) {
            console.error('❌ Error unbinding from LDAP:', unbindErr);
            return next(new ErrorHandler('Error unbinding from LDAP', 500));
          }

          console.log('✅ Unbound from LDAP');
          return res.status(200).json({
            message: 'User created successfully. Must change password on first login.',
          });
        });
      });
    });
  } catch (err) {
    console.error('❌ Internal Server Error:', err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

// exports.createUserInLDAPWithUserAccountControl = catchAsyncErrors(async (req, res, next) => {
//   const ldapConfig = {
//     url: "ldaps://HILIFE.AI:636",
//     bindDN: "CN=Administrator,CN=Users,DC=HILIFE,DC=AI",
//     bindPassword: "Hilife.Aiserver@2023",
//     baseDN: "DC=HILIFE,DC=AI",
//     usersOU: "OU=TESTING,DC=HILIFE,DC=AI",
//   };

//   const client = ldap.createClient({
//     url: ldapConfig.url,
//     tlsOptions: {
//       rejectUnauthorized: false, // Avoid TLS errors
//     },
//   });

//   try {
//     const { cn, sn, sAMAccountName, userPassword } = req.body;

//     if (!cn || !sn || !sAMAccountName || !userPassword) {
//       return next(new ErrorHandler("All fields are required", 400));
//     }

//     // Sanitize and validate username
//     const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, "");
//     if (sanitizedSAMAccountName.length > 20) {
//       return next(new ErrorHandler("sAMAccountName must not exceed 20 characters", 400));
//     }

//     // Encode password in UTF-16LE
//     const passwordBuffer = Buffer.from(`"${userPassword}"`, "utf16le");

//     // Compute `userAccountControl`
//     // const userAccountControl =
//     //   512 |        // Normal account
//     //   524288         // Normal account
//     //   // 65536 |      // User must change password at next logon
//     //   // 64 |         // Password never expires
//     //   // 128 |        // Store password using reversible encryption
//     //   // 8388608 |    // Smart card required for interactive logon
//     //   // 2097152 |    // Account is sensitive and cannot be delegated
//     //   // 4194304 |    // Use only DES encryption types
//     //   // 262144 |     // Kerberos AES 128-bit encryption
//     //   // 524288 |     // Kerberos AES 256-bit encryption
//     //   // 1048576;     // Do not require Kerberos pre-authentication

//     const userAccountControl = 512 | 65536 | 524288;

//     console.log("Calculated userAccountControl:", userAccountControl);

//     const newUser = {
//       cn: cn,
//       sn: sn,
//       sAMAccountName: sanitizedSAMAccountName,
//       objectClass: ["top", "person", "organizationalPerson", "user"],
//       userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
//       displayName: `${cn} ${sn}`,
//       mail: `${sanitizedSAMAccountName}@hilife.ai`,
//       givenName: cn,
//       userAccountControl: `${userAccountControl}`,  // Apply the computed value
//       unicodePwd: passwordBuffer, // Correct password field for AD
//     };

//     console.log("New user object:", newUser);

//     client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (bindErr) => {
//       if (bindErr) {
//         console.error("❌ LDAP Bind Failed:", bindErr);
//         return next(new ErrorHandler("LDAP Bind failed", 500));
//       }

//       console.log("✅ LDAP Bind Successful!");

//       const userDN = `CN=${cn},${ldapConfig.usersOU}`;
//       console.log("User DN:", userDN);

//       client.add(userDN, newUser, (addErr) => {
//         if (addErr) {
//           console.error("❌ Error adding user:", addErr);
//           return next(new ErrorHandler("Failed to add user to LDAP", 500));
//         }

//         console.log("✅ User added successfully to LDAP");

//         client.unbind((unbindErr) => {
//           if (unbindErr) {
//             console.error("❌ Error unbinding from LDAP:", unbindErr);
//             return next(new ErrorHandler("Error unbinding from LDAP", 500));
//           }

//           console.log("✅ Unbound from LDAP");
//           return res.status(200).json({ message: "User added successfully to LDAP" });
//         });
//       });
//     });
//   } catch (err) {
//     console.error("❌ Internal Server Error:", err);
//     return next(new ErrorHandler("Internal server error", 500));
//   }
// });

exports.createUserInLDAPWithUserAccountControl = catchAsyncErrors(async (req, res, next) => {
  // const ldapConfig = {
  //   url: "ldaps://HILIFE.AI:636",
  //   bindDN: "CN=Administrator,CN=Users,DC=HILIFE,DC=AI",
  //   bindPassword: "Hilife.Aiserver@2023",
  //   baseDN: "DC=HILIFE,DC=AI",
  //   usersOU: "OU=TESTING,DC=HILIFE,DC=AI",
  // };

  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    usersOU: 'OU=TESTING,DC=HILIFE,DC=AI',
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
  });

  try {
    const { cn, sn, sAMAccountName, userPassword } = req.body;

    if (!cn || !sn || !sAMAccountName || !userPassword) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    const sanitizedSAMAccountName = sAMAccountName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedSAMAccountName.length > 20) {
      return next(new ErrorHandler('sAMAccountName must not exceed 20 characters', 400));
    }

    const passwordBuffer = Buffer.from(`"${userPassword}"`, 'utf16le');

    // User must change password at first login
    const userAccountControl = 512; // NORMAL_ACCOUNT

    const newUser = {
      cn: cn,
      sn: sn,
      sAMAccountName: sanitizedSAMAccountName,
      objectClass: ['top', 'person', 'organizationalPerson', 'user'],
      userPrincipalName: `${sanitizedSAMAccountName}@HILIFE.AI`,
      displayName: `${cn} ${sn}`,
      mail: `${sanitizedSAMAccountName}@hilife.ai`,
      givenName: cn,
      userAccountControl: `${userAccountControl}`,
      unicodePwd: passwordBuffer,
      pwdLastSet: '0', // Forces password change on first login
    };

    console.log('New user object:', newUser);

    client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (bindErr) => {
      if (bindErr) {
        console.error('❌ LDAP Bind Failed:', bindErr);
        return next(new ErrorHandler('LDAP Bind failed', 500));
      }

      console.log('✅ LDAP Bind Successful!');

      const userDN = `CN=${cn},${ldapConfig.usersOU}`;
      console.log('User DN:', userDN);

      client.add(userDN, newUser, (addErr) => {
        if (addErr) {
          console.error('❌ Error adding user:', addErr);
          return next(new ErrorHandler('Failed to add user to LDAP', 500));
        }

        console.log('✅ User added successfully to LDAP');

        // Set the account to expire password after first login
        const changePwdExpiry = new ldap.Change({
          operation: 'replace',
          modification: new ldap.Attribute({
            type: 'pwdLastSet',
            values: ['0'], // Forces password change at next login
          }),
        });

        client.modify(userDN, changePwdExpiry, (modErr) => {
          if (modErr) {
            console.error('❌ Error forcing password expiration after first login:', modErr);
            return next(new ErrorHandler('Failed to enforce password expiration', 500));
          }

          console.log('✅ Password will expire after first login');

          client.unbind((unbindErr) => {
            if (unbindErr) {
              console.error('❌ Error unbinding from LDAP:', unbindErr);
              return next(new ErrorHandler('Error unbinding from LDAP', 500));
            }

            console.log('✅ Unbound from LDAP');
            return res.status(200).json({
              message: 'User added successfully. Password will expire after first login.',
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('❌ Internal Server Error:', err);
    return next(new ErrorHandler('Internal server error', 500));
  }
});

exports.getLockoutPolicy = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();
  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'), // Enforce LDAPS
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };
  let client;

  try {
    client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: { rejectUnauthorized: false }, // Allows self-signed certificates
      reconnect: true, // Enables auto-reconnect if needed
      keepalive: true, // Enable keep-alive
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        console.error('❌ LDAP Connection Reset:', err.message);
      } else {
        console.error('❌ LDAP Client Error:', err.message);
      }
    });

    // Bind to LDAP
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind Failed:', err.message);
          return reject(err);
        }
        console.log('✅ LDAP Connection Successful!');
        resolve();
      });
    });

    // Define search filter and options
    const searchFilter = '(objectClass=domainDNS)'; // More specific filter
    const searchOptions = {
      scope: 'sub',
      attributes: [
        'lockoutThreshold', // Number of failed attempts before lockout
        'lockoutDuration', // Time the account remains locked (in 100-nanosecond intervals)
        'lockoutObservationWindow', // Time window for failed attempts to reset
      ],
    };

    // Perform search
    const policyData = await new Promise((resolve, reject) => {
      let policy = {};

      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('❌ LDAP Search Error:', err.message);
          return reject(err);
        }

        res.on('searchEntry', (entry) => {
          if (!entry || !entry.pojo) {
            console.error('❌ Invalid LDAP Entry:', entry);
            return reject(new Error('Invalid LDAP entry'));
          }
          policy = entry.pojo; // Use entry.pojo instead of entry.object
        });

        res.on('end', () => {
          if (Object.keys(policy).length === 0) {
            console.error('❌ No Lockout Policy Data Found');
            return reject(new Error('No lockout policy data found'));
          }
          resolve(policy);
        });

        res.on('error', (err) => {
          console.error('❌ LDAP Search Stream Error:', err.message);
          reject(err);
        });
      });
    });

    // Convert lockout duration and observation window from 100-nanosecond intervals to minutes
    const convertTime = (timeValue) => (timeValue ? parseInt(timeValue, 10) / 600000000 : 0);

    const lockoutPolicy = {
      lockoutThreshold: parseInt(policyData.lockoutThreshold, 10) || 0,
      lockoutDuration: convertTime(policyData.lockoutDuration),
      lockoutObservationWindow: convertTime(policyData.lockoutObservationWindow),
    };

    console.log(' Lockout Policy:', lockoutPolicy);

    res.status(200).json({
      success: true,
      message: 'Lockout policy retrieved successfully',
      data: lockoutPolicy,
    });
  } catch (err) {
    console.error('❌ LDAP Lockout Policy Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lockout policy',
      error: err.message,
    });
  } finally {
    if (client) {
      client.unbind((unbindErr) => {
        if (unbindErr) console.error('❌ Error unbinding LDAP client:', unbindErr.message);
      });
    }
  }
});

exports.checkUserInLDAP = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  if (!ldapData.length) {
    return res.status(200).json({ status: false, message: 'LDAP Setting not Found!' });
  }

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'),
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const { username } = req.body;

  if (!username) {
    return next(new ErrorHandler('Username (sAMAccountName) is required', 400));
  }

  // Create LDAP client
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
    reconnect: true,
  });

  try {
    // Bind to LDAP
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('LDAP Bind Error:', err);
          return reject(new ErrorHandler('Failed to bind to LDAP server', 500));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    // Search for user
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['dn'],
    };

    let userExists = false;

    await new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
        if (err) {
          console.error('LDAP Search Error:', err);
          return reject(new ErrorHandler('Failed to search LDAP', 500));
        }

        res.on('searchEntry', (entry) => {
          console.log('✅ User found in LDAP:', entry.objectName);
          userExists = true;
        });

        res.on('end', () => resolve());

        res.on('error', (searchErr) => {
          console.error('LDAP Search Error:', searchErr);
          return reject(new ErrorHandler('Error searching LDAP for user', 500));
        });
      });
    });

    if (!userExists) {
      return res.status(200).json({ status: false, message: 'User not found in LDAP' });
    }

    return res.status(200).json({ status: true, message: 'User exists in LDAP' });
  } catch (err) {
    console.error('Unhandled Error:', err);
    return next(new ErrorHandler(err.message || 'Internal Server Error', 500));
  } finally {
    client.unbind((unbindErr) => {
      if (unbindErr) console.error('LDAP Unbind Error:', unbindErr);
      else console.log('✅ LDAPS Connection closed');
    });
  }
});

exports.getalluserlongabsentlist = catchAsyncErrors(async (req, res) => {
  try {
    let filteredUsers, filterQuerys;

    const today = moment();
    const pastThreeDaysISO = [today.clone().format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    const futureThreeDaysISO = [today.clone().format('DD-MM-YYYY'), today.clone().add(1, 'days').format('DD-MM-YYYY'), today.clone().add(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    let filterQuery = {
      enquirystatus: {
        $nin: ['Enquiry Purpose'],
      },
      longleaveabsentaprooveddate: {
        $nin: futureThreeDaysISO,
      },
      resonablestatus: {
        $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
      doj: getDojFilter(),
    };

    let result = await User.find(filterQuery, {
      resonablestatus: 1,
      company: 1,
      branch: 1,
      unit: 1,
      team: 1,
      empcode: 1,
      companyname: 1,
      longleaveabsentaprooveddate: 1,
      boardingLog: 1,
      attendancemode: 1, // Include boardingLog in the result

      username: 1,
      originalpassword: 1,
      firstname: 1,
      lastname: 1,
      aadhar: 1,
      panno: 1,
      dob: 1,
      doj: 1,
      pstreet: 1,

      pcity: 1,
      ppincode: 1,
      pstate: 1,
      pcountry: 1,
    }).lean();
    filteredUsers = result;

    const currentDateChecklist = moment().format('DD-MM-YYYY');
    const pastThreeAttendaysDays = [today.clone().format('DD-MM-YYYY'), today.clone().subtract(1, 'days').format('DD-MM-YYYY'), today.clone().subtract(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('DD-MM-YYYY')];

    const pastThreeLeaveDays = [today.clone().format('DD/MM/YYYY'), today.clone().subtract(1, 'days').format('DD/MM/YYYY'), today.clone().subtract(2, 'days').format('DD/MM/YYYY'), today.clone().subtract(3, 'days').format('DD/MM/YYYY')];

    const [attendance, allLeaveStatus, holidays] = await Promise.all([
      Attendance.find(
        {
          date: {
            $in: pastThreeAttendaysDays,
          },
        },
        { date: 1, userid: 1 }
      ).lean(),

      ApplyLeave.find(
        {
          date: { $in: pastThreeLeaveDays },
          status: { $nin: ['Rejected', 'Cancel'] },
        },
        { employeename: 1, employeeid: 1, date: 1, status: 1 }
      ).lean(),

      Holiday.find(
        {
          date: { $in: pastThreeDaysISO },
        },
        {
          date: 1,
          employee: 1,
          company: 1,
          applicablefor: 1,
          unit: 1,
          team: 1,
        }
      ).lean(),
    ]);
    const attendanceMap = attendance.reduce((acc, item) => {
      const userId = item.userid.toString();
      const date = moment(item.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(date);
      return acc;
    }, {});

    let leaveWithCheckList = allLeaveStatus?.filter((item) => item && item?.status === 'Approved');

    // Create a map for fast lookup of leave records
    const leaveMap = leaveWithCheckList.reduce((acc, item) => {
      const userKey = `${item.employeeid}_${item.employeename}`;
      const leaveDates = item.date.map((date) => moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'));
      if (!acc[userKey]) {
        acc[userKey] = [];
      }
      acc[userKey].push(...leaveDates);
      return acc;
    }, {});

    const employeeMatchesUser = (user, holiday) => {
      return holiday.company.includes(user.company) && holiday.applicablefor.includes(user.branch) && holiday.unit.includes(user.unit) && holiday.team.includes(user.team) && (holiday.employee.includes(user.companyname) || holiday.employee.includes('ALL'));
    };

    const holidayMap = holidays.reduce((acc, item) => {
      const date = moment(item.date).format('DD/MM/YYYY');

      filteredUsers.forEach((user) => {
        if (employeeMatchesUser(user, item)) {
          if (!acc[user.empcode]) {
            acc[user.empcode] = [];
          }
          acc[user.empcode].push(date);
        }
      });

      return acc;
    }, {});

    const checkStatusForPast3Days = (userId, empcode, employeename, weekOffDays) => {
      const userKey = `${empcode}_${employeename}`;
      let absentDays = 0;
      let leaveDays = 0;
      let holidayDays = 0;

      for (let date of pastThreeLeaveDays) {
        // const dayOfWeek = moment(date, "DD/MM/YYYY").format("dddd"); // Get day of the week

        // if (weekOffDays.includes(dayOfWeek)) {
        //   continue; // Skip week off days
        // }

        if (attendanceMap[userId] && attendanceMap[userId].includes(date)) {
          continue; // User was present on this date
        } else if (leaveMap[userKey] && leaveMap[userKey].includes(date)) {
          leaveDays++; // User was on leave on this date
        } else if (holidayMap[empcode] && holidayMap[empcode].includes(date)) {
          holidayDays++; // Holiday on this date
        } else {
          absentDays++; // User was absent on this date
        }
      }

      let status = null;
      if (absentDays >= 4) {
        status = 'Long Absent';
      } else if (leaveDays >= 4) {
        status = 'Long Leave';
      }

      return { status, absentDays, leaveDays, holidayDays };
    };

    const determineStatus = (attendanceStatus) => {
      return attendanceStatus ? attendanceStatus : null;
    };

    const enrichedLeaveAttendanceUsers = filteredUsers
      ?.map((user) => {
        const userId = user._id.toString();
        let weekOffDays = [];
        if (user.boardingLog && user.boardingLog.length > 0) {
          const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];
          weekOffDays = lastBoardingLog.weekoff || [];
        }

        const { status, absentDays, leaveDays } = checkStatusForPast3Days(userId, user.empcode, user.companyname, weekOffDays);

        return {
          ...user,

          attendanceStatus: !!status,
          noticePeriodStatus: false,
          livestatus: status ? false : null,
          userstatus: determineStatus(status),
          longAbsentCount: absentDays, // Long absent count
          longLeaveCount: leaveDays, // Long leave count
        };
      })
      .filter((user) => user.userstatus && user.userstatus !== 'Long Leave'); // Filter out users without attendance status

    return res.status(200).json({
      length: enrichedLeaveAttendanceUsers?.length,
      filterallDatauser: enrichedLeaveAttendanceUsers,
      // tableName: filterin,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const listOfLongAbsentees = async () => {
  try {
    let filteredUsers;

    const today = moment();
    const pastThreeDaysISO = [today.clone().format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    const futureThreeDaysISO = [today.clone().format('DD-MM-YYYY'), today.clone().add(1, 'days').format('DD-MM-YYYY'), today.clone().add(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    let filterQuery = {
      enquirystatus: {
        $nin: ['Enquiry Purpose'],
      },
      longleaveabsentaprooveddate: {
        $nin: futureThreeDaysISO,
      },
      resonablestatus: {
        $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
      doj: getDojFilter(),
    };

    let result = await User.find(filterQuery, {
      resonablestatus: 1,
      company: 1,
      branch: 1,
      unit: 1,
      team: 1,
      empcode: 1,
      companyname: 1,
      longleaveabsentaprooveddate: 1,
      boardingLog: 1,
      attendancemode: 1, // Include boardingLog in the result

      username: 1,
      originalpassword: 1,
      firstname: 1,
      lastname: 1,
      aadhar: 1,
      panno: 1,
      dob: 1,
      doj: 1,
      pstreet: 1,

      pcity: 1,
      ppincode: 1,
      pstate: 1,
      pcountry: 1,
    }).lean();
    filteredUsers = result;

    const currentDateChecklist = moment().format('DD-MM-YYYY');
    const pastThreeAttendaysDays = [today.clone().format('DD-MM-YYYY'), today.clone().subtract(1, 'days').format('DD-MM-YYYY'), today.clone().subtract(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('DD-MM-YYYY')];

    const pastThreeLeaveDays = [today.clone().format('DD/MM/YYYY'), today.clone().subtract(1, 'days').format('DD/MM/YYYY'), today.clone().subtract(2, 'days').format('DD/MM/YYYY'), today.clone().subtract(3, 'days').format('DD/MM/YYYY')];

    const [attendance, allLeaveStatus, holidays] = await Promise.all([
      Attendance.find(
        {
          date: {
            $in: pastThreeAttendaysDays,
          },
        },
        { date: 1, userid: 1 }
      ).lean(),

      ApplyLeave.find(
        {
          date: { $in: pastThreeLeaveDays },
          status: { $nin: ['Rejected', 'Cancel'] },
        },
        { employeename: 1, employeeid: 1, date: 1, status: 1 }
      ).lean(),

      Holiday.find(
        {
          date: { $in: pastThreeDaysISO },
        },
        {
          date: 1,
          employee: 1,
          company: 1,
          applicablefor: 1,
          unit: 1,
          team: 1,
        }
      ).lean(),
    ]);
    const attendanceMap = attendance.reduce((acc, item) => {
      const userId = item.userid.toString();
      const date = moment(item.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(date);
      return acc;
    }, {});

    let leaveWithCheckList = allLeaveStatus?.filter((item) => item && item?.status === 'Approved');

    // Create a map for fast lookup of leave records
    const leaveMap = leaveWithCheckList.reduce((acc, item) => {
      const userKey = `${item.employeeid}_${item.employeename}`;
      const leaveDates = item.date.map((date) => moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'));
      if (!acc[userKey]) {
        acc[userKey] = [];
      }
      acc[userKey].push(...leaveDates);
      return acc;
    }, {});

    const employeeMatchesUser = (user, holiday) => {
      return holiday.company.includes(user.company) && holiday.applicablefor.includes(user.branch) && holiday.unit.includes(user.unit) && holiday.team.includes(user.team) && (holiday.employee.includes(user.companyname) || holiday.employee.includes('ALL'));
    };

    const holidayMap = holidays.reduce((acc, item) => {
      const date = moment(item.date).format('DD/MM/YYYY');

      filteredUsers.forEach((user) => {
        if (employeeMatchesUser(user, item)) {
          if (!acc[user.empcode]) {
            acc[user.empcode] = [];
          }
          acc[user.empcode].push(date);
        }
      });

      return acc;
    }, {});

    const checkStatusForPast3Days = (userId, empcode, employeename, weekOffDays) => {
      const userKey = `${empcode}_${employeename}`;
      let absentDays = 0;
      let leaveDays = 0;
      let holidayDays = 0;

      for (let date of pastThreeLeaveDays) {
        // const dayOfWeek = moment(date, "DD/MM/YYYY").format("dddd"); // Get day of the week

        // if (weekOffDays.includes(dayOfWeek)) {
        //   continue; // Skip week off days
        // }

        if (attendanceMap[userId] && attendanceMap[userId].includes(date)) {
          continue; // User was present on this date
        } else if (leaveMap[userKey] && leaveMap[userKey].includes(date)) {
          leaveDays++; // User was on leave on this date
        } else if (holidayMap[empcode] && holidayMap[empcode].includes(date)) {
          holidayDays++; // Holiday on this date
        } else {
          absentDays++; // User was absent on this date
        }
      }

      let status = null;
      if (absentDays >= 4) {
        status = 'Long Absent';
      } else if (leaveDays >= 4) {
        status = 'Long Leave';
      }

      return { status, absentDays, leaveDays, holidayDays };
    };

    const determineStatus = (attendanceStatus) => {
      return attendanceStatus ? attendanceStatus : null;
    };

    const enrichedLeaveAttendanceUsers = filteredUsers
      ?.map((user) => {
        const userId = user._id.toString();
        let weekOffDays = [];
        if (user.boardingLog && user.boardingLog.length > 0) {
          const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];
          weekOffDays = lastBoardingLog.weekoff || [];
        }

        const { status, absentDays, leaveDays } = checkStatusForPast3Days(userId, user.empcode, user.companyname, weekOffDays);

        return {
          ...user,

          attendanceStatus: !!status,
          noticePeriodStatus: false,
          livestatus: status ? false : null,
          userstatus: determineStatus(status),
          longAbsentCount: absentDays, // Long absent count
          longLeaveCount: leaveDays, // Long leave count
        };
      })
      .filter((user) => user.userstatus && user.userstatus !== 'Long Leave'); // Filter out users without attendance status

    // return{

    //   filterallDatauser: enrichedLeaveAttendanceUsers,
    //   length: enrichedLeaveAttendanceUsers?.length,
    // };
    let filteredUsernames = enrichedLeaveAttendanceUsers?.map((item) => item?.username);
    disableDomainUsers(filteredUsernames);
    // console.log(filteredUsernames)
    // console.log(enrichedLeaveAttendanceUsers?.length)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
const listOfLongAbsenteesAM = async () => {
  try {
    let filteredUsers;

    const today = moment();
    const pastThreeDaysISO = [today.clone().format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    const futureThreeDaysISO = [today.clone().format('DD-MM-YYYY'), today.clone().add(1, 'days').format('DD-MM-YYYY'), today.clone().add(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    let filterQuery = {
      enquirystatus: {
        $nin: ['Enquiry Purpose'],
      },
      longleaveabsentaprooveddate: {
        $nin: futureThreeDaysISO,
      },
      resonablestatus: {
        $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
      doj: getDojFilter(),
    };

    let result = await User.find(filterQuery, {
      resonablestatus: 1,
      company: 1,
      branch: 1,
      unit: 1,
      team: 1,
      empcode: 1,
      companyname: 1,
      longleaveabsentaprooveddate: 1,
      boardingLog: 1,
      attendancemode: 1, // Include boardingLog in the result

      username: 1,
      originalpassword: 1,
      firstname: 1,
      lastname: 1,
      aadhar: 1,
      panno: 1,
      dob: 1,
      doj: 1,
      pstreet: 1,

      pcity: 1,
      ppincode: 1,
      pstate: 1,
      pcountry: 1,
    }).lean();
    filteredUsers = result;

    const currentDateChecklist = moment().format('DD-MM-YYYY');
    const pastThreeAttendaysDays = [today.clone().format('DD-MM-YYYY'), today.clone().subtract(1, 'days').format('DD-MM-YYYY'), today.clone().subtract(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('DD-MM-YYYY')];

    const pastThreeLeaveDays = [today.clone().format('DD/MM/YYYY'), today.clone().subtract(1, 'days').format('DD/MM/YYYY'), today.clone().subtract(2, 'days').format('DD/MM/YYYY'), today.clone().subtract(3, 'days').format('DD/MM/YYYY')];

    const [attendance, allLeaveStatus, holidays] = await Promise.all([
      Attendance.find(
        {
          date: {
            $in: pastThreeAttendaysDays,
          },
        },
        { date: 1, userid: 1, shiftname: 1, username: 1 }
      ).lean(),

      ApplyLeave.find(
        {
          date: { $in: pastThreeLeaveDays },
          status: { $nin: ['Rejected', 'Cancel'] },
        },
        { employeename: 1, employeeid: 1, date: 1, status: 1 }
      ).lean(),

      Holiday.find(
        {
          date: { $in: pastThreeDaysISO },
        },
        {
          date: 1,
          employee: 1,
          company: 1,
          applicablefor: 1,
          unit: 1,
          team: 1,
        }
      ).lean(),
    ]);
    const attendanceMap = attendance.reduce((acc, item) => {
      const userId = item.userid.toString();
      const date = moment(item.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(date);
      return acc;
    }, {});

    let leaveWithCheckList = allLeaveStatus?.filter((item) => item && item?.status === 'Approved');

    // Create a map for fast lookup of leave records
    const leaveMap = leaveWithCheckList.reduce((acc, item) => {
      const userKey = `${item.employeeid}_${item.employeename}`;
      const leaveDates = item.date.map((date) => moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'));
      if (!acc[userKey]) {
        acc[userKey] = [];
      }
      acc[userKey].push(...leaveDates);
      return acc;
    }, {});

    const employeeMatchesUser = (user, holiday) => {
      return holiday.company.includes(user.company) && holiday.applicablefor.includes(user.branch) && holiday.unit.includes(user.unit) && holiday.team.includes(user.team) && (holiday.employee.includes(user.companyname) || holiday.employee.includes('ALL'));
    };

    const holidayMap = holidays.reduce((acc, item) => {
      const date = moment(item.date).format('DD/MM/YYYY');

      filteredUsers.forEach((user) => {
        if (employeeMatchesUser(user, item)) {
          if (!acc[user.empcode]) {
            acc[user.empcode] = [];
          }
          acc[user.empcode].push(date);
        }
      });

      return acc;
    }, {});

    const checkStatusForPast3Days = (userId, empcode, employeename, weekOffDays) => {
      const userKey = `${empcode}_${employeename}`;
      let absentDays = 0;
      let leaveDays = 0;
      let holidayDays = 0;

      for (let date of pastThreeLeaveDays) {
        // const dayOfWeek = moment(date, "DD/MM/YYYY").format("dddd"); // Get day of the week

        // if (weekOffDays.includes(dayOfWeek)) {
        //   continue; // Skip week off days
        // }

        if (attendanceMap[userId] && attendanceMap[userId].includes(date)) {
          continue; // User was present on this date
        } else if (leaveMap[userKey] && leaveMap[userKey].includes(date)) {
          leaveDays++; // User was on leave on this date
        } else if (holidayMap[empcode] && holidayMap[empcode].includes(date)) {
          holidayDays++; // Holiday on this date
        } else {
          absentDays++; // User was absent on this date
        }
      }

      let status = null;
      if (absentDays >= 4) {
        status = 'Long Absent';
      } else if (leaveDays >= 4) {
        status = 'Long Leave';
      }

      return { status, absentDays, leaveDays, holidayDays };
    };

    const determineStatus = (attendanceStatus) => {
      return attendanceStatus ? attendanceStatus : null;
    };

    const enrichedLeaveAttendanceUsers = filteredUsers
      ?.map((user) => {
        const userId = user._id.toString();
        let weekOffDays = [];
        if (user.boardingLog && user.boardingLog.length > 0) {
          const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];
          weekOffDays = lastBoardingLog.weekoff || [];
        }

        const { status, absentDays, leaveDays } = checkStatusForPast3Days(userId, user.empcode, user.companyname, weekOffDays);

        return {
          ...user,

          attendanceStatus: !!status,
          noticePeriodStatus: false,
          livestatus: status ? false : null,
          userstatus: determineStatus(status),
          longAbsentCount: absentDays, // Long absent count
          longLeaveCount: leaveDays, // Long leave count
        };
      })
      .filter((user) => user.userstatus && user.userstatus !== 'Long Leave'); // Filter out users without attendance status

    // return{

    //   filterallDatauser: enrichedLeaveAttendanceUsers,
    //   length: enrichedLeaveAttendanceUsers?.length,
    // };
    let filteredUsernames = enrichedLeaveAttendanceUsers?.map((item) => item?.username);

    const resultForShift = await Attendance.aggregate([
      {
        $match: {
          username: { $in: filteredUsernames },
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by most recent
      },
      {
        $group: {
          _id: '$username',
          latestEntry: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$latestEntry' },
      },
    ]);

    let AMUsers = [];
    let PMUsers = [];

    resultForShift?.forEach((data) => {
      const lastTwo = data?.shiftname?.slice(-2);

      if (lastTwo?.toLowerCase() === 'am') {
        AMUsers.push(data?.username);
      } else {
        PMUsers.push(data?.username);
      }
    });

    disableDomainUsers(AMUsers);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const listOfLongAbsenteesPM = async () => {
  try {
    let filteredUsers;

    const today = moment();
    const pastThreeDaysISO = [today.clone().format('YYYY-MM-DD'), today.clone().subtract(1, 'days').format('YYYY-MM-DD'), today.clone().subtract(2, 'days').format('YYYY-MM-DD'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    const futureThreeDaysISO = [today.clone().format('DD-MM-YYYY'), today.clone().add(1, 'days').format('DD-MM-YYYY'), today.clone().add(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('YYYY-MM-DD')];
    let filterQuery = {
      enquirystatus: {
        $nin: ['Enquiry Purpose'],
      },
      longleaveabsentaprooveddate: {
        $nin: futureThreeDaysISO,
      },
      resonablestatus: {
        $nin: ['Not Joined', 'Postponed', 'Rejected', 'Closed', 'Releave Employee', 'Absconded', 'Hold', 'Terminate'],
      },
      doj: getDojFilter(),
    };

    let result = await User.find(filterQuery, {
      resonablestatus: 1,
      company: 1,
      branch: 1,
      unit: 1,
      team: 1,
      empcode: 1,
      companyname: 1,
      longleaveabsentaprooveddate: 1,
      boardingLog: 1,
      attendancemode: 1, // Include boardingLog in the result

      username: 1,
      originalpassword: 1,
      firstname: 1,
      lastname: 1,
      aadhar: 1,
      panno: 1,
      dob: 1,
      doj: 1,
      pstreet: 1,

      pcity: 1,
      ppincode: 1,
      pstate: 1,
      pcountry: 1,
    }).lean();
    filteredUsers = result;

    const currentDateChecklist = moment().format('DD-MM-YYYY');
    const pastThreeAttendaysDays = [today.clone().format('DD-MM-YYYY'), today.clone().subtract(1, 'days').format('DD-MM-YYYY'), today.clone().subtract(2, 'days').format('DD-MM-YYYY'), today.clone().subtract(3, 'days').format('DD-MM-YYYY')];

    const pastThreeLeaveDays = [today.clone().format('DD/MM/YYYY'), today.clone().subtract(1, 'days').format('DD/MM/YYYY'), today.clone().subtract(2, 'days').format('DD/MM/YYYY'), today.clone().subtract(3, 'days').format('DD/MM/YYYY')];

    const [attendance, allLeaveStatus, holidays] = await Promise.all([
      Attendance.find(
        {
          date: {
            $in: pastThreeAttendaysDays,
          },
        },
        { date: 1, userid: 1, shiftname: 1, username: 1 }
      ).lean(),

      ApplyLeave.find(
        {
          date: { $in: pastThreeLeaveDays },
          status: { $nin: ['Rejected', 'Cancel'] },
        },
        { employeename: 1, employeeid: 1, date: 1, status: 1 }
      ).lean(),

      Holiday.find(
        {
          date: { $in: pastThreeDaysISO },
        },
        {
          date: 1,
          employee: 1,
          company: 1,
          applicablefor: 1,
          unit: 1,
          team: 1,
        }
      ).lean(),
    ]);
    const attendanceMap = attendance.reduce((acc, item) => {
      const userId = item.userid.toString();
      const date = moment(item.date, 'DD-MM-YYYY').format('DD/MM/YYYY');
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(date);
      return acc;
    }, {});

    let leaveWithCheckList = allLeaveStatus?.filter((item) => item && item?.status === 'Approved');

    // Create a map for fast lookup of leave records
    const leaveMap = leaveWithCheckList.reduce((acc, item) => {
      const userKey = `${item.employeeid}_${item.employeename}`;
      const leaveDates = item.date.map((date) => moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY'));
      if (!acc[userKey]) {
        acc[userKey] = [];
      }
      acc[userKey].push(...leaveDates);
      return acc;
    }, {});

    const employeeMatchesUser = (user, holiday) => {
      return holiday.company.includes(user.company) && holiday.applicablefor.includes(user.branch) && holiday.unit.includes(user.unit) && holiday.team.includes(user.team) && (holiday.employee.includes(user.companyname) || holiday.employee.includes('ALL'));
    };

    const holidayMap = holidays.reduce((acc, item) => {
      const date = moment(item.date).format('DD/MM/YYYY');

      filteredUsers.forEach((user) => {
        if (employeeMatchesUser(user, item)) {
          if (!acc[user.empcode]) {
            acc[user.empcode] = [];
          }
          acc[user.empcode].push(date);
        }
      });

      return acc;
    }, {});

    const checkStatusForPast3Days = (userId, empcode, employeename, weekOffDays) => {
      const userKey = `${empcode}_${employeename}`;
      let absentDays = 0;
      let leaveDays = 0;
      let holidayDays = 0;

      for (let date of pastThreeLeaveDays) {
        // const dayOfWeek = moment(date, "DD/MM/YYYY").format("dddd"); // Get day of the week

        // if (weekOffDays.includes(dayOfWeek)) {
        //   continue; // Skip week off days
        // }

        if (attendanceMap[userId] && attendanceMap[userId].includes(date)) {
          continue; // User was present on this date
        } else if (leaveMap[userKey] && leaveMap[userKey].includes(date)) {
          leaveDays++; // User was on leave on this date
        } else if (holidayMap[empcode] && holidayMap[empcode].includes(date)) {
          holidayDays++; // Holiday on this date
        } else {
          absentDays++; // User was absent on this date
        }
      }

      let status = null;
      if (absentDays >= 4) {
        status = 'Long Absent';
      } else if (leaveDays >= 4) {
        status = 'Long Leave';
      }

      return { status, absentDays, leaveDays, holidayDays };
    };

    const determineStatus = (attendanceStatus) => {
      return attendanceStatus ? attendanceStatus : null;
    };

    const enrichedLeaveAttendanceUsers = filteredUsers
      ?.map((user) => {
        const userId = user._id.toString();
        let weekOffDays = [];
        if (user.boardingLog && user.boardingLog.length > 0) {
          const lastBoardingLog = user.boardingLog[user.boardingLog.length - 1];
          weekOffDays = lastBoardingLog.weekoff || [];
        }

        const { status, absentDays, leaveDays } = checkStatusForPast3Days(userId, user.empcode, user.companyname, weekOffDays);

        return {
          ...user,

          attendanceStatus: !!status,
          noticePeriodStatus: false,
          livestatus: status ? false : null,
          userstatus: determineStatus(status),
          longAbsentCount: absentDays, // Long absent count
          longLeaveCount: leaveDays, // Long leave count
        };
      })
      .filter((user) => user.userstatus && user.userstatus !== 'Long Leave'); // Filter out users without attendance status

    // return{

    //   filterallDatauser: enrichedLeaveAttendanceUsers,
    //   length: enrichedLeaveAttendanceUsers?.length,
    // };
    let filteredUsernames = enrichedLeaveAttendanceUsers?.map((item) => item?.username);

    const resultForShift = await Attendance.aggregate([
      {
        $match: {
          username: { $in: filteredUsernames },
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by most recent
      },
      {
        $group: {
          _id: '$username',
          latestEntry: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$latestEntry' },
      },
    ]);

    let AMUsers = [];
    let PMUsers = [];

    resultForShift?.forEach((data) => {
      const lastTwo = data?.shiftname?.slice(-2);

      if (lastTwo?.toLowerCase() === 'am') {
        AMUsers.push(data?.username);
      } else {
        PMUsers.push(data?.username);
      }
    });
    disableDomainUsers(PMUsers);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// cron.schedule('0 0 * * *', () => {
//   console.log('Running task at Midnight!');
//   listOfLongAbsenteesPM();
// });

// cron.schedule('0 12 * * *', () => {
//   console.log('Running task at Noon!');
//   listOfLongAbsenteesAM();
// });


const disableDomainUsers = async (usernames) => {
  if (!Array.isArray(usernames) || usernames.length === 0) {
    return []; // Return an empty array if no usernames are provided
  }

  const ldapData = await LDAPsetting.find();
  if (!ldapData.length) {
    throw new Error('LDAP settings not found');
  }

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'),
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    reconnect: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  try {
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) return reject(new Error('LDAP Bind failed'));
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    const disableUser = async (username) => {
      return new Promise((resolve) => {
        const searchOptions = {
          scope: 'sub',
          filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
          attributes: ['dn'],
        };

        let userDN = null;

        client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
          if (err) {
            console.error(`❌ LDAP Search failed for ${username}:`, err);
            return resolve({ username, status: 'Search failed' });
          }

          res.on('searchEntry', (entry) => {
            userDN = entry.objectName;
          });

          res.on('end', () => {
            if (!userDN) {
              console.warn(`⚠️ User not found: ${username}`);
              return resolve({ username, status: 'User not found' });
            }

            const ACCOUNT_DISABLED = '514';
            const change = new ldap.Change({
              operation: 'replace',
              modification: new ldap.Attribute({
                type: 'userAccountControl',
                values: [ACCOUNT_DISABLED],
              }),
            });

            client.modify(userDN, change, (err) => {
              if (err) {
                console.error(`❌ Error disabling user ${username}:`, err);
                return resolve({ username, status: 'Disable failed' });
              }
              console.log(`✅ User disabled: ${username}`);
              resolve({ username, status: 'Disabled' });
            });
          });

          res.on('error', (searchErr) => {
            console.error(`❌ LDAP Search Error for ${username}:`, searchErr);
            resolve({ username, status: 'Search error' });
          });
        });
      });
    };

    const results = await Promise.all(usernames.map((username) => disableUser(username)));

    client.unbind((err) => {
      if (err) console.error('❌ LDAP Unbind Error:', err);
      else console.log('✅ LDAP Connection Closed');
    });

    return results;
  } catch (err) {
    client.unbind();
    throw new Error(err.message || 'Internal server error');
  }
};

const disabledUsernames = [
  'renukael',
  'vanithas',
  'stellamarya',
  'kanagam',
  'varsham',
  'devilakshmis',
  'rajarajeswarim',
  'parkavik',
  'vennilar',
  'santhiyad',
  'vanmathim',
  'abinayak',
  'kowsalyaka',
  'vijayalakshmib',
  'keerthanas',
  'priyadharshinia',
  'durgam',
  'malathid',
  'nicolinnishat',
  'bosiyas',
  'jerlinrosyj',
  'santhiyasi',
  'rohinir',
  'iswariyaan',
  'kiruthikas',
  'kalaivanith',
  'shyarlif',
  'vinithamaryfr',
  'amulranis',
  'pavithrapa',
  'snehan',
  'akilandeswarib',
  'anithase',
  'bhuvaneswaris',
  'ranjaneer',
  'jegadheeshwarim',
  'radhikar',
  'kavithapa',
  'rathikas',
  'kanimozhimat',
  'manis',
  'nirmaladevig',
  'mohanap',
  'irinsandilyasa',
  'kanimozhira',
  'pavithrapal',
  'radhikamaryfr',
  'jayashridu',
  'ranjithama',
  'ananthis',
  'nithyakalyanir',
  'sharmiladevir',
  'ganeshkumarp',
  'sugapriyara',
  'yogalakshmis',
  'rajeswarir',
  'mownikav',
  'marshalxaviers',
  'apput',
  'priyap',
  'saranyasu',
  'backiyalakshmis',
  'akilandeswarir',
  'nandhinik',
  'chitradevid',
  'abinayagu',
  'chandram',
  'anthonyj',
  'indhumathyr',
  'jeevitham',
  'jayaka',
  'aravinthr',
  'dhanalakshmith',
  'kalaiyarasive',
  'kaleeswarisr',
  'manjulapa',
  'sangeethamut',
  'sarithaa',
  'narkisbanuba',
  'annalakshmim',
  'santhiyakan',
  'dhanasrid',
  'priyadharshinimun',
  'kousalyare',
  'saranyacha',
  'karthikaut',
  'banupriyaka',
  'revathimu',
  'amsadhgans',
  'ramamurthyb',
  'mohamedfaiazs',
  'ragarajanm',
  'estherp',
  'akashe',
  'muthumeenap',
  'priyara',
  'harinit',
  'dineshkumark',
  'sarubalak',
  'indhumathipi',
  'lathaaru',
  'naveenj',
  'karthicke',
  'hemad',
  'umam',
  'roobinis',
  'lavanyamu',
  'eswarik',
  'lakshmia',
  'abiramise',
  'josphinea',
  'anandhim',
  'sathanad',
  'mohammedrabia',
  'mahamunim',
  'durgav',
  'vijayr',
  'sandiyas',
  'vinothinim',
  'keerthanak',
  'priyadharshinis',
  'rajeswarig',
  'priyadharshinir',
  'saranyach',
  'lavanyarat',
  'sangeethasr',
  'mathankumars',
  'rithikak',
  'nagaranin',
  'shanmugapriyab',
  'allendonaldp',
  'esharanik',
  'dineshs',
  'gopigop',
  'chithrap',
  'subhalaksmia',
  'sandhiyash',
  'vaithiyalingams',
  'pavithrasun',
  'pritheswarin',
  'jonali',
  'yasarahmedt',
  'kavyag',
  'keerthikasen',
  'ragavic',
  'thamasm',
  'yuvarajs',
  'arulpandiank',
  'manjularaj',
  'bhavadharaniv',
  'geethar',
  'soniyas',
  'brundhat',
  'abig',
  'jananis',
  'vasanthab',
  'keerthanaku',
  'venkatachalamp',
  'swathis',
  'yogalakshmir',
  'vincenta',
  'fardeenmohammedi',
  'rajeshkumarm',
  'deepikab',
  'sathishkumars',
  'kirusanthn',
  'niyapahamedm',
  'danielbenedicta',
  'brindhase',
  'sandhiyam',
  'jeevithas',
  'ambikas',
  'sangeethasri',
  'sharmilag',
  'sahayacelinamarya',
  'santhanamarymar',
  'sangeethaan',
  'aarthyp',
  'sagunthalam',
  'swathir',
  'ponnunjsirumbayel',
  'dhanusiyas',
  'logeswarim',
  'deepikal',
  'abinayap',
  'arulkavitham',
  'trysid',
  'kamalia',
  'deepasen',
  'kishenc',
  'aarthype',
  'cynthiyar',
  'imranusena',
  'neyaaashmim',
  'priyankac',
  'gayathrikat',
  'vijithrar',
  'yogeshwarik',
  'durgava',
  'dharshinik',
  'bhuvaneswarid',
  'aishwaryal',
  'kavipriyaa',
  'leelimaryb',
  'abinayar',
  'nivethas',
  'kiruthikasu',
  'mukilarasin',
  'navaneethaa',
  'priyarosyp',
  'dhanalakshmir',
  'rajeswaris',
  'joysonas',
  'preethis',
  'lathav',
  'aswinrajs',
  'shanmugasundaramt',
  'vijayapandiyanb',
  'rahavardhnip',
  'logeshwarig',
  'revathiraj',
  'rumirubinak',
  'dhanushas',
  'keerthanab',
  'priyay',
  'nexicateenaw',
  'keerthikam',
  'abiramyaj',
];

const disabledUsers = [
  'renukael',
  'kanagam',
  'varsham',
  'santhiyasi',
  'rohinir',
  'iswariyaan',
  'kiruthikas',
  'kalaivanith',
  'amulranis',
  'bhuvaneswaris',
  'ranjaneer',
  'jegadheeshwarim',
  'radhikar',
  'kavithapa',
  'rathikas',
  'manis',
  'nirmaladevig',
  'jayashridu',
  'ranjithama',
  'ananthis',
  'yogalakshmis',
  'priyap',
  'chandram',
  'anthonyj',
  'indhumathyr',
  'jeevitham',
  'dhanalakshmith',
  'kalaiyarasive',
  'kaleeswarisr',
  'narkisbanuba',
  'annalakshmim',
  'dhanasrid',
  'vijayalakshmiku',
  'saranyacha',
  'banupriyaka',
  'muthumeenap',
  'geethar',
  'soniyas',
  'sahayacelinamarya',
];

const enableUsers = async (usernames) => {
  if (!Array.isArray(usernames) || usernames.length === 0) {
    console.warn('⚠️ No usernames provided, skipping.');
    return [];
  }

  let client;
  try {
    const ldapData = await LDAPsetting.find();
    if (!ldapData.length) {
      throw new Error('LDAP settings not found');
    }

    const ldapConfig = {
      url: ldapData[0]?.ldapurl.replace(/^ldap:\/\//, 'ldaps://'),
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    client = ldap.createClient({
      url: ldapConfig.url,
      reconnect: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    // Securely bind to LDAP
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed: ' + err.message));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // Process all usernames in parallel
    const results = await Promise.all(
      usernames.map(async (username) => {
        try {
          const searchOptions = {
            scope: 'sub',
            filter: `(&(objectClass=user)(sAMAccountName=${username}))`,
            attributes: ['dn', 'sAMAccountName', 'userAccountControl'],
          };

          const userDN = await new Promise((resolve, reject) => {
            let found = false;
            client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
              if (err) {
                console.error(`❌ LDAP Search failed for ${username}:`, err);
                return reject(new Error('LDAP Search failed'));
              }

              res.on('searchEntry', (entry) => {
                if (entry.pojo && entry.pojo.objectName) {
                  found = true;
                  resolve(entry.pojo.objectName);
                }
              });

              res.on('end', () => {
                if (!found) {
                  console.warn(`⚠️ User not found: ${username}`);
                  reject(new Error('User not found'));
                }
              });

              res.on('error', (searchErr) => {
                console.error(`❌ LDAP Search error for ${username}:`, searchErr);
                reject(new Error('LDAP Search error'));
              });
            });
          });

          console.log(` Found User DN for ${username}: ${userDN}`);

          const ACCOUNT_ENABLED = '512';
          const change = new ldap.Change({
            operation: 'replace',
            modification: new ldap.Attribute({
              type: 'userAccountControl',
              values: [ACCOUNT_ENABLED],
            }),
          });

          // Modify user to enable account
          await new Promise((resolve, reject) => {
            client.modify(userDN, change, (err) => {
              if (err) {
                console.error(`❌ Error enabling user ${username}:`, err);
                return reject(new Error('Enable failed'));
              }
              console.log(`✅ User enabled: ${username}`);
              resolve();
            });
          });

          return { username, status: 'Enabled' };
        } catch (err) {
          return { username, status: err.message };
        }
      })
    );

    return results;
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return usernames.map((username) => ({
      username,
      status: err.message || 'Internal server error',
    }));
  } finally {
    // Ensure the LDAP client unbinds properly
    if (client) {
      client.unbind((err) => {
        if (err) console.error('❌ Error unbinding from LDAP:', err);
        else console.log('✅ LDAP Connection Closed Successfully');
      });
    }
  }
};

// enableUsers(disabledUsers);

exports.getHierarchyDisabledAndEnabledUsers = async (req, res, next) => {
  try {
    const ldapData = await LDAPsetting.find();
    if (!ldapData.length) {
      return next(new ErrorHandler('LDAP settings not found', 500));
    }

    // Ensure LDAP URL starts with ldaps://
    const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

    const ldapConfig = {
      url: ldapUrl,
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
    });

    // Handle unexpected connection errors
    client.on('error', (err) => {
      console.error('❌ LDAP Client Error:', err);
    });

    // Bind to LDAP server
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          return reject(new Error('LDAP Bind failed'));
        }
        console.log('✅ LDAP Bind successful');
        resolve();
      });
    });

    // Search for users
    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)',
      attributes: ['dn', 'sAMAccountName', 'userAccountControl', 'ou'],
      sizeLimit: 1000, // Prevent overload
      paged: { pageSize: 200 }, // Enable pagination
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          return reject(new Error('LDAP Search failed'));
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {};
              user.dn = entry.pojo.objectName;

              const samAccountNameAttr = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName');
              user.username = samAccountNameAttr?.values?.[0] || 'Unknown';

              const userAccountControlAttr = entry.pojo.attributes.find((attr) => attr.type === 'userAccountControl');
              const userAccountControl = userAccountControlAttr?.values?.[0] ? parseInt(userAccountControlAttr.values[0], 10) : 512;

              user.isDisabled = (userAccountControl & 2) !== 0; // ACCOUNTDISABLE flag check

              const ouAttr = entry.pojo.attributes.find((attr) => attr.type === 'ou');
              user.ou = ouAttr?.values?.[0] || extractOUFromDN(user.dn);

              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing search entry:', entryError);
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('LDAP Search error'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAP Search completed');
          resolve(userList);
        });
      });
    });

    // Categorize users
    const categorizedUsers = users.reduce((acc, user) => {
      const ou = user.ou;
      const status = user.isDisabled ? 'disabled' : 'enabled';

      if (!acc[ou]) {
        acc[ou] = { enabled: [], disabled: [] };
      }

      acc[ou][status].push(user);
      return acc;
    }, {});

    // Unbind the client properly
    await new Promise((resolve, reject) => {
      client.unbind((err) => {
        if (err) {
          console.error('❌ Error unbinding from LDAP:', err);
          reject(new Error('LDAP Unbind Error'));
        } else {
          console.log('✅ LDAP Unbind successful');
          resolve();
        }
      });
    });

    const extractUsers = (data) => {
      let usersArray = [];
      Object.values(data.users).forEach((group) => {
        if (group.enabled) {
          usersArray = usersArray.concat(group.enabled);
        }
        if (group.disabled) {
          usersArray = usersArray.concat(group.disabled);
        }
      });
      return usersArray;
    };

    const usersFinal = extractUsers({ users: categorizedUsers });

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    const aggregationPipeline = [
      {
        $match: {
          resonablestatus: { $nin: resonablestatusarray },
        },
      },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ];
    const localusers = await User.aggregate(aggregationPipeline);

    let mappedDatas = localusers
      ?.map((data) => {
        let foundData = usersFinal?.find((item) => item?.username === data?.username);
        return {
          ...data,
          ...(foundData || {}),
          accountstatus: foundData?.isDisabled ? 'Disabled' : 'Enabled',
          employeementtype: data?.workmode === 'Internship' ? 'Internship' : 'Employee',
        };
      })
      .filter((filterData) => filterData?.ou);
    req.body.result = mappedDatas;
    await exports.getAllRemoteHierarchyBasedUsers(req, res, next);
    // return res.status(200).json({ users: mappedDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.getHierarchyLockedAndUnlockedUsers = async (req, res, next) => {
  try {
    const ldapData = await LDAPsetting.find();

    if (!ldapData.length) {
      return res.status(400).json({ message: 'LDAP configuration not found' });
    }

    // Determine if using LDAP or LDAPS
    const ldapUrl = ldapData[0]?.ldapurl.startsWith('ldaps://') ? ldapData[0]?.ldapurl : `ldaps://${ldapData[0]?.ldapurl.replace(/^ldap:\/\//, '')}`;

    const ldapConfig = {
      url: ldapUrl,
      bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
      bindPassword: ldapData[0]?.ldappassword,
      baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    };

    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: {
        rejectUnauthorized: false, // Set to `true` in production with valid certificates
      },
    });

    // Bind to LDAP Server securely
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAP Bind failed:', err);
          reject(new Error('Failed to authenticate with LDAP server'));
        } else {
          console.log('✅ LDAP Bind successful');
          resolve();
        }
      });
    });

    // Search for all users
    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)', // Search for all users
      attributes: ['dn', 'sAMAccountName', 'lockoutTime', 'ou'],
      sizeLimit: 1000, // Prevent overload
      paged: { pageSize: 200 }, // Enable pagination
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAP Search failed:', err);
          reject(new Error('Failed to retrieve users from LDAP'));
          return;
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {};

              user.dn = entry.pojo.objectName;
              user.username = entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName')?.values?.[0] || 'Unknown';

              const lockoutTimeAttr = entry.pojo.attributes.find((attr) => attr.type === 'lockoutTime');
              const lockoutTime = lockoutTimeAttr?.values?.[0] ? parseInt(lockoutTimeAttr.values[0], 10) : 0;
              user.isLocked = lockoutTime > 0;

              user.ou = entry.pojo.attributes.find((attr) => attr.type === 'ou')?.values?.[0] || extractOUFromDN(user.dn);

              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing LDAP entry:', entryError);
            reject(new Error('Error processing LDAP user data'));
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAP Search error:', err);
          reject(new Error('Error during LDAP search'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAP Search completed');
          resolve(userList);
        });
      });
    });

    // Categorize users by OU and lock status
    const categorizedUsers = users.reduce((acc, user) => {
      const ou = user.ou;
      const status = user.isLocked ? 'locked' : 'unlocked';

      if (!acc[ou]) {
        acc[ou] = { locked: [], unlocked: [] };
      }

      acc[ou][status].push(user);
      return acc;
    }, {});

    // Ensure client unbinds properly
    client.unbind((err) => {
      if (err) console.error('❌ Error unbinding from LDAP:', err);
    });

    // Extract users into a flat array
    const extractUsers = (data) => {
      return Object.values(data.users).flatMap((group) => [...(group.locked || []), ...(group.unlocked || [])]);
    };

    const usersFinal = extractUsers({ users: categorizedUsers });

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    // Fetch local user data
    const localusers = await User.aggregate([
      { $match: { resonablestatus: { $nin: resonablestatusarray } } },
      {
        $project: {
          company: 1,
          branch: 1,
          unit: 1,
          team: 1,
          department: 1,
          designation: 1,
          empcode: 1,
          username: 1,
          companyname: 1,
          workmode: 1,
          originalpassword: 1,
        },
      },
    ]);

    // Merge LDAP and local user data
    let mappedDatas = localusers
      .map((data) => {
        let foundData = usersFinal.find((item) => item?.username === data?.username);
        return {
          ...data,
          ...(foundData || {}),
          lockedstatus: foundData?.isLocked ? 'Locked' : 'Unlocked',
          employeementtype: data?.workmode === 'Internship' ? 'Internship' : 'Employee',
        };
      })
      .filter((filterData) => filterData?.ou);

    req.body.result = mappedDatas;
    await exports.getAllRemoteHierarchyBasedUsers(req, res, next);

    // return res.status(200).json({ users: mappedDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.getHierarchyUsersByAccountControl = catchAsyncErrors(async (req, res, next) => {
  const ldapData = await LDAPsetting.find();

  const ldapConfig = {
    url: ldapData[0]?.ldapurl.replace('ldap://', 'ldaps://'),
    bindDN: `CN=${ldapData[0]?.cnname},CN=${ldapData[0]?.cnnametwo},DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    bindPassword: ldapData[0]?.ldappassword,
    baseDN: `DC=${ldapData[0]?.dcnameone},DC=${ldapData[0]?.dcnametwo}`,
    tlsOptions: { rejectUnauthorized: false },
  };

  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: ldapConfig.tlsOptions,
    reconnect: true,
  });

  try {
    await new Promise((resolve, reject) => {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          console.error('❌ LDAPS Bind failed:', err);
          return reject(new Error('LDAPS Bind failed'));
        }
        console.log('✅ LDAPS Bind successful');
        resolve();
      });
    });

    const searchOptions = {
      scope: 'sub',
      filter: '(objectClass=user)',
      attributes: ['dn', 'sAMAccountName', 'userAccountControl', 'ou', 'sn', 'cn'],
      paged: { pageSize: 50, pagePause: false }, // Reduced page size to avoid overload
    };

    const users = await new Promise((resolve, reject) => {
      const userList = [];
      client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
        if (err) {
          console.error('❌ LDAPS Search failed:', err);
          return reject(new Error('LDAPS Search failed'));
        }

        searchRes.on('searchEntry', (entry) => {
          try {
            if (entry.pojo && entry.pojo.attributes) {
              const user = {
                dn: entry.pojo.objectName,
                username: entry.pojo.attributes.find((attr) => attr.type === 'sAMAccountName')?.values?.[0] || 'Unknown',
                userAccountControl: parseInt(entry.pojo.attributes.find((attr) => attr.type === 'userAccountControl')?.values?.[0] || '512', 10),
                ou: entry.pojo.attributes.find((attr) => attr.type === 'ou')?.values?.[0] || extractOUFromDN(entry.pojo.objectName),
                sn: entry.pojo.attributes.find((attr) => attr.type === 'sn')?.values?.[0] || 'Unknown',
                cn: entry.pojo.attributes.find((attr) => attr.type === 'cn')?.values?.[0] || 'Unknown',
              };
              userList.push(user);
            }
          } catch (entryError) {
            console.error('❌ Error processing search entry:', entryError);
            return reject(new Error('Error processing search entry'));
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ LDAPS Search error:', err);
          return reject(new Error('LDAPS Search error'));
        });

        searchRes.on('end', () => {
          console.log('✅ LDAPS Search completed');
          resolve(userList);
        });
      });
    });

    const categorizedUsers = users.reduce((acc, user) => {
      const accountControl = user.userAccountControl.toString();
      if (!acc[accountControl]) acc[accountControl] = [];
      acc[accountControl].push(user);
      return acc;
    }, {});

    const extractUsers = (data) => Object.values(data.users).flat();
    const usersFinal = extractUsers({ users: categorizedUsers });

    const resonablestatusarray = ['Absconded', 'Hold', 'Terminate', 'Releave Employee', 'Not Joined', 'Postponed', 'Rejected', 'Closed'];

    const localusers = await User.aggregate([{ $match: { resonablestatus: { $nin: resonablestatusarray } } }, { $project: { company: 1, branch: 1, unit: 1, team: 1, department: 1, designation: 1, empcode: 1, username: 1, companyname: 1, workmode: 1, originalpassword: 1 } }]);

    let mappedDatas = usersFinal?.map((data) => {
      let foundData = localusers?.find((item) => item?.username === data?.username);
      return {
        ...data,
        ...(foundData || {}),
        accountstatus:
          {
            512: 'Normal account + Password Required',
            544: 'Normal account + Password Not Required',
            66048: 'Password never expires',
            4096: 'Workstation Trust Account',
            514: 'Account Disabled',
            532480: 'Domain Controller Account',
            546: 'Server Trust Account',
          }[data?.userAccountControl] || '',
        employeementtype: foundData?.workmode === 'Internship' ? 'Internship' : 'Employee',
        matchstatus: foundData ? 'Matched' : 'Mismatched',
      };
    });

    // **Ensure connection is closed before sending the response**
    try {
      client.unbind((err) => {
        if (err) console.error('❌ Error unbinding from LDAPS:', err);
      });
    } catch (unbindError) {
      console.error('❌ Failed to unbind LDAP client:', unbindError);
    }
    req.body.result = mappedDatas;
    await exports.getAllRemoteHierarchyBasedUsers(req, res, next);
    // return res.status(200).json({ users: mappedDatas });
  } catch (err) {
    console.error('❌ Internal Error:', err);

    if (err.message.includes('ECONNRESET')) {
      return res.status(500).json({ message: 'Connection reset by LDAP server. Please retry later.' });
    }

    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

exports.getAllRemoteHierarchyBasedUsers = catchAsyncErrors(async (req, res, next) => {
  let resultArray,
    user,
    result1,
    ans1D,
    i = 1,
    result2,
    result3,
    result4,
    result5,
    result6,
    dataCheck,
    userFilter,
    result,
    hierarchyFilter,
    answerDef,
    hierarchyFinal,
    hierarchy,
    hierarchyDefList,
    resultAccessFilter,
    branch,
    hierarchySecond,
    overallMyallList,
    hierarchyMap,
    resulted,
    resultedTeam,
    DataAccessMode = false,
    myallTotalNames;

  try {
    const { listpageaccessmode } = req.body;
    let levelFinal = req.body?.sector === 'all' ? ['Primary', 'Secondary', 'Tertiary'] : [req.body?.sector];
    let answer = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: req?.body?.username, // Match supervisorchoose with username
          level: { $in: levelFinal }, // Corrected unmatched quotation mark
        },
      },
      {
        $lookup: {
          from: 'reportingheaders',
          let: {
            teamControlsArray: {
              $ifNull: ['$pagecontrols', []],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ['$name', '$$teamControlsArray'],
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ],
                    }, // Additional condition for reportingnew array
                  ],
                },
              },
            },
          ],
          as: 'reportData', // The resulting matched documents will be in this field
        },
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1,
        },
      },
    ]);

    // Manager Condition Without Supervisor
    const HierarchySupervisorFind = await Hirerarchi.find({ supervisorchoose: req?.body?.username });
    DataAccessMode = req.body.role?.some(role => role.toLowerCase() === "manager") && HierarchySupervisorFind?.length === 0;
    const { uniqueNames, pageControlsData } = await Hierarchyfilter(levelFinal, req?.body?.pagename);

    let restrictList = answer?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);

    result = req.body.result;

    // Accordig to sector and list filter process
    hierarchyFilter = await Hirerarchi.find({ level: req.body.sector });

    userFilter = hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

    hierarchyDefList = await Hirerarchi.find();
    user = await User.find({ companyname: req.body.username });
    const userFilt = user.length > 0 && user[0].designation;
    const desiGroup = await Designation.find();
    let HierarchyFilt = req.body.sector === 'all' ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup) : hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.designationgroup);
    const DesifFilter = desiGroup.filter((data) => HierarchyFilt.includes(data.group));
    const desigName = DesifFilter.length > 0 && DesifFilter[0].name;
    const SameDesigUser = HierarchyFilt.includes('All') ? true : userFilt === desigName;
    //Default Loading of List
    answerDef = hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)).map((data) => data.employeename);

    hierarchyFinal = req.body.sector === 'all' ? (answerDef.length > 0 ? [].concat(...answerDef) : []) : hierarchyFilter.length > 0 ? [].concat(...userFilter) : [];

    hierarchyMap = hierarchyFinal.length > 0 ? hierarchyFinal : [];

    //solo
    ans1D = req.body.sector === 'all' ? (answerDef.length > 0 ? hierarchyDefList.filter((data) => data.supervisorchoose.includes(req.body.username)) : []) : hierarchyFilter.length > 0 ? hierarchyFilter.filter((data) => data.supervisorchoose.includes(req.body.username)) : [];
    result1 =
      ans1D.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = ans1D.find((item2) => item2.employeename.includes(item1.companyname));

            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              //   return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];

    resulted = result1;

    //team
    let branches = [];
    hierarchySecond = await Hirerarchi.find();

    const subBranch =
      hierarchySecond.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';

    const answerFilterExcel = hierarchySecond.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => hierarchyMap.includes(name))) : [];

    result2 =
      answerFilterExcel.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel.find((item2) => item2.employeename.includes(item1.companyname));
            if (matchingItem2) {
              // If a match is found, inject the control property into the corresponding item in an1
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...subBranch);

    const ans =
      subBranch.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';
    const answerFilterExcel2 = subBranch.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => subBranch.includes(name))) : [];

    result3 =
      answerFilterExcel2.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel2.find((item2) => item2.employeename.includes(item1.companyname));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;

              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...ans);

    const loop3 =
      ans.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => ans.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';

    const answerFilterExcel3 = ans.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => ans.includes(name))) : [];

    result4 =
      answerFilterExcel3.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel3?.find((item2) => item2.employeename.includes(item1.companyname));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop3);

    const loop4 =
      loop3.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => loop3.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : [];
    const answerFilterExcel4 = loop3.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop3.includes(name))) : [];
    result5 =
      answerFilterExcel4.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel4?.find((item2) => item2.employeename.includes(item1.companyname));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop4);

    const loop5 =
      loop4.length > 0
        ? hierarchySecond
          .filter((item) => item.supervisorchoose.some((name) => loop4.includes(name)))
          .map((item) => item.employeename)
          .flat()
        : '';
    const answerFilterExcel5 = loop4.length > 0 ? hierarchySecond.filter((item) => item.supervisorchoose.some((name) => loop4.includes(name))) : [];
    result6 =
      answerFilterExcel5.length > 0
        ? result
          .map((item1) => {
            const matchingItem2 = answerFilterExcel5?.find((item2) => item2.employeename.includes(item1.companyname));
            if (matchingItem2) {
              const plainItem1 = item1.toObject ? item1.toObject() : item1;
              return {
                ...plainItem1,
                level: req.body.sector + '-' + matchingItem2.control,
              };
              // If a match is found, inject the control property into the corresponding item in an1
              // return { ...item1, level: req.body.sector + "-" + matchingItem2.control };
            }
          })
          .filter((item) => item !== undefined)
        : [];
    branches.push(...loop5);

    resultedTeam = [...result2, ...result3, ...result4, ...result5, ...result6];
    //overall Teams List
    myallTotalNames = DataAccessMode ? uniqueNames : [...hierarchyMap, ...branches];


    const finalResult = result?.filter(data => myallTotalNames?.includes(data?.companyname));



    overallMyallList = [...resulted, ...resultedTeam];

    const restrictTeam = await Hirerarchi.aggregate([
      {
        $match: {
          supervisorchoose: { $in: myallTotalNames }, // Match supervisorchoose with username
          level: { $in: levelFinal }, // Corrected unmatched quotation mark
        },
      },
      {
        $lookup: {
          from: 'reportingheaders',
          let: {
            teamControlsArray: {
              $ifNull: ['$pagecontrols', []],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ['$name', '$$teamControlsArray'],
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        req?.body?.pagename,
                        '$reportingnew', // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ],
                    }, // Additional condition for reportingnew array
                  ],
                },
              },
            },
          ],
          as: 'reportData', // The resulting matched documents will be in this field
        },
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1,
        },
      },
    ]);
    let restrictListTeam = DataAccessMode ? pageControlsData : restrictTeam?.filter((data) => data?.reportData?.length > 0)?.flatMap((Data) => Data?.employeename);
    let overallRestrictList = DataAccessMode ? restrictListTeam : (req.body.hierachy === 'myhierarchy' ? restrictList : req.body.hierachy === 'allhierarchy' ? restrictListTeam : [...restrictList, ...restrictListTeam]);

    let resultAccessFiltered = DataAccessMode ? finalResult : (
      req.body.hierachy === 'myhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
        ? resulted
        : req.body.hierachy === 'allhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
          ? resultedTeam
          : req.body.hierachy === 'myallhierarchy' && (listpageaccessmode === 'Hierarchy Based' || listpageaccessmode === 'Overall')
            ? overallMyallList
            : result);

    resultAccessFilter = overallRestrictList?.length > 0 ? resultAccessFiltered?.filter((data) => overallRestrictList?.includes(data?.companyname)) : [];
  } catch (err) {
    return next(new ErrorHandler('Records not found!', 404));
  }
  return res.status(200).json({
    resultedTeam,
    resultAccessFilter,
    hierarchyFilter,
  });
});
