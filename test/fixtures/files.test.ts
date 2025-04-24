import { describe, it } from 'vitest'

import { findGitProjects } from '../../src/files'

describe('findGitProjects', () => {
  it('should find all git projects', async () => {
    const path = "D:\\code\\hatech"
    const projects = await findGitProjects(path)
    console.log(projects)
  })
})