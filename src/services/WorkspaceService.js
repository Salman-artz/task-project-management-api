const { v4: uuidv4 } = require('uuid');
const workspaceRepository = require('../repositories/WorkspaceRepository');
const userRepository = require('../repositories/UserRepository');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../utils/errors');

class WorkspaceService {
  /**
   * Get all workspaces for a user
   */
  async getUserWorkspaces(userId) {
    const memberships = await workspaceRepository.findUserMemberships(userId);

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      description: m.workspace.description,
      owner: m.workspace.owner,
      role: m.role,
      member_count: m.workspace.member_count || 0,
      created_at: m.workspace.created_at,
    }));
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId, userId) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const workspace = await workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const jsonWorkspace = workspace.toJSON();
    if (jsonWorkspace.memberEntries) {
      jsonWorkspace.members = jsonWorkspace.memberEntries;
      delete jsonWorkspace.memberEntries;
    }

    return {
      ...jsonWorkspace,
      my_role: membership.role,
    };
  }

  /**
   * Create workspace
   */
  async createWorkspace(userId, { name, description }) {
    const workspaceId = uuidv4();

    const workspace = await workspaceRepository.createWorkspace(
      {
        id: workspaceId,
        name,
        description: description || null,
        owner_id: userId,
      },
      {
        id: uuidv4(),
        workspace_id: workspaceId,
        user_id: userId,
        role: 'owner',
      }
    );

    return workspace;
  }

  /**
   * Update workspace
   */
  async updateWorkspace(workspaceId, userId, updateData) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can update workspace');
    }

    const fieldsToUpdate = {};
    if (updateData.name) fieldsToUpdate.name = updateData.name;
    if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description;

    return await workspaceRepository.updateWorkspace(workspace, fieldsToUpdate);
  }

  /**
   * Delete workspace (owner only)
   */
  async deleteWorkspace(workspaceId, userId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.owner_id !== userId) {
      throw new ForbiddenError('Only workspace owner can delete workspace');
    }

    await workspaceRepository.deleteWorkspace(workspace);
    return { message: 'Workspace deleted successfully' };
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(workspaceId, userId, { email, role = 'member' }) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can invite members');
    }

    const invitedUser = await userRepository.findByEmail(email);
    if (!invitedUser) {
      throw new BadRequestError(`User with email ${email} not found`);
    }

    const existingMember = await workspaceRepository.findMember(workspaceId, invitedUser.id);

    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    await workspaceRepository.addMember({
      id: uuidv4(),
      workspace_id: workspaceId,
      user_id: invitedUser.id,
      role,
    });

    return {
      user: {
        id: invitedUser.id,
        name: invitedUser.name,
        email: invitedUser.email,
      },
      role,
    };
  }

  /**
   * Update member role
   */
  async updateMemberRole(workspaceId, userId, targetUserId, newRole) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenError('Only workspace owner can change member roles');
    }

    const targetMembership = await workspaceRepository.findMember(workspaceId, targetUserId);

    if (!targetMembership) {
      throw new NotFoundError('Member not found in this workspace');
    }

    if (targetMembership.role === 'owner') {
      throw new BadRequestError('Cannot change owner role');
    }

    return await workspaceRepository.updateMemberRole(targetMembership, newRole);
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId, userId, targetUserId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const membership = await workspaceRepository.findMember(workspaceId, userId);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new ForbiddenError('Only owner or admin can remove members');
    }

    const targetMembership = await workspaceRepository.findMember(workspaceId, targetUserId);

    if (!targetMembership) {
      throw new NotFoundError('Member not found in this workspace');
    }

    if (targetMembership.role === 'owner') {
      throw new BadRequestError('Cannot remove workspace owner');
    }

    if (membership.role === 'admin' && targetMembership.role === 'admin') {
      throw new ForbiddenError('Admin cannot remove another admin');
    }

    await workspaceRepository.removeMember(targetMembership);
    return { message: 'Member removed successfully' };
  }
}

module.exports = new WorkspaceService();
