import { describe, expect, it } from 'vitest'
import { cwd } from 'process'

import { findGitProjects } from '../../src/files'

describe('findGitProjects', () => {
  it('should find all git projects', async () => {
    const projects = await findGitProjects(cwd())
    expect(projects[0].remoteUrl).toMatchInlineSnapshot(`"https://github.com/duowb/git-remap.git"`)
  })
})