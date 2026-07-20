import { withPostbuildTransformLock } from './og-artifact-transaction.mjs'

export function runBuildUnderPostbuildLock({ build, outDir, postbuild, prepare }) {
  return withPostbuildTransformLock(outDir, async () => {
    await prepare()
    const buildCode = await build()
    if (buildCode !== 0) return buildCode
    await postbuild()
    return 0
  })
}
