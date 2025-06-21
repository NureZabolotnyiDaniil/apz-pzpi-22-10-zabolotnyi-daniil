import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, MapPinIcon, MapIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const ParkList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: parks, isLoading, error } = useQuery({
    queryKey: ['parks'],
    queryFn: apiService.getParks,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deletePark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
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
        {t('parks.loadError')}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('parks.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('parks.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/parks/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            {t('common.create')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parks?.map((park: any) => (
          <div key={park.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('parks.name')}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {park.name}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <p className="text-gray-500 mb-2">
                  <span className="font-medium">{t('parks.address')}:</span> {park.address}
                </p>
                <p className="text-gray-500 mb-2">
                  <span className="font-medium">{t('parks.area')}:</span> {park.area} {t('parks.hectares')}
                </p>
                <div className="flex justify-end space-x-2 mt-3">
                  <Link
                    to={`/parks/${park.id}/map`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MapIcon className="h-3 w-3 mr-1" />
                    {t('parks.openParkPage')}
                  </Link>
                  <button
                    onClick={() => handleDelete(park.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={t('common.confirmDelete')}
          message={t('parks.confirmDelete')}
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default ParkList; 