const db = require('../database/models');

class WorkspaceRepository {
  async findUserMemberships(userId) {
    return await db.WorkspaceMember.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.Workspace,
          as: 'workspace',
          include: [
            { model: db.User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar_url'] },
          ],
        },
      ],
    });
  }

  async findMember(workspaceId, userId) {
    return await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
  }

  async findById(workspaceId) {
    return await db.Workspace.findByPk(workspaceId, {
      include: [
        { model: db.User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar_url'] },
        {
          model: db.WorkspaceMember,
          as: 'memberEntries',
          include: [
            { model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'avatar_url'] },
          ],
        },
      ],
    });
  }

  async createWorkspace(workspaceData, memberData) {
    const workspace = await db.Workspace.create(workspaceData);
    await db.WorkspaceMember.create(memberData);
    return workspace;
  }

  async updateWorkspace(workspace, updateData) {
    Object.assign(workspace, updateData);
    return await workspace.save();
  }

  async deleteWorkspace(workspace) {
    return await workspace.destroy();
  }

  async addMember(memberData) {
    return await db.WorkspaceMember.create(memberData);
  }

  async updateMemberRole(membership, newRole) {
    membership.role = newRole;
    return await membership.save();
  }

  async removeMember(membership) {
    return await membership.destroy();
  }
}

module.exports = new WorkspaceRepository();
