const jwt = require('jsonwebtoken');
const UserEntity = require('../domain/User');
const bcrypt = require('bcryptjs');

// In a stricter Hexagonal setup, this repository would be injected.
// For student-level simplicity, we are requiring the specific adapter directly here,
// but we interact with it as if it's the interface.
const userRepository = require('../adapters/database/repositories/MongoUserRepository');

class AuthService {
  async register(userData) {
    // 0. Block admin self-registration
    if (userData.role === 'admin') {
      throw { statusCode: 400, message: 'Admin accounts cannot be created via registration.' };
    }

    // 1. Core business logic using Domain Entity
    // Hash the password before creating the user entity
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToCreate = new UserEntity({ ...userData, password: hashedPassword });
    
    // 2. Check if user exists using the Port (implemented by MongoAdapter)
    const existingUser = await userRepository.findByEmail(userToCreate.email);
    if (existingUser) {
      throw { statusCode: 400, message: 'User already exists' };
    }

    // 3. Save via Port
    const savedUser = await userRepository.create(userToCreate);
    
    return this.generateToken(savedUser);
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    
    const passwordMatches = user && await bcrypt.compare(password, user.password);
    if (!user || !passwordMatches) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }
    
    // Using domain logic
    if (user.isDeactivated()) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    return this.generateToken(user);
  }

  async updateProfile(userId, profileData) {
    const allowedUpdates = {};
    if (profileData.name) allowedUpdates.name = profileData.name;
    if (profileData.email) allowedUpdates.email = profileData.email;
    if (profileData.phone) allowedUpdates.phone = profileData.phone;
    
    const updatedUser = await userRepository.updateProfile(userId, allowedUpdates);
    return this.generateToken(updatedUser);
  }
  
  generateToken(user) {
    // Safe payload (no password)
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials, phone: user.phone };
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    return { user: payload, token };
  }
}

module.exports = new AuthService();
