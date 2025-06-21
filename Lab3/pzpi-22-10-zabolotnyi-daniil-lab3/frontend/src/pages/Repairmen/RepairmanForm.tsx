import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface RepairmanFormData {
  name: string;
  email: string;
  phone: string;
  companyId: number;
  specialization?: string;
}

const RepairmanForm: React.FC = () => {
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
  } = useForm<RepairmanFormData>();

  // Fetch repairman data if editing
  const { data: repairman, isLoading: isLoadingRepairman } = useQuery({
    queryKey: ['repairman', id],
    queryFn: () => apiService.getRepairman(Number(id)),
    enabled: isEdit,
  });

  // Fetch companies for selection
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: apiService.getCompanies,
  });

  const createMutation = useMutation({
    mutationFn: apiService.createRepairman,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairmen'] });
      toast.success(t('repairman.created'));
      navigate('/repairmen');
    },
    onError: () => {
      toast.error(t('repairman.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiService.updateRepairman(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairmen'] });
      queryClient.invalidateQueries({ queryKey: ['repairman', id] });
      toast.success(t('repairman.updated'));
      navigate('/repairmen');
    },
    onError: () => {
      toast.error(t('repairman.updateError'));
    },
  });

  useEffect(() => {
    if (repairman && isEdit) {
      setValue('name', repairman.name || '');
      setValue('email', repairman.email || '');
      setValue('phone', repairman.phone || '');
      setValue('companyId', repairman.company_id || repairman.companyId);
      setValue('specialization', repairman.specialization || '');
    }
  }, [repairman, isEdit, setValue]);

  const onSubmit = (data: RepairmanFormData) => {
    const repairmanData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company_id: data.companyId,
      specialization: data.specialization,
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), data: repairmanData });
    } else {
      createMutation.mutate(repairmanData);
    }
  };

  if (isLoadingRepairman) return <LoadingSpinner />;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/repairmen')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t('back')}
        </button>
        <h1 className="mt-4 text-2xl font-semibold leading-6 text-gray-900">
          {isEdit ? t('repairman.edit') : t('repairman.add')}
        </h1>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Name */}
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('repairman.name')} *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  {...register('name', {
                    required: t('repairman.nameRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('repairman.email')} *
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  {...register('email', {
                    required: t('repairman.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('repairman.emailInvalid'),
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="sm:col-span-3">
              <label
                htmlFor="phone"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('repairman.phone')} *
              </label>
              <div className="mt-2">
                <input
                  type="tel"
                  {...register('phone', {
                    required: t('repairman.phoneRequired'),
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Company Selection */}
            <div className="sm:col-span-3">
              <label
                htmlFor="companyId"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('repairman.company')} *
              </label>
              <div className="mt-2">
                <select
                  {...register('companyId', {
                    required: t('repairman.companyRequired'),
                    valueAsNumber: true,
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">{t('repairman.selectCompany')}</option>
                  {companies?.map((company: any) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.companyId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="sm:col-span-6">
              <label
                htmlFor="specialization"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t('repairman.specialization')}
              </label>
              <div className="mt-2">
                <textarea
                  rows={3}
                  {...register('specialization')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder={t('repairman.specializationPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? t('common.saving')
                : isEdit
                ? t('common.update')
                : t('common.create')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/repairmen')}
              className="ml-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairmanForm;
