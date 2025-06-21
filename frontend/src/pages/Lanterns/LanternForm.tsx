import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface LanternFormData {
  park_id: number;
  location_x: number;
  location_y: number;
  brightness_level: number;
  status: string;
}

const LanternForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<LanternFormData>({
    park_id: 0,
    location_x: 0,
    location_y: 0,
    brightness_level: 100,
    status: 'working',
  });

  // Fetch parks for dropdown
  const { data: parks, isLoading: parksLoading } = useQuery({
    queryKey: ['parks'],
    queryFn: apiService.getParks,
  });

  // Fetch lantern data if editing
  const { data: lantern, isLoading: lanternLoading } = useQuery({
    queryKey: ['lantern', id],
    queryFn: () => apiService.getLantern(Number(id)),
    enabled: isEditing,
  });

  // Update form when lantern data is loaded
  useEffect(() => {
    if (lantern && isEditing) {
      setFormData({
        park_id: lantern.park_id || 0,
        location_x: lantern.location_x || 0,
        location_y: lantern.location_y || 0,
        brightness_level: lantern.brightness_level || 100,
        status: lantern.status || 'working',
      });
    }
  }, [lantern, isEditing]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: LanternFormData) => apiService.createLantern(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
      toast.success(t('lanterns.createSuccess'));
      navigate('/lanterns');
    },
    onError: (error: any) => {
      toast.error(error.message || t('lanterns.createError'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: LanternFormData) => apiService.updateLantern(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
      queryClient.invalidateQueries({ queryKey: ['lantern', id] });
      toast.success(t('lanterns.updateSuccess'));
      navigate('/lanterns');
    },
    onError: (error: any) => {
      toast.error(error.message || t('lanterns.updateError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.park_id) {
      toast.error(t('lanterns.selectParkRequired'));
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'park_id' || name === 'location_x' || name === 'location_y' || name === 'brightness_level'
        ? Number(value)
        : value,
    }));
  };

  const isLoading = parksLoading || (isEditing && lanternLoading);
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
          {isEditing ? t('lanterns.edit') : t('lanterns.add')}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          {isEditing 
            ? t('lanterns.editDescription')
            : t('lanterns.addDescription')
          }
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Park Selection */}
            <div>
              <label htmlFor="park_id" className="block text-sm font-medium text-gray-700">
                {t('lanterns.park')} *
              </label>
              <select
                id="park_id"
                name="park_id"
                value={formData.park_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={0}>{t('lanterns.selectPark')}</option>
                {parks?.map((park: any) => (
                  <option key={park.id} value={park.id}>
                    {park.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                {t('lanterns.status')} *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="working">{t('lanterns.statusWorking')}</option>
                <option value="broken">{t('lanterns.statusBroken')}</option>
                <option value="maintenance">{t('lanterns.statusMaintenance')}</option>
              </select>
            </div>

            {/* Location X */}
            <div>
              <label htmlFor="location_x" className="block text-sm font-medium text-gray-700">
                {t('lanterns.locationX')}
              </label>
              <input
                type="number"
                id="location_x"
                name="location_x"
                value={formData.location_x}
                onChange={handleInputChange}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.0"
              />
            </div>

            {/* Location Y */}
            <div>
              <label htmlFor="location_y" className="block text-sm font-medium text-gray-700">
                {t('lanterns.locationY')}
              </label>
              <input
                type="number"
                id="location_y"
                name="location_y"
                value={formData.location_y}
                onChange={handleInputChange}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.0"
              />
            </div>

            {/* Brightness Level */}
            <div className="sm:col-span-2">
              <label htmlFor="brightness_level" className="block text-sm font-medium text-gray-700">
                {t('lanterns.brightnessLevel')} - {t('lanterns.current')}: {formData.brightness_level}%
              </label>
              <input
                type="range"
                id="brightness_level"
                name="brightness_level"
                min="0"
                max="100"
                value={formData.brightness_level}
                onChange={handleInputChange}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/lanterns')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('common.cancel')}
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
                    {isEditing ? t('lanterns.updating') : t('lanterns.creating')}
                  </span>
                </>
              ) : (
                <span>{isEditing ? t('lanterns.updateButton') : t('lanterns.createButton')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LanternForm; 