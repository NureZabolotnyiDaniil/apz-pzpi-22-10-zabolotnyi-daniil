import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const CompanyList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: apiService.getCompanies,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(t('common.deleteSuccess'));
      setDeleteId(null);
    },
    onError: () => {
      toast.error(t('common.deleteError'));
    },
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {t('company.loadError')}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('company.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('company.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/companies/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            {t('common.create')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies?.map((company: any) => (
          <div key={company.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('company.name')}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {company.name}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">{t('company.phone')}:</span>
                    <span>{company.phone}</span>
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">{t('company.email')}:</span>
                    <span>{company.email}</span>
                  </div>
                )}
                
                {company.address && (
                  <div className="flex items-start text-sm text-gray-500">
                    <span className="font-medium mr-2">{t('company.address')}:</span>
                    <span className="flex-1">{company.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  to={`/companies/${company.id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </Link>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!companies || companies.length === 0) && !isLoading && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('company.noCompanies')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('company.noCompaniesDescription')}
          </p>
          <div className="mt-6">
            <Link
              to="/companies/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              {t('company.add')}
            </Link>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={t('common.confirmDelete')}
          message={t('company.deleteMessage')}
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default CompanyList;
