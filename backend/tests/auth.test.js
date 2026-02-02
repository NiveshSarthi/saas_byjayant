const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // We'll need to export app from server.js
const User = require('../models/User');
const Role = require('../models/Role');

let mongoServer;
let adminToken;

beforeAll(async () => {
  console.log('Test beforeAll, mongoose readyState before:', mongoose.connection.readyState);
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log('Connecting to in-memory DB:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory DB, readyState:', mongoose.connection.readyState);

  // Create test roles
  await Role.create([
    { name: 'HR Manager', description: 'Human Resources' },
    { name: 'Employee', description: 'Employee' },
    { name: 'Admin', description: 'Administrator' }
  ]);

  // Create admin user
  const adminRole = await Role.findOne({ name: 'Admin' });
  const hashedPassword = await require('bcryptjs').hash('admin123', 10);
  await User.create({
    email: 'admin@company.com',
    password: hashedPassword,
    name: 'Admin User',
    role: adminRole._id
  });
  console.log('Admin user created:', await User.findOne({ email: 'admin@company.com' }));

  // Login as admin to get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@company.com', password: 'admin123' });
  console.log('Login response status:', loginResponse.status, 'body:', loginResponse.body);
  adminToken = loginResponse.body.token;
  console.log('adminToken:', adminToken);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
  // Recreate admin user
  const adminRole = await Role.findOne({ name: 'Admin' });
  const hashedPassword = await require('bcryptjs').hash('admin123', 10);
  await User.create({
    email: 'admin@company.com',
    password: hashedPassword,
    name: 'Admin User',
    role: adminRole._id
  });
  // Login as admin to get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@company.com', password: 'admin123' });
  adminToken = loginResponse.body.token;
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@company.com',
        password: 'password123',
        name: 'Test User',
        roleName: 'Employee'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
    });

    it('should reject registration with invalid email domain', async () => {
      const userData = {
        email: 'test@gmail.com',
        password: 'password123',
        name: 'Test User',
        roleName: 'Employee'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Only company email addresses are allowed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const role = await Role.findOne({ name: 'Employee' });
      const hashedPassword = await require('bcryptjs').hash('password123', 10);

      await User.create({
        email: 'test@company.com',
        password: hashedPassword,
        name: 'Test User',
        role: role._id
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@company.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@company.com');
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'test@company.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});