
import { request } from './apiClient';

// Quadros Kanban
export async function getQuadros() {
  return request('/quadros-kanban');
}

export async function buscarQuadro(id) {
  return request(`/quadros-kanban/${id}`);
}

export async function cadastrarQuadro(nome, materiaId) {
  return request('/quadros-kanban', {
    method: 'POST',
    body: { nome, materiaId },
  });
}

export async function atualizarQuadro(id, nome, materiaId) {
  return request(`/quadros-kanban/${id}`, {
    method: 'PUT',
    body: { nome, materiaId },
  });
}

export async function excluirQuadro(id) {
  return request(`/quadros-kanban/${id}`, {
    method: 'DELETE',
  });
}

// Tarefas Kanban
export async function getTarefas() {
  return request('/tarefa');
}

export async function buscarTarefa(id) {
  return request(`/tarefa/${id}`);
}

export async function cadastrarTarefa(dados) {
  return request('/tarefa', {
    method: 'POST',
    body: dados,
  });
}

export async function atualizarTarefa(id, dados) {
  return request(`/tarefa/${id}`, {
    method: 'PUT',
    body: dados,
  });
}

export async function excluirTarefa(id) {
  return request(`/tarefa/${id}`, {
    method: 'DELETE',
  });
}
