import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const BreakdownList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: breakdowns, isLoading, error } = useQuery({
    queryKey: ['breakdowns'],
    queryFn: apiService.getBreakdowns,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteBreakdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breakdowns'] });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'fixed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'reported':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'fixed':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
        {t('breakdown.loadError')}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('breakdown.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('breakdown.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/breakdowns/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            {t('common.create')}
          </Link>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('breakdown.description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('breakdown.status.label')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('common.lantern')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('breakdown.reportedAt')}
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">{t('common.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {breakdowns?.map((breakdown: any) => (
                    <tr key={breakdown.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        #{breakdown.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={breakdown.description}>
                          {breakdown.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {getStatusIcon(breakdown.status)}
                          <span className={`ml-2 ${getStatusBadge(breakdown.status)}`}>
                            {t(`breakdown.status.${breakdown.status}`)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        #{breakdown.lantern_id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {breakdown.report_date ? 
                          new Date(breakdown.report_date).toLocaleString() : 
                          breakdown.date ? 
                          new Date(breakdown.date).toLocaleString() :
                          t('common.notSet')
                        }
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/breakdowns/${breakdown.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </Link>
                        <button
                          onClick={() => handleDelete(breakdown.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {(!breakdowns || breakdowns.length === 0) && !isLoading && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('breakdown.noBreakdowns')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('breakdown.noBreakdownsDescription')}
          </p>
          <div className="mt-6">
            <Link
              to="/breakdowns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              {t('breakdown.add')}
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
          message={t('breakdown.deleteMessage')}
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default BreakdownList; 