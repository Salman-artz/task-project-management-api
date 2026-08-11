const db = require('./src/database/models');

async function fixAvatars() {
  try {
    const users = await db.User.findAll();
    let count = 0;
    for (const user of users) {
      if (user.avatar_url && user.avatar_url.startsWith('data:image')) {
        user.avatar_url = null;
        await user.save();
        count++;
      }
    }
    console.log(`Fixed ${count} users with corrupted base64 avatars.`);
  } catch (error) {
    console.error('Error fixing avatars:', error);
  } finally {
    process.exit(0);
  }
}

fixAvatars();
