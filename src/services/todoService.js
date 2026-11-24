
import { request } from './apiClient';

// Listas ToDo
export async function getListas() {
  return request('/listas');
}

export async function buscarLista(id) {
  return request(`/listas/${id}`);
}

export async function cadastrarLista(nome, materiaId) {
  return request('/listas', {
    method: 'POST',
    body: { nome, materiaId },
  });
}

export async function atualizarLista(id, nome, materiaId) {
  return request(`/listas/${id}`, {
    method: 'PUT',
    body: { nome, materiaId },
  });
}

export async function excluirLista(id) {
  return request(`/listas/${id}`, {
    method: 'DELETE',
  });
}

// Itens ToDo
export async function getItens() {
  return request('/itens');
}

export async function buscarItem(id) {
  return request(`/itens/${id}`);
}

export async function cadastrarItem(descricao, listaId) {
  return request('/itens', {
    method: 'POST',
    body: {
      descricao,
      feito: false,
      listaId,
    },
  });
}

export async function atualizarItem(id, dados) {
  return request(`/itens/${id}`, {
    method: 'PUT',
    body: dados,
  });
}

export async function excluirItem(id) {
  return request(`/itens/${id}`, {
    method: 'DELETE',
  });
}
