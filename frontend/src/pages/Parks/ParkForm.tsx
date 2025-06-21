import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface ParkFormData {
  name: string;
  location: string;
  area?: number;
  manager?: string;
  contact?: string;
}

const ParkForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<ParkFormData>({
    name: '',
    location: '',
    area: undefined,
    manager: '',
    contact: '',
  });

  // Fetch park data if editing
  const { data: park, isLoading: parkLoading } = useQuery({
    queryKey: ['park', id],
    queryFn: () => apiService.getPark(Number(id)),
    enabled: isEditing,
  });

  // Update form when park data is loaded
  useEffect(() => {
    if (park && isEditing) {
      setFormData({
        name: park.name || '',
        location: park.location || '',
        area: park.area || undefined,
        manager: park.manager || '',
        contact: park.contact || '',
      });
    }
  }, [park, isEditing]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ParkFormData) => apiService.createPark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success(t('parks.createSuccess'));
      navigate('/parks');
    },
    onError: (error: any) => {
      toast.error(error.message || t('parks.createError'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ParkFormData) => apiService.updatePark(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      queryClient.invalidateQueries({ queryKey: ['park', id] });
      toast.success(t('parks.updateSuccess'));
      navigate('/parks');
    },
    onError: (error: any) => {
      toast.error(error.message || t('parks.updateError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Park name is required');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Park location is required');
      return;
    }

    const submitData = {
      ...formData,
      area: formData.area || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const isLoading = isEditing && parkLoading;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditing ? t('parks.edit') : t('parks.add')}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          {isEditing 
            ? 'Edit the park information' 
            : 'Add a new park to the system'
          }
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Park Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Park Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter park name"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter park location"
              />
            </div>

            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Area (square meters)
              </label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area || ''}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0"
              />
            </div>

            {/* Manager */}
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
                Manager
              </label>
              <input
                type="text"
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter manager name"
              />
            </div>

            {/* Contact */}
            <div className="sm:col-span-2">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contact Information
              </label>
              <textarea
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter contact information (phone, email, etc.)"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/parks')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </span>
                </>
              ) : (
                <span>{isEditing ? 'Update Park' : 'Create Park'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkForm; 