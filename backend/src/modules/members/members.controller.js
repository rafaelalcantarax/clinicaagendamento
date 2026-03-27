
const membersService = require('./members.service');

class MembersController {
  async list(req, res, next) {
    try {
      const members = await membersService.listMembers(req.clinicContext);
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  async invite(req, res, next) {
    try {
      const { email, role } = req.body;
      const invitation = await membersService.inviteMember(email, role, req.clinicContext);
      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      // Lógica de remoção
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MembersController();
