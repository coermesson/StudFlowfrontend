
import { request } from './apiClient';

export async function atualizarUsuario(id, dados) {
  return request(`/usuarios/${id}`, {
    method: 'PUT',
    body: dados,
  });
}
