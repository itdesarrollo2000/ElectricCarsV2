import api from './api';
import type { VehicleComment, VehicleCommentRequest } from '../types';

export const commentService = {
  // Get comments for a vehicle
  getVehicleComments: async (vehicleId: number): Promise<VehicleComment[]> => {
    try {
      const response = await api.get<any>(`/VehicleComment/GetVehicleComments?VehicleId=${vehicleId}`);
      // El API retorna los datos en response.data.data
      const comments = response.data?.data || [];
      return Array.isArray(comments) ? comments : [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add new comment
  addComment: async (comment: VehicleCommentRequest): Promise<VehicleComment> => {
    const response = await api.post<VehicleComment>('/VehicleComment/AddComment', comment);
    return response.data;
  },

  // Update comment
  updateComment: async (id: number, comment: Partial<VehicleCommentRequest>): Promise<VehicleComment> => {
    const response = await api.put<VehicleComment>('/VehicleComment/UpdateComment', {
      commentId: id,
      title: comment.title,
      description: comment.description
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: number): Promise<boolean> => {
    const response = await api.delete<boolean>(`/VehicleComment/DeleteComment?id=${id}`);
    return response.data;
  },
};

export default commentService;
