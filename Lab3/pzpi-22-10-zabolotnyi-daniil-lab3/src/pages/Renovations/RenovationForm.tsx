import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface RenovationFormData {
  lanternId: number;
  scheduledDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  description?: string;
  cost?: number;
  completedDate?: string;
}

const RenovationForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RenovationFormData>();

  const watchStatus = watch('status');

  // Fetch renovation data if editing
  const { data: renovation, isLoading: isLoadingRenovation } = useQuery({
    queryKey: ['renovation', id],
    queryFn: () => apiService.getRenovation(Number(id)),
    enabled: isEdit,
  });

  // Fetch lanterns for selection
  const { data: lanterns } = useQuery({
    queryKey: ['lanterns'],
    queryFn: apiService.getLanterns,
  });

  const createMutation = useMutation({
    mutationFn: apiService.createRenovation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renovations'] });
      toast.success(t('renovation.created'));
      navigate('/renovations');
    },
    onError: () => {
      toast.error(t('renovation.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateRenovation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renovations'] });
      queryClient.invalidateQueries({ queryKey: ['renovation', id] });
      toast.success(t('renovation.updated'));
      navigate('/renovations');
    },
    onError: () => {
      toast.error(t('renovation.updateError'));
    },
  });

  useEffect(() => {
    if (renovation && isEdit) {
      setValue('lanternId', renovation.lanternId || renovation.lantern_id);
      const scheduledDate = renovation.scheduledDate || renovation.start_date;
      if (scheduledDate) {
        setValue('scheduledDate', scheduledDate.split('T')[0]);
      }
      setValue('status', renovation.status);
      setValue('description', renovation.description || '');
      setValue('cost', renovation.cost || 0);
      const completedDate = renovation.completedDate || renovation.end_date;
      if (completedDate) {
        setValue('completedDate', completedDate.split('T')[0]);
      }
    } else if (!isEdit) {
      setValue('status', 'planned');
    }
  }, [renovation, isEdit, setValue]);

  const onSubmit = (data: RenovationFormData) => {
    const renovationData = {
      lantern_id: data.lanternId,
      scheduled_date: data.scheduledDate,
      status: data.status,
      description: data.description,
      cost: data.cost,
      completed_date: data.completedDate,
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), data: renovationData });
    } else {
      createMutation.mutate(renovationData);
    }
  };

  if (isLoadingRenovation) return <LoadingSpinner />;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/renovations')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t('back')}
        </button>
        <h1 className="mt-4 text-2xl font-semibold leading-6 text-gray-900">
          {isEdit ? t('renovation.edit') : t('renovation.add')}
        </h1>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Lantern Selection */}
            <div className="sm:col-span-3">
              <label
                htmlFor="lanternId"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('renovation.lantern')} *
              </label>
              <div className="mt-2">
                <select
                  {...register('lanternId', {
                    required: t('renovation.lanternRequired'),
                    valueAsNumber: true,
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">{t('renovation.selectLantern')}</option>
                  {lanterns?.map((lantern: any) => (
                    <option key={lantern.id} value={lantern.id}>
                      {t('lantern')} #{lantern.id}
                      {lantern.park && ` - ${lantern.park.name}`}
                    </option>
                  ))}
                </select>
                {errors.lanternId && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.lanternId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="sm:col-span-3">
              <label
                htmlFor="status"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('renovation.status.label')} *
              </label>
              <div className="mt-2">
                <select
                  {...register('status', {
                    required: t('renovation.statusRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="planned">{t('renovation.status.planned')}</option>
                  <option value="in_progress">{t('renovation.status.inProgress')}</option>
                  <option value="completed">{t('renovation.status.completed')}</option>
                </select>
                {errors.status && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="sm:col-span-3">
              <label
                htmlFor="scheduledDate"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('renovation.scheduledDate')} *
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  {...register('scheduledDate', {
                    required: t('renovation.scheduledDateRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.scheduledDate && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.scheduledDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Completed Date - only show if status is completed */}
            {watchStatus === 'completed' && (
              <div className="sm:col-span-3">
                <label
                  htmlFor="completedDate"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t('renovation.completedDate')}
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    {...register('completedDate')}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            )}

            {/* Cost */}
            <div className="sm:col-span-3">
              <label
                htmlFor="cost"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('renovation.cost')}
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cost', { valueAsNumber: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.cost.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('renovation.description')}
              </label>
              <div className="mt-2">
                <textarea
                  {...register('description')}
                  rows={4}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder={t('renovation.descriptionPlaceholder')}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-x-3">
            <button
              type="button"
              onClick={() => navigate('/renovations')}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t('saving')
                : isEdit
                ? t('save')
                : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenovationForm; 