import { request } from './apiClient';

export async function getMaterias() {
  return request('/materias');
}

export async function buscarMateria(id) {
  return request(`/materias/${id}`);
}

export async function cadastrarMateria(nome, cursoId) {
  return request('/materias', {
    method: 'POST',
    body: { nome, cursoId },
  });
}

export async function atualizarMateria(id, nome) {
  return request(`/materias/${id}`, {
    method: 'PUT',
    body: { nome },
  });
}

export async function excluirMateria(id) {
  return request(`/materias/${id}`, {
    method: 'DELETE',
  });
}