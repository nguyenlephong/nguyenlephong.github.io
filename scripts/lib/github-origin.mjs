function repositoryFromGitHubPath(pathname) {
  const match = pathname.match(
    /^\/?([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/,
  )
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : null
}

export function githubRepositoryFromRemote(remoteUrl) {
  const value = remoteUrl.trim()
  const scp = value.match(/^git@github\.com:(.+)$/i)
  if (scp) return repositoryFromGitHubPath(scp[1])

  let url
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.hostname.toLowerCase() !== 'github.com' || url.port || url.search || url.hash) {
    return null
  }
  if (url.protocol === 'https:') {
    if (url.username || url.password) return null
  } else if (url.protocol === 'ssh:') {
    if (url.username !== 'git' || url.password) return null
  } else {
    return null
  }

  return repositoryFromGitHubPath(url.pathname)
}
