const authService = require('../src/services/AuthService');
const userRepository = require('../src/repositories/UserRepository');
const bcrypt = require('bcryptjs');

jest.mock('../src/repositories/UserRepository');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register should create new user and return tokens', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 'user-uuid-1',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      created_at: new Date(),
    });

    const result = await authService.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.name).toBe('Test User');
    expect(result.user.email).toBe('test@example.com');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });

  test('login should validate password and return tokens', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-uuid-1',
      name: 'Test User',
      email: 'test@example.com',
      password_hash: hashedPassword,
      avatar_url: null,
      created_at: new Date(),
    });

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  test('login with incorrect password should throw UnauthorizedError', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-uuid-1',
      email: 'test@example.com',
      password_hash: hashedPassword,
    });

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid email or password');
  });
});
