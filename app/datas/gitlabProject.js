const gitlabProject = require('../models/gitlabProject.server.model')

exports.findCount = async () => {
  return gitlabProject.countDocuments();
}
exports.findOne = async ({id}) => {
  const project = await gitlabProject.findOne({
    id
  })
  return project
}
