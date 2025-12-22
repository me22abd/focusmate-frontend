/**
 * ============================================================================
 * MODULES.TS - MODULE MANAGEMENT API CLIENT
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom API client for module CRUD operations.
 * Pattern: Axios-based API client.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

import axiosInstance from '../axios';

export interface Module {
  id: string;
  userId: string;
  name: string;
  color: string;
  lecturer?: string;
  level?: string;
  year?: string;
  resources?: ModuleResource[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleResource {
  id: string;
  type: 'link' | 'file';
  title: string;
  url?: string;
  fileUrl?: string;
}

// Create module
export const createModule = async (data: Partial<Module>): Promise<Module> => {
  const response = await axiosInstance.post('/modules', data);
  return response.data;
};

// Get all modules
export const getModules = async (): Promise<Module[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('MODULES API: getModules() called');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  MODULES REQUEST TOKEN: ${token ? token.substring(0, 40) + '...' : 'NOT FOUND'}`);
    
    const response = await axiosInstance.get('/modules');
    
    console.log('  MODULES RESPONSE:', response.data);
    console.log(`  Response status: ${response.status}`);
    console.log(`  Modules count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return response.data;
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('MODULES API: getModules() ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`  MODULES ERROR: ${error.message}`);
    console.error(`  Error status: ${error.response?.status || 'N/A'}`);
    console.error(`  Error data: ${JSON.stringify(error.response?.data || {})}`);
    console.error(`  Request URL: ${error.config?.url || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════════════');
    throw error;
  }
};

// Get single module
export const getModule = async (id: string): Promise<Module> => {
  const response = await axiosInstance.get(`/modules/${id}`);
  return response.data;
};

// Update module
export const updateModule = async (id: string, data: Partial<Module>): Promise<Module> => {
  const response = await axiosInstance.patch(`/modules/${id}`, data);
  return response.data;
};

// Delete module
export const deleteModule = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/modules/${id}`);
};

// Add resource to module
export const addModuleResource = async (moduleId: string, resource: Partial<ModuleResource>): Promise<ModuleResource> => {
  const response = await axiosInstance.post(`/modules/${moduleId}/resources`, resource);
  return response.data;
};


