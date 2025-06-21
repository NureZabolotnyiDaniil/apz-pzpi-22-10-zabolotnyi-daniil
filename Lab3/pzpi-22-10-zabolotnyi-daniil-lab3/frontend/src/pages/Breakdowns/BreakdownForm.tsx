import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface BreakdownFormData {
  lanternId: number;
  description: string;
  date: string;
  time: string;
}

const BreakdownForm: React.FC = () => {
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
  } = useForm<BreakdownFormData>();

  // Fetch breakdown data if editing
  const { data: breakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['breakdown', id],
    queryFn: () => apiService.getBreakdown(Number(id)),
    enabled: isEdit,
  });

  // Fetch lanterns for selection
  const { data: lanterns } = useQuery({
    queryKey: ['lanterns'],
    queryFn: apiService.getLanterns,
  });

  const createMutation = useMutation({
    mutationFn: apiService.createBreakdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
      toast.success(t('breakdown.created'));
      navigate('/breakdowns');
    },
    onError: () => {
      toast.error(t('breakdown.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateBreakdown(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
      queryClient.invalidateQueries({ queryKey: ['breakdown', id] });
      toast.success(t('breakdown.updated'));
      navigate('/breakdowns');
    },
    onError: () => {
      toast.error(t('breakdown.updateError'));
    },
  });

  useEffect(() => {
    if (breakdown && isEdit) {
      const reportedDate = new Date(breakdown.reported_at || breakdown.reportedAt);
      setValue('lanternId', breakdown.lantern_id || breakdown.lanternId);
      setValue('description', breakdown.description || '');
      setValue('date', reportedDate.toISOString().split('T')[0]);
      setValue('time', reportedDate.toTimeString().slice(0, 5));
    } else if (!isEdit) {
      // Set current date and time for new breakdown
      const now = new Date();
      setValue('date', now.toISOString().split('T')[0]);
      setValue('time', now.toTimeString().slice(0, 5));
    }
  }, [breakdown, isEdit, setValue]);

  const onSubmit = (data: BreakdownFormData) => {
    const breakdownData = {
      lantern_id: data.lanternId,
      description: data.description,
      date: data.date,
      time: data.time,
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), data: breakdownData });
    } else {
      createMutation.mutate(breakdownData);
    }
  };

  if (isLoadingBreakdown) return <LoadingSpinner />;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/breakdowns')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t('back')}
        </button>
        <h1 className="mt-4 text-2xl font-semibold leading-6 text-gray-900">
          {isEdit ? t('breakdown.edit') : t('breakdown.add')}
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
                {t('breakdown.lantern')} *
              </label>
              <div className="mt-2">
                <select
                  {...register('lanternId', {
                    required: t('breakdown.lanternRequired'),
                    valueAsNumber: true,
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">{t('breakdown.selectLantern')}</option>
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

            {/* Date */}
            <div className="sm:col-span-3">
              <label
                htmlFor="date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('breakdown.date')} *
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  {...register('date', {
                    required: t('breakdown.dateRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="sm:col-span-3">
              <label
                htmlFor="time"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('breakdown.time')} *
              </label>
              <div className="mt-2">
                <input
                  type="time"
                  {...register('time', {
                    required: t('breakdown.timeRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.time && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.time.message}
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
                {t('breakdown.description')}
              </label>
              <div className="mt-2">
                <textarea
                  {...register('description')}
                  rows={4}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder={t('breakdown.descriptionPlaceholder')}
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
              onClick={() => navigate('/breakdowns')}
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

export default BreakdownForm; 