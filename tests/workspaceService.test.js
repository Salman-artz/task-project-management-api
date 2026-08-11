const workspaceService = require('../src/services/WorkspaceService');
const workspaceRepository = require('../src/repositories/WorkspaceRepository');
const userRepository = require('../src/repositories/UserRepository');

jest.mock('../src/repositories/WorkspaceRepository');
jest.mock('../src/repositories/UserRepository');

describe('WorkspaceService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserWorkspaces should return mapped workspaces', async () => {
    workspaceRepository.findUserMemberships.mockResolvedValue([
      {
        role: 'owner',
        workspace: {
          id: 'ws-1',
          name: 'Workspace Alpha',
          description: 'Desc',
          owner: { id: 'user-1', name: 'Owner' },
          member_count: 3,
          created_at: new Date(),
        },
      },
    ]);

    const result = await workspaceService.getUserWorkspaces('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Workspace Alpha');
    expect(result[0].role).toBe('owner');
  });

  test('createWorkspace should create workspace and owner member', async () => {
    workspaceRepository.createWorkspace.mockResolvedValue({
      id: 'ws-1',
      name: 'New Workspace',
      description: 'Desc',
      owner_id: 'user-1',
    });

    const result = await workspaceService.createWorkspace('user-1', {
      name: 'New Workspace',
      description: 'Desc',
    });

    expect(result.name).toBe('New Workspace');
    expect(workspaceRepository.createWorkspace).toHaveBeenCalledTimes(1);
  });

  test('inviteMember should add new workspace member if permissions match', async () => {
    workspaceRepository.findById.mockResolvedValue({ id: 'ws-1', name: 'WS' });
    workspaceRepository.findMember.mockImplementation((wsId, uId) => {
      if (uId === 'inviter-id') return Promise.resolve({ role: 'owner' });
      return Promise.resolve(null);
    });
    userRepository.findByEmail.mockResolvedValue({
      id: 'target-id',
      name: 'Target User',
      email: 'target@example.com',
    });
    workspaceRepository.addMember.mockResolvedValue({});

    const result = await workspaceService.inviteMember('ws-1', 'inviter-id', {
      email: 'target@example.com',
      role: 'member',
    });

    expect(result.user.email).toBe('target@example.com');
    expect(result.role).toBe('member');
  });
});
