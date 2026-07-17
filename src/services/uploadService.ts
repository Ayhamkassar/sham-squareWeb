// Web application upload service
// File upload for web browsers only
import { postFormData, postJson } from './apiClient';
import { UploadResult } from '../types/backend-api.types';

export async function uploadByUrl(fileUrl: string, folder: string = 'users', resourceId?: string) {
  return postJson('/upload/by-url', { fileUrl, folder, resourceId });
}

export async function uploadByFile(file: File, folder: string = 'users', resourceId?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (resourceId) formData.append('resourceId', resourceId);

  return postFormData<UploadResult>('/upload', formData);
}

export async function uploadMultiple(files: File[], folder: string = 'users', resourceId?: string) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);
  if (resourceId) formData.append('resourceId', resourceId);

  return postFormData<UploadResult[]>('/upload/upload-multiple', formData);
}

export default {
  uploadByUrl,
  uploadByFile,
  uploadMultiple,
};