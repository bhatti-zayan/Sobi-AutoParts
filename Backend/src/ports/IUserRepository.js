/**
 * IUserRepository Interface (Port)
 * 
 * This defines the contract for any user repository.
 * It does NOT know about MongoDB or any specific database.
 */
class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented.');
  }

  async create(userEntity) {
    throw new Error('Method not implemented.');
  }

  async updateStatus(id, isActive) {
    throw new Error('Method not implemented.');
  }

  async findAll() {
    throw new Error('Method not implemented.');
  }
}

module.exports = IUserRepository;
