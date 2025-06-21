import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const RenovationList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: renovations, isLoading, error } = useQuery({
    queryKey: ['renovations'],
    queryFn: apiService.getRenovations,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteRenovation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renovations'] });
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
      case 'planned':
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <WrenchScrewdriverIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'planned':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('common.notSet');
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if the date is today
      const isToday = date.toDateString() === now.toDateString();
      
      const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
      
      if (isToday) {
        // Show only time for today's dates, adapted to user's timezone
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        };
        return date.toLocaleTimeString(locale, timeOptions);
      } else {
        // Show full date and time for other dates, adapted to user's timezone
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        };
        return date.toLocaleString(locale, options);
      }
    } catch {
      return t('common.invalidDate');
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return t('common.notSpecified');
    return `$${amount.toLocaleString()}`;
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
        {t('renovation.loadError')}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('renovation.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('renovation.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/renovations/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            {t('common.create')}
          </Link>
        </div>
      </div>

      {(!renovations || renovations.length === 0) && !isLoading ? (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('renovation.noRenovations')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('renovation.noRenovationsDescription')}
          </p>
          <div className="mt-6">
            <Link
              to="/renovations/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              {t('renovation.add')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('common.id')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.status.label')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.scheduledDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.completedDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.cost')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('renovation.priority')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {renovations?.map((renovation: any) => (
                      <tr key={renovation.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          #{renovation.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {renovation.name || `Renovation #${renovation.id}`}
                              </div>
                              {renovation.description && (
                                <div className="text-gray-500 text-xs truncate max-w-xs">
                                  {renovation.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            {getStatusIcon(renovation.status)}
                            <span className={`ml-2 ${getStatusBadge(renovation.status)}`}>
                              {renovation.status === 'planned' && t('renovation.status.planned')}
                              {renovation.status === 'in_progress' && t('renovation.status.inProgress')}
                              {renovation.status === 'completed' && t('renovation.status.completed')}
                              {!renovation.status && t('common.unknown')}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(renovation.start_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(renovation.completion_date || renovation.end_date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatCurrency(renovation.cost)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            renovation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            renovation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {renovation.priority === 'high' && t('renovation.priorityValues.high')}
                            {renovation.priority === 'medium' && t('renovation.priorityValues.medium')}
                            {renovation.priority === 'low' && t('renovation.priorityValues.low')}
                            {!renovation.priority && t('common.unknown')}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/renovations/${renovation.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Edit renovation"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(renovation.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete renovation"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={t('common.confirmDelete')}
          message={t('renovation.deleteMessage')}
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default RenovationList; 