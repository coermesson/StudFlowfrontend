
import { request } from './apiClient';

export async function getCursos() {
  return request('/cursos');
}

export async function cadastrarCurso(nome) {
  return request('/cursos', {
    method: 'POST',
    body: { nome },
  });
}

export async function atualizarCurso(id, nome) {
  return request(`/cursos/${id}`, {
    method: 'PUT',
    body: { nome },
  });
}

export async function excluirCurso(id) {
  return request(`/cursos/${id}`, {
    method: 'DELETE',
  });
}
