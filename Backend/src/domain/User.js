class User {
  constructor({ id, name, email, password, role, initials, isActive = true, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password; // In a real app, ensure this is hashed before this point
    this.role = role;
    this.initials = initials || this.generateInitials(name);
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
  }

  generateInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isDeactivated() {
    return !this.isActive;
  }
}

module.exports = User;
