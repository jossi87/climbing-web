import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const OPENAPI_URL = 'https://brattelinjer.no/com.buldreinfo.jersey.jaxb/openapi.json';
const OUTPUT_RELATIVE_PATH = 'src/@types/buldreinfo/swagger.d.ts';

const ERROR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  additionalProperties: true,
};

const ALLOWED_RESPONSE_REFS = new Set([
  // Canonical backend OpenApiResponseRefs names.
  'BadRequest',
  'Unauthorized',
  'Forbidden',
  'InternalServerError',
  // Temporary compatibility names used by earlier published specs.
  'BadRequestError',
  'UnauthorizedError',
  'ForbiddenError',
  'NotFoundError',
]);

const DEFAULT_RESPONSE_COMPONENTS = {
  BadRequest: { description: 'Invalid request parameters.', content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } } },
  Unauthorized: { description: 'Authentication required.', content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } } },
  Forbidden: { description: 'Insufficient permissions.', content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } } },
  InternalServerError: {
    description: 'An unexpected error occurred.',
    content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } },
  },
  BadRequestError: {
    description: 'Invalid request parameters.',
    content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } },
  },
  UnauthorizedError: {
    description: 'Authentication required.',
    content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } },
  },
  ForbiddenError: {
    description: 'Insufficient permissions.',
    content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } },
  },
  NotFoundError: { description: 'Not found.', content: { 'application/json': { schema: ERROR_RESPONSE_SCHEMA } } },
};

function validateResponseRefContract(spec) {
  if (!spec.components) spec.components = {};
  if (!spec.components.responses) spec.components.responses = {};

  const responses = spec.components?.responses ?? {};
  const responseNames = new Set(Object.keys(responses));
  const referencedNames = new Set();

  const paths = spec.paths ?? {};
  for (const item of Object.values(paths)) {
    if (!item || typeof item !== 'object') continue;
    for (const operation of Object.values(item)) {
      if (!operation || typeof operation !== 'object') continue;
      const operationResponses = operation.responses;
      if (!operationResponses || typeof operationResponses !== 'object') continue;
      for (const response of Object.values(operationResponses)) {
        if (!response || typeof response !== 'object' || !('$ref' in response)) continue;
        const ref = response.$ref;
        if (typeof ref !== 'string' || !ref.startsWith('#/components/responses/')) continue;
        referencedNames.add(ref.replace('#/components/responses/', ''));
      }
    }
  }

  const unknownResponseNames = [...responseNames].filter((name) => !ALLOWED_RESPONSE_REFS.has(name));
  if (unknownResponseNames.length > 0) {
    throw new Error(
      `OpenAPI components.responses has unsupported names: ${unknownResponseNames.join(
        ', ',
      )}. Update ALLOWED_RESPONSE_REFS intentionally when backend OpenApiResponseRefs changes.`,
    );
  }

  const unknownReferencedNames = [...referencedNames].filter((name) => !ALLOWED_RESPONSE_REFS.has(name));
  if (unknownReferencedNames.length > 0) {
    throw new Error(
      `OpenAPI references unsupported response refs: ${unknownReferencedNames.join(
        ', ',
      )}. Update ALLOWED_RESPONSE_REFS intentionally when backend OpenApiResponseRefs changes.`,
    );
  }

  const unresolvedRefs = [...referencedNames].filter((name) => !responseNames.has(name));
  for (const refName of unresolvedRefs) {
    spec.components.responses[refName] = DEFAULT_RESPONSE_COMPONENTS[refName];
  }
}

async function main() {
  const response = await fetch(OPENAPI_URL);
  if (!response.ok) {
    throw new Error(`Failed to download OpenAPI schema: ${response.status} ${response.statusText}`);
  }

  const spec = await response.json();
  validateResponseRefContract(spec);

  const ast = await openapiTS(spec, { exportType: true });
  const ts = astToString(ast);
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outputPath = path.join(repoRoot, OUTPUT_RELATIVE_PATH);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, ts, 'utf8');
  console.log(`Generated ${OUTPUT_RELATIVE_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
