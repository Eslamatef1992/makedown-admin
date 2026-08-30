import client from './client';

export async function listResource(path, params = {}) {
  const { data } = await client.get(path, { params });
  return data.data; // { rows, total, page, pageSize }
}

export async function getResource(path) {
  const { data } = await client.get(path);
  return data.data;
}

export async function createResource(path, payload) {
  const { data } = await client.post(path, payload);
  return data.data;
}

export async function updateResource(path, payload) {
  const { data } = await client.patch(path, payload);
  return data.data;
}

export async function putResource(path, payload) {
  const { data } = await client.put(path, payload);
  return data.data;
}

export async function deleteResource(path) {
  const { data } = await client.delete(path);
  return data.data;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/admin/uploads/image', formData);
  return data.data.url;
}
