const db = require('./src/database/models');

async function deleteAllWorkspaces() {
  try {
    const workspaces = await db.Workspace.findAll();
    let count = 0;
    for (const ws of workspaces) {
      await db.WorkspaceMember.destroy({ where: { workspace_id: ws.id } });
      await db.Project.destroy({ where: { workspace_id: ws.id } });
      await db.ActivityLog.destroy({ where: { workspace_id: ws.id } });
      await ws.destroy();
      count++;
    }
    console.log(`Deleted ${count} workspaces successfully.`);
  } catch (error) {
    console.error('Error deleting workspaces:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllWorkspaces();
