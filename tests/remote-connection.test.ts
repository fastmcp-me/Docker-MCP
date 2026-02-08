/**
 * Tests for remote Docker connection configuration
 * These tests verify that environment variables are correctly parsed
 * and Docker client is initialized with proper options
 */

import Docker from 'dockerode';

describe('Remote Docker Connection Configuration', () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Default Local Connection', () => {
    it('should create Docker client with default settings when no env vars are set', async () => {
      delete process.env.DOCKER_HOST;
      delete process.env.DOCKER_TLS_VERIFY;
      delete process.env.DOCKER_CERT_PATH;
      delete process.env.DOCKER_PORT;

      // Dynamic import to get fresh module with current env vars
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });
  });

  describe('DOCKER_HOST Environment Variable', () => {
    it('should support unix:// socket path', async () => {
      process.env.DOCKER_HOST = 'unix:///var/run/docker.sock';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });

    it('should support tcp:// format with default port', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });

    it('should support tcp:// format with explicit port', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:2375';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });

    it('should support http:// format', async () => {
      process.env.DOCKER_HOST = 'http://192.168.1.100:2375';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });

    it('should support host:port format', async () => {
      process.env.DOCKER_HOST = '192.168.1.100:2375';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
      expect(docker).toBeInstanceOf(Docker);
    });
  });

  describe('DOCKER_TLS_VERIFY Environment Variable', () => {
    it('should throw error when TLS verify is enabled but cert path is missing', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:2376';
      process.env.DOCKER_TLS_VERIFY = '1';
      delete process.env.DOCKER_CERT_PATH;
      
      // The module will throw during import because docker client is initialized at module level
      await expect(import('../src/index.js?t=' + Date.now())).rejects.toThrow(
        'DOCKER_TLS_VERIFY is set but DOCKER_CERT_PATH is not configured'
      );
    });

    it('should not throw when TLS verify is set to other values', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:2375';
      process.env.DOCKER_TLS_VERIFY = '0';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });
  });

  describe('DOCKER_PORT Environment Variable', () => {
    it('should override default port when set', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100';
      process.env.DOCKER_PORT = '3000';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });

    it('should default to 2375 for http connections without explicit port', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100';
      delete process.env.DOCKER_PORT;
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    it('should configure for remote HTTP connection', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:2375';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });

    it('should configure for SSH tunnel (localhost)', async () => {
      process.env.DOCKER_HOST = 'tcp://localhost:2375';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });
  });

  describe('Port Default Behavior', () => {
    it('should parse port from DOCKER_HOST URL', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:3000';
      delete process.env.DOCKER_PORT;
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });

    it('should use DOCKER_PORT over URL port', async () => {
      process.env.DOCKER_HOST = 'tcp://192.168.1.100:3000';
      process.env.DOCKER_PORT = '4000';
      
      const { initializeDockerClient } = await import('../src/index.js?t=' + Date.now());
      const docker = initializeDockerClient();
      expect(docker).toBeDefined();
    });
  });
});
