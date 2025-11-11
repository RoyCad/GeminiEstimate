

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const adminEmails = ['royconstruction000@gmail.com'];

// This function is triggered when a new project is created, which might involve creating a new user.
exports.createUser = functions.https.onCall(async (data, context) => {
  // We are removing admin check for now to simplify development
  // if (!context.auth || !context.auth.token.admin) {
  //   throw new functions.https.HttpsError('permission-denied', 'You do not have permission to create new users.');
  // }

  const { email, password, displayName } = data;
  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required arguments: email, password, displayName.');
  }

  try {
    // Check if user already exists
    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            userRecord = await admin.auth().createUser({ email, password, displayName });
        } else {
            throw error; // Re-throw other errors
        }
    }

    const isUserAdmin = adminEmails.includes(email);
    
    // Set custom claim if the new user is an admin.
    if (isUserAdmin) {
        const currentClaims = userRecord.customClaims || {};
        if (!currentClaims.admin) {
            await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        }
    }

    // Create or update user document in Firestore.
    await admin.firestore().collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        displayName,
        email,
        role: isUserAdmin ? 'Admin' : 'Client',
        creationTime: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { uid: userRecord.uid };

  } catch (error) {
    console.error("Error creating or updating user:", error);
    if (error.code === 'auth/email-already-exists') {
         throw new functions.https.HttpsError('already-exists', 'This email address is already in use by another account.');
    }
    throw new functions.https.HttpsError('internal', 'An internal error occurred while creating the user.');
  }
});
