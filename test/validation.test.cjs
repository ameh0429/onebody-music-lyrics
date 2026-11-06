const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { plainToInstance } = require('class-transformer');
const { validateSync } = require('class-validator');
const {
  CreateSongDto,
  UpdateSongDto,
  CreateAlbumDto,
  UpdateAlbumDto,
  UpdateArtisteDto,
} = require('../dist/music/music.dto');
const { RegisterDto } = require('../dist/auth/auth.dto');
const { validateEnvironment } = require('../dist/config/environment');
const check = (Type, data) =>
  validateSync(plainToInstance(Type, data), { whitelist: true, forbidNonWhitelisted: true });

test('multipart IDs transform to validated arrays and numeric fields', () => {
  const dto = plainToInstance(CreateSongDto, {
    name: 'Song',
    artisteId: '1',
    featuredArtisteIds: '[2,3]',
  });
  assert.deepEqual(dto.featuredArtisteIds, [2, 3]);
  assert.equal(dto.artisteId, 1);
  assert.equal(validateSync(dto).length, 0);
});
test('malformed, duplicate, negative and null relationship arrays fail validation', () => {
  for (const ids of ['oops', '[1,1]', '[-1]', null])
    assert.ok(check(CreateAlbumDto, { name: 'Album', artisteIds: ids }).length);
  assert.ok(check(CreateSongDto, { name: 'Song', artisteId: 1, featuredArtisteIds: null }).length);
});
test('updates reject null required properties and allow clearing nullable fields', () => {
  for (const [Type, body] of [
    [UpdateArtisteDto, { name: null }],
    [UpdateAlbumDto, { artisteIds: null }],
    [UpdateSongDto, { artisteId: null }],
    [UpdateSongDto, { featuredArtisteIds: null }],
  ])
    assert.ok(check(Type, body).length);
  assert.equal(
    check(UpdateSongDto, { albumId: null, lyrics: null, featuredArtisteIds: [] }).length,
    0,
  );
});
test('registration rejects role assignment and invalid passwords', () => {
  assert.ok(
    check(RegisterDto, {
      name: 'User',
      email: 'user@example.com',
      password: 'secret123',
      role: 'admin',
    }).length,
  );
  assert.ok(check(RegisterDto, { name: 'User', email: 'invalid', password: 'short' }).length);
  assert.ok(
    check(RegisterDto, { name: 'User', email: 'user@example.com', password: '😀'.repeat(24) })
      .length,
  );
});
test('configuration fails early for missing values and invalid ports or expiration', () => {
  const env = {
    DB_HOST: '127.0.0.1',
    DB_NAME: 'db',
    DB_USER: 'user',
    DB_PASSWORD: 'test-password',
    JWT_SECRET: 'x'.repeat(32),
  };
  assert.doesNotThrow(() => validateEnvironment(env));
  for (const overrides of [
    { JWT_SECRET: '' },
    { DB_NAME: undefined },
    { PORT: 'abc' },
    { DB_PORT: '0' },
    { JWT_EXPIRES_IN: 'never' },
  ])
    assert.throws(() => validateEnvironment({ ...env, ...overrides }));
});
