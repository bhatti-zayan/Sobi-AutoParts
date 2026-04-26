const jwt = require('jsonwebtoken');
const UserEntity = require('../domain/User');

// In a stricter Hexagonal setup, this repository would be injected.
// For student-level simplicity, we are requiring the specific adapter directly here,
// but we interact with it as if it's the interface.
const userRepository = require('../adapters/database/repositories/MongoUserRepository');

class AuthService {
  async register(userData) {
    // 1. Core business logic using Domain Entity
    const userToCreate = new UserEntity(userData);
    
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
    
    if (!user || user.password !== password) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }
    
    // Using domain logic
    if (user.isDeactivated()) {
      throw { statusCode: 403, message: 'Account is deactivated' };
    }

    return this.generateToken(user);
  }
  
  generateToken(user) {
    // Safe payload (no password)
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    return { user: payload, token };
  }
}

module.exports = new AuthService();
