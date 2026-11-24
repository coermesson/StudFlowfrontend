
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function readResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function obterMensagemErro(payload, status) {
  return payload && typeof payload === 'object' && typeof payload.erro === 'string'
    ? payload.erro
    : `A solicitação falhou (${status})`;
}

export async function request(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  let requestBody = body;

  if (body !== undefined && !isFormData && typeof body !== 'string') {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const urlPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`${API_URL}${urlPath}`, {
    ...requestOptions,
    body: requestBody,
    headers: requestHeaders,
    credentials: 'include',
  });

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new ApiError(obterMensagemErro(payload, response.status), {
      status: response.status,
      payload,
    });
  }

  return payload;
}

export async function requestBlob(path) {
  const urlPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`${API_URL}${urlPath}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await readResponse(response);

    throw new ApiError(obterMensagemErro(payload, response.status), {
      status: response.status,
      payload,
    });
  }

  return response.blob();
}
