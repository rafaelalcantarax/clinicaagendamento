
const prisma = require('../../lib/prisma');
// const jwt = require('jsonwebtoken'); // Em ambiente real
// const bcrypt = require('bcryptjs'); // Em ambiente real

class AuthService {
  async authenticate(email, password) {
    // Mock de autenticação para o MVP
    const user = { 
      id: 'u1', 
      name: email.split('@')[0], 
      role: 'admin', 
      clinicSlug: 'centro-vita' 
    };
    
    return {
      user,
      token: 'mock-jwt-token-' + Math.random().toString(36).substr(2)
    };
  }

  async register(data) {
    return prisma.member.create({
      data: {
        ...data,
        status: 'active'
      }
    });
  }
}

module.exports = new AuthService();
