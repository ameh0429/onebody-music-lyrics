import type { OpenAPIObject } from '@nestjs/swagger';
import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function documentApi(document: OpenAPIObject) {
  const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
  const array = (name: string): SchemaObject => ({ type: 'array', items: ref(name) });
  const nullableString: SchemaObject = { type: 'string', nullable: true };
  const entity: Record<string, SchemaObject> = {
    id: { type: 'integer', example: 1 },
    name: { type: 'string' },
    image: nullableString,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  };
  const schemas: Record<string, SchemaObject> = {
    UserView: {
      type: 'object',
      properties: {
        id: entity.id,
        name: entity.name,
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['user', 'admin'] },
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    },
    ArtisteView: {
      type: 'object',
      properties: {
        ...entity,
        desc: nullableString,
        albums: array('AlbumView'),
        mainSongs: array('SongView'),
        featuredSongs: array('SongView'),
      },
    },
    AlbumView: {
      type: 'object',
      properties: {
        ...entity,
        releaseYear: { type: 'integer', nullable: true },
        artistes: array('ArtisteView'),
        songs: array('SongView'),
      },
    },
    SongView: {
      type: 'object',
      properties: {
        ...entity,
        artisteId: { type: 'integer' },
        albumId: { type: 'integer', nullable: true },
        lyrics: nullableString,
        mainArtiste: ref('ArtisteView'),
        featuredArtistes: array('ArtisteView'),
        album: { allOf: [ref('AlbumView')], nullable: true },
      },
    },
    ApiError: {
      type: 'object',
      required: ['success', 'message'],
      properties: {
        success: { type: 'boolean', example: false },
        message: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
      },
    },
  };
  document.components ??= {};
  document.components.schemas = { ...document.components.schemas, ...schemas };
  const json = (schema: SchemaObject) => ({ 'application/json': { schema } });
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of ['get', 'post', 'put', 'delete'] as const) {
      const operation = item[method];
      if (!operation || path === '/health') continue;
      // Multipart array fields are JSON strings; document them as text inputs so
      // Swagger UI sends the same representation accepted by the DTO transformer.
      const body = operation.requestBody;
      if (body && 'content' in body) {
        const multipart = body.content['multipart/form-data'];
        const bodySchema = multipart?.schema;
        if (bodySchema && 'allOf' in bodySchema) {
          const dtoRef = bodySchema.allOf?.[0];
          const dto =
            dtoRef && '$ref' in dtoRef
              ? document.components.schemas?.[dtoRef.$ref.split('/').pop()!]
              : undefined;
          if (dto && !('$ref' in dto)) {
            const properties: Record<string, SchemaObject | ReferenceObject> = {
              ...dto.properties,
              image: {
                type: 'string' as const,
                format: 'binary',
                description: 'Optional image, maximum 5 MiB',
              },
            };
            for (const [key, value] of Object.entries(properties)) {
              if ('type' in value && value.type === 'array') {
                properties[key] = {
                  type: 'string',
                  example: JSON.stringify(value.example ?? []),
                  description: 'JSON array string, for example [1,2]',
                };
              }
            }
            multipart.schema = { ...dto, properties };
            if (body.content['application/json']) body.content['application/json'].schema = dtoRef;
          }
        }
      }
      const schema: SchemaObject = {
        type: 'object',
        required: ['success'],
        properties: {
          success: { type: 'boolean', example: true },
          ...(method !== 'get' ? { message: { type: 'string' as const } } : {}),
        },
      };
      const properties = schema.properties!;
      if (path.startsWith('/api/auth')) {
        if (path.endsWith('/me')) properties.data = ref('UserView');
        else
          properties.data = {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT bearer token' },
              ...(!path.endsWith('/update-password') ? { user: ref('UserView') } : {}),
            },
          };
      } else if (method !== 'delete') {
        const resource = path.includes('/artistes')
          ? 'ArtisteView'
          : path.includes('/albums')
            ? 'AlbumView'
            : 'SongView';
        properties.data =
          method === 'get' && !path.includes('{id}') ? array(resource) : ref(resource);
        if (method === 'get' && !path.includes('{id}')) properties.count = { type: 'integer' };
      }
      const status = method === 'post' && !path.endsWith('/login') ? '201' : '200';
      operation.responses[status] = { description: 'Success', content: json(schema) };
      operation.responses['400'] = {
        description: 'Invalid input',
        content: json(ref('ApiError') as SchemaObject),
      };
      if (operation.security?.length || path.endsWith('/login'))
        operation.responses['401'] = {
          description: 'Missing or invalid credentials',
          content: json(ref('ApiError') as SchemaObject),
        };
      if (path.includes('{id}') || (method !== 'get' && !path.startsWith('/api/auth')))
        operation.responses['404'] = {
          description: 'Record or related entity not found',
          content: json(ref('ApiError') as SchemaObject),
        };
      if ((method === 'post' || method === 'put') && !path.startsWith('/api/auth'))
        operation.responses['413'] = {
          description: 'Image exceeds 5 MiB',
          content: json(ref('ApiError') as SchemaObject),
        };
      operation.responses['500'] = {
        description: 'Internal server error',
        content: json(ref('ApiError') as SchemaObject),
      };
    }
  }
}
