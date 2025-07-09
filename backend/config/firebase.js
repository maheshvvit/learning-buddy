const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      });

      console.log('Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

// Real-time database operations
const updateUserProgress = async (userId, progressData) => {
  try {
    const db = admin.database();
    const ref = db.ref(`users/${userId}/progress`);
    await ref.update({
      ...progressData,
      lastUpdated: admin.database.ServerValue.TIMESTAMP
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

const updateLeaderboard = async (userId, userData) => {
  try {
    const db = admin.database();
    const ref = db.ref(`leaderboard/${userId}`);
    await ref.set({
      ...userData,
      lastUpdated: admin.database.ServerValue.TIMESTAMP
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

const sendNotification = async (userId, notification) => {
  try {
    const db = admin.database();
    const ref = db.ref(`notifications/${userId}`);
    await ref.push({
      ...notification,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      read: false
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const broadcastAchievement = async (userId, achievement) => {
  try {
    const db = admin.database();
    const ref = db.ref('achievements');
    await ref.push({
      userId,
      ...achievement,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
  } catch (error) {
    console.error('Error broadcasting achievement:', error);
    throw error;
  }
};

module.exports = {
  admin,
  initializeFirebase,
  updateUserProgress,
  updateLeaderboard,
  sendNotification,
  broadcastAchievement,
};

