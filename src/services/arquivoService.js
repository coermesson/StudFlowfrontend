
import { request, requestBlob } from './apiClient';

export async function getArquivos() {
  return request('/arquivos');
}

export async function cadastrarArquivo(arquivo, materiaId) {
  const formData = new FormData();

  formData.append('arquivo', arquivo);
  formData.append('materiaId', materiaId);

  return request('/arquivos', {
    method: 'POST',
    body: formData,
  });
}

export async function baixarArquivo(id) {
  return requestBlob(`/arquivos/${id}/download`);
}

export async function excluirArquivo(id) {
  return request(`/arquivos/${id}`, {
    method: 'DELETE',
  });
}
