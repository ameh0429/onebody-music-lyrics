const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { readdir, unlink } = require('node:fs/promises');
const { join, basename } = require('node:path');
require('dotenv').config({ quiet: true });
if (!process.env.TEST_DB_NAME?.endsWith('_test'))
  throw new Error(
    'Set TEST_DB_NAME to a separate database whose name ends with _test. Initialize it with DB_NAME=<test database> npm run db:setup first.',
  );
process.env.DB_NAME = process.env.TEST_DB_NAME;
process.env.NODE_ENV = 'test';
const { createApp } = require('../dist/app');
const { User, Artiste, Album, Song } = require('../dist/database/models');

test('NestJS API against PostgreSQL', async (t) => {
  const app = await createApp();
  const owned = {
    user: undefined,
    artistes: [],
    album: undefined,
    song: undefined,
    upload: undefined,
  };
  t.after(async () => {
    try {
      if (owned.song) await Song.destroy({ where: { id: owned.song } });
      if (owned.album) await Album.destroy({ where: { id: owned.album } });
      if (owned.artistes.length) await Artiste.destroy({ where: { id: owned.artistes } });
      if (owned.user) await User.destroy({ where: { id: owned.user } });
      if (owned.upload)
        await unlink(join(process.cwd(), 'uploads', basename(owned.upload))).catch(() => undefined);
    } finally {
      await app.close();
    }
  });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  let token;
  const email = `e2e-${randomUUID()}@example.test`,
    password = 'test-password-123';
  async function call(path, method = 'GET', body, status = 200, auth = token) {
    const multipart = body instanceof FormData;
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(!multipart ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      ...(body !== undefined ? { body: multipart ? body : JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    assert.equal(res.status, status, `${method} ${path}: ${JSON.stringify(data)}`);
    return data;
  }
  await t.test(
    'health checks the database and Swagger documents endpoints, DTOs and bearer auth',
    async () => {
      assert.equal((await call('/health')).status, 'OK');
      const docs = await call('/docs-json');
      for (const path of ['/api/songs', '/api/albums/{id}', '/api/auth/login', '/health'])
        assert.ok(docs.paths[path]);
      assert.ok(docs.components.schemas.CreateSongDto.required.includes('artisteId'));
      assert.equal(docs.components.securitySchemes.bearer.type, 'http');
      assert.ok(docs.paths['/api/songs'].post.requestBody.content['multipart/form-data']);
      assert.ok(docs.paths['/api/songs'].post.security.length);
      assert.equal(
        docs.paths['/api/songs'].post.requestBody.content['multipart/form-data'].schema.properties
          .featuredArtisteIds.type,
        'string',
      );
      assert.equal(
        docs.paths['/api/songs'].get.responses['200'].content['application/json'].schema.properties
          .data.type,
        'array',
      );
      assert.equal(docs.components.schemas.UserView.properties.password, undefined);
      assert.equal((await fetch(base + '/docs')).status, 200);
    },
  );
  await t.test('anonymous reads work and writes require authentication', async () => {
    for (const path of ['/api/artistes', '/api/albums', '/api/songs'])
      assert.equal((await call(path)).success, true);
    await call('/api/artistes', 'POST', { name: 'Forbidden' }, 401, null);
    await call('/api/auth/me', 'GET', undefined, 401, 'invalid');
  });
  await t.test('registration, login, profile and password privacy', async () => {
    const data = await call(
      '/api/auth/register',
      'POST',
      { name: 'Test User', email, password },
      201,
    );
    owned.user = data.data.user.id;
    token = data.data.token;
    assert.equal(data.data.user.role, 'user');
    assert.equal(data.data.user.password, undefined);
    const stored = await User.findByPk(owned.user);
    assert.notEqual(stored.password, password);
    assert.ok(await stored.comparePassword(password));
    await call('/api/auth/register', 'POST', { name: 'Other', email, password }, 400);
    await call(
      '/api/auth/register',
      'POST',
      { name: 'Other', email: 'other@example.test', password, role: 'admin' },
      400,
    );
    await call('/api/auth/login', 'POST', { email, password: 'wrong-password' }, 401);
    token = (await call('/api/auth/login', 'POST', { email, password })).data.token;
    const profile = await call('/api/auth/me');
    assert.equal(profile.data.id, owned.user);
    assert.equal(profile.data.password, undefined);
  });
  await t.test('artiste CRUD and image uploads', async () => {
    const form = new FormData();
    form.set('name', 'Main Test Artiste');
    const image = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTRsAAAAASUVORK5CYII=',
      'base64',
    );
    form.set('image', new Blob([image], { type: 'image/png' }), 'image.png');
    const a = await call('/api/artistes', 'POST', form, 201);
    owned.artistes.push(a.data.id);
    owned.upload = a.data.image;
    const uploaded = await fetch(base + a.data.image);
    assert.equal(uploaded.status, 200);
    assert.deepEqual(Buffer.from(await uploaded.arrayBuffer()), image);
    const featured = await call('/api/artistes', 'POST', { name: 'Featured Test Artiste' }, 201);
    owned.artistes.push(featured.data.id);
    await call(`/api/artistes/${a.data.id}`, 'PUT', { desc: 'Updated biography' });
    assert.equal((await call(`/api/artistes/${a.data.id}`)).data.desc, 'Updated biography');
    await call('/api/artistes/not-an-id', 'GET', undefined, 400);
    await call('/api/artistes/2147483647', 'GET', undefined, 404);
    await call('/api/artistes', 'POST', { name: '   ' }, 400);
    const invalidFile = new FormData();
    invalidFile.set('name', 'Invalid image');
    invalidFile.set('image', new Blob(['text'], { type: 'text/plain' }), 'file.txt');
    await call('/api/artistes', 'POST', invalidFile, 400);
    const before = await readdir(join(process.cwd(), 'uploads'));
    const invalidBody = new FormData();
    invalidBody.set('image', new Blob([image], { type: 'image/png' }), 'image.png');
    await call('/api/artistes', 'POST', invalidBody, 400);
    assert.deepEqual(await readdir(join(process.cwd(), 'uploads')), before);
    const oversized = new FormData();
    oversized.set('name', 'Too large');
    oversized.set(
      'image',
      new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: 'image/png' }),
      'large.png',
    );
    await call('/api/artistes', 'POST', oversized, 413);
  });
  await t.test(
    'album creation, multipart arrays and transactional relation validation',
    async () => {
      const form = new FormData();
      form.set('name', 'Test Album');
      form.set('releaseYear', '2020');
      form.set('artisteIds', JSON.stringify(owned.artistes));
      const album = await call('/api/albums', 'POST', form, 201);
      owned.album = album.data.id;
      assert.equal(album.data.artistes.length, 2);
      await call(
        `/api/albums/${owned.album}`,
        'PUT',
        { name: 'Updated Album', artisteIds: [2147483647] },
        404,
      );
      assert.equal((await call(`/api/albums/${owned.album}`)).data.name, 'Test Album');
      await call('/api/albums', 'POST', { name: 'Invalid Album', artisteIds: 'invalid JSON' }, 400);
      await call('/api/albums', 'POST', { name: 'Invalid Album', artisteIds: [] }, 400);
      await call(`/api/albums/${owned.album}`, 'PUT', { releaseYear: 2021 });
    },
  );
  await t.test('song CRUD, main/featured artistes and nested relationships', async () => {
    const song = await call(
      '/api/songs',
      'POST',
      {
        name: 'Test Song',
        artisteId: owned.artistes[0],
        featuredArtisteIds: [owned.artistes[1]],
        albumId: owned.album,
        lyrics: 'Test lyrics',
      },
      201,
    );
    owned.song = song.data.id;
    assert.equal(song.data.mainArtiste.id, owned.artistes[0]);
    assert.equal(song.data.featuredArtistes[0].id, owned.artistes[1]);
    assert.equal(
      (await call(`/api/albums/${owned.album}`)).data.songs[0].mainArtiste.id,
      owned.artistes[0],
    );
    assert.equal(
      (await call(`/api/artistes/${owned.artistes[0]}`)).data.mainSongs[0].id,
      owned.song,
    );
    assert.equal(
      (await call(`/api/artistes/${owned.artistes[1]}`)).data.featuredSongs[0].id,
      owned.song,
    );
    await call(
      `/api/songs/${owned.song}`,
      'PUT',
      { name: 'Must roll back', featuredArtisteIds: [], albumId: 2147483647 },
      404,
    );
    assert.equal((await call(`/api/songs/${owned.song}`)).data.featuredArtistes.length, 1);
    await call(`/api/songs/${owned.song}`, 'PUT', { featuredArtisteIds: [owned.artistes[0]] }, 400);
    await call(`/api/songs/${owned.song}`, 'PUT', { artisteId: null }, 400);
    await call(`/api/songs/${owned.song}`, 'PUT', {
      lyrics: 'Updated lyrics',
      featuredArtisteIds: [],
      albumId: null,
    });
    const updated = (await call(`/api/songs/${owned.song}`)).data;
    assert.equal(updated.lyrics, 'Updated lyrics');
    assert.equal(updated.albumId, null);
    assert.equal(updated.featuredArtistes.length, 0);
  });
  await t.test('password changes require current password and hash the replacement', async () => {
    await call(
      '/api/auth/update-password',
      'PUT',
      { currentPassword: 'wrong', newPassword: 'replacement-123' },
      401,
    );
    await call('/api/auth/update-password', 'PUT', {
      currentPassword: password,
      newPassword: 'replacement-123',
    });
    await call('/api/auth/login', 'POST', { email, password }, 401);
    assert.ok(
      (await call('/api/auth/login', 'POST', { email, password: 'replacement-123' })).data.token,
    );
  });
  await t.test('deletes work and missing songs return 404', async () => {
    await call(`/api/songs/${owned.song}`, 'DELETE');
    await call(`/api/songs/${owned.song}`, 'GET', undefined, 404);
    await call(`/api/albums/${owned.album}`, 'DELETE');
    for (const id of owned.artistes) await call(`/api/artistes/${id}`, 'DELETE');
  });
});
