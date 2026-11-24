
import { request } from './apiClient';

export async function login(email, senha) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, senha },
  });
}

export async function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export async function cadastrar(nome, email, senha) {
  return request('/usuarios', {
    method: 'POST',
    body: { nome, email, senha },
  });
}

export async function getUsuarioAutenticado() {
  return request('/auth/me');
}