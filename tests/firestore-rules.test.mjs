import { readFile } from 'node:fs/promises'
import { after, before, beforeEach, test } from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST

if (!emulatorHost) {
  test('Firestore Rules tests require the emulator', {
    skip: 'Run npm run test:firestore-rules',
  })
} else {
  const [host, rawPort] = emulatorHost.split(':')
  const projectId = 'demo-engagement-rules'
  let environment

  before(async () => {
    environment = await initializeTestEnvironment({
      projectId,
      firestore: {
        host,
        port: Number(rawPort),
        rules: await readFile('firestore.rules', 'utf8'),
      },
    })
  })

  beforeEach(async () => environment.clearFirestore())
  after(async () => environment.cleanup())

  function publicDocument(id = 'architecture__ports-and-adapters') {
    return doc(
      environment.unauthenticatedContext().firestore(),
      'postStats',
      id,
    )
  }

  async function seed(data = {}) {
    const initial = {
      views: 4,
      shares: 2,
      reactions: { like: 2, love: 1, insightful: 0, clap: 0 },
      ...data,
    }
    await environment.withSecurityRulesDisabled((context) =>
      setDoc(
        doc(context.firestore(), 'postStats', 'architecture__ports-and-adapters'),
        initial,
      ),
    )
  }

  test('allows public reads and one-counter creates', async () => {
    await assertSucceeds(setDoc(publicDocument(), { views: 1 }, { merge: true }))
    await assertSucceeds(getDoc(publicDocument()))
  })

  test('rejects malformed ids, fields, reactions, and create inflation', async () => {
    await assertFails(setDoc(publicDocument('Architecture__ports-and-adapters'), { views: 1 }))
    await assertFails(setDoc(publicDocument(), { views: 1, owner: 'attacker' }))
    await assertFails(setDoc(publicDocument(), { views: 1.5 }, { merge: true }))
    await assertFails(
      setDoc(publicDocument(), { reactions: { angry: 1 } }, { merge: true }),
    )
    await assertFails(
      setDoc(publicDocument(), { reactions: { like: -1 } }, { merge: true }),
    )
    await assertFails(setDoc(publicDocument(), { views: 2 }, { merge: true }))
  })

  test('rejects creates that increment more than one total counter', async () => {
    await assertFails(
      setDoc(publicDocument(), { views: 1, shares: 1 }, { merge: true }),
    )
    await assertFails(
      setDoc(
        publicDocument(),
        { views: 1, reactions: { like: 1 } },
        { merge: true },
      ),
    )
    await assertFails(
      setDoc(
        publicDocument(),
        { shares: 1, reactions: { clap: 1 } },
        { merge: true },
      ),
    )
    await assertFails(
      setDoc(
        publicDocument(),
        { reactions: { like: 1, love: 1 } },
        { merge: true },
      ),
    )
  })

  test('allows only a +1 view or share update', async () => {
    await seed()
    await assertSucceeds(updateDoc(publicDocument(), { views: 5 }))
    await assertSucceeds(updateDoc(publicDocument(), { shares: 3 }))
    await assertFails(updateDoc(publicDocument(), { views: 7 }))
    await assertFails(updateDoc(publicDocument(), { views: 6, shares: 4 }))
    await assertFails(updateDoc(publicDocument(), { shares: 1 }))
  })

  test('allows one reaction toggle or switch and rejects invalid deltas', async () => {
    await seed()
    await assertSucceeds(
      updateDoc(publicDocument(), {
        reactions: { like: 3, love: 1, insightful: 0, clap: 0 },
      }),
    )
    await assertSucceeds(
      updateDoc(publicDocument(), {
        reactions: { like: 2, love: 2, insightful: 0, clap: 0 },
      }),
    )
    await assertFails(
      updateDoc(publicDocument(), {
        reactions: { like: 3, love: 3, insightful: 0, clap: 0 },
      }),
    )
    await assertFails(
      updateDoc(publicDocument(), {
        reactions: { like: -1, love: 3, insightful: 0, clap: 0 },
      }),
    )
    await assertFails(
      updateDoc(publicDocument(), {
        reactions: { like: 2, love: 2, insightful: 0, clap: 0, angry: 1 },
      }),
    )
  })

  test('denies deletes and unrelated collections', async () => {
    await seed()
    await assertFails(deleteDoc(publicDocument()))
    const other = doc(
      environment.unauthenticatedContext().firestore(),
      'admin',
      'config',
    )
    await assertFails(getDoc(other))
    await assertFails(setDoc(other, { enabled: true }))
  })
}
