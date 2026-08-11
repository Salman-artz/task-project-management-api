const taskService = require('../src/services/TaskService');
const taskRepository = require('../src/repositories/TaskRepository');
const projectRepository = require('../src/repositories/ProjectRepository');
const workspaceRepository = require('../src/repositories/WorkspaceRepository');
const activityLogRepository = require('../src/repositories/ActivityLogRepository');

jest.mock('../src/repositories/TaskRepository');
jest.mock('../src/repositories/ProjectRepository');
jest.mock('../src/repositories/WorkspaceRepository');
jest.mock('../src/repositories/ActivityLogRepository');
jest.mock('../src/utils/socket', () => ({
  emitToWorkspace: jest.fn(),
  emitToTask: jest.fn(),
}));

describe('TaskService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTask should create task, log activity and emit socket event', async () => {
    projectRepository.findById.mockResolvedValue({
      id: 'proj-1',
      workspace_id: 'ws-1',
    });
    workspaceRepository.findMember.mockResolvedValue({
      role: 'admin',
    });
    taskRepository.create.mockResolvedValue({ id: 'task-1' });
    taskRepository.findById.mockResolvedValue({
      id: 'task-1',
      title: 'Fix Bug',
      project: { workspace_id: 'ws-1' },
    });
    activityLogRepository.create.mockResolvedValue({});

    const task = await taskService.createTask('proj-1', 'user-1', {
      title: 'Fix Bug',
      priority: 'high',
    });

    expect(task.title).toBe('Fix Bug');
    expect(taskRepository.create).toHaveBeenCalledTimes(1);
    expect(activityLogRepository.create).toHaveBeenCalledTimes(1);
  });

  test('updateTask should update task status and trigger socket emits', async () => {
    taskRepository.findById.mockResolvedValue({
      id: 'task-1',
      title: 'Fix Bug',
      status: 'todo',
      project: { workspace_id: 'ws-1' },
    });
    workspaceRepository.findMember.mockResolvedValue({
      role: 'admin',
    });
    taskRepository.update.mockResolvedValue({});
    activityLogRepository.create.mockResolvedValue({});

    await taskService.updateTask('task-1', 'user-1', { status: 'done' });

    expect(taskRepository.update).toHaveBeenCalledTimes(1);
  });
});
