import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';

interface StatusUpdateData {
  status: 'active' | 'inactive';
  rights: 'full_access' | 'restricted_access';
  park_id?: number;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{userId: number, email: string} | null>(null);



  const [statusData, setStatusData] = useState<StatusUpdateData>({
    status: 'active',
    rights: 'restricted_access',
    park_id: undefined,
  });

  // Fetch admins list
  const { data: admins, isLoading, error } = useQuery({
    queryKey: ['admins'],
    queryFn: apiService.getAdmins,
  });

  // Fetch parks for dropdown
  const { data: parks = [] } = useQuery({
    queryKey: ['parks'],
    queryFn: apiService.getParks,
  });



  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ email, data }: { email: string, data: StatusUpdateData }) => 
      apiService.updateAdminStatus(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('users.statusUpdatedSuccess'));
      setStatusUpdate(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t('users.statusUpdateError'));
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: apiService.deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('users.userDeletedSuccess'));
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t('users.userDeleteError'));
    },
  });

  const handleEditUser = (admin: any) => {
    setStatusData({
      status: admin.status,
      rights: admin.rights,
      park_id: admin.park_id || undefined,
    });
    setStatusUpdate({ userId: admin.id, email: admin.email });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };



  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusUpdate) {
      updateStatusMutation.mutate({
        email: statusUpdate.email,
        data: statusData,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRightsBadge = (rights: string) => {
    return rights === 'full_access' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('users.never');
    try {
      const date = new Date(dateString);
      
      // Format the date and time according to user's timezone
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      };
      
      return date.toLocaleDateString('uk-UA', options);
    } catch {
      return t('users.invalidDate');
    }
  };

  const canManageUser = (admin: any) => {
    return currentUser?.rights === 'full_access' && admin.id !== currentUser.id;
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
        {t('users.loadError')}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('users.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('users.description')}
          </p>
        </div>

      </div>

      {/* Users Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.rights')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.park')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {t('users.lastLogin')}
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">{t('users.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {admins?.map((admin: any) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {admin.first_name} {admin.surname}
                            </div>
                            <div className="text-gray-500 text-xs">
                              ID: #{admin.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {admin.status === 'active' ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(admin.status)}`}>
                            {t(`users.${admin.status}`)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {admin.rights === 'full_access' ? (
                            <ShieldCheckIcon className="h-4 w-4 text-blue-500 mr-1" />
                          ) : (
                            <ShieldExclamationIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRightsBadge(admin.rights)}`}>
                            {admin.rights === 'full_access' ? t('users.fullAccess') : t('users.restrictedAccess')}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {admin.park_name || t('users.noParksAssigned')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(admin.last_login)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          {canManageUser(admin) && (
                            <>
                              <button
                                onClick={() => handleEditUser(admin)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Edit user status and rights"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(admin.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete user"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {admin.id === currentUser?.id && (
                            <span className="text-xs text-gray-500 italic">{t('users.you')}</span>
                          )}
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



      {/* Edit User Status Modal */}
      {statusUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t('users.editUserTitle')}
            </h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('users.status')}</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="active">{t('users.active')}</option>
                  <option value="inactive">{t('users.inactive')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('users.rights')}</label>
                <select
                  value={statusData.rights}
                  onChange={(e) => setStatusData(prev => ({ ...prev, rights: e.target.value as 'full_access' | 'restricted_access' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="restricted_access">{t('users.restrictedAccess')}</option>
                  <option value="full_access">{t('users.fullAccess')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('users.park')}</label>
                <select
                  value={statusData.park_id}
                  onChange={(e) => setStatusData(prev => ({ ...prev, park_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">{t('auth.selectPark')}</option>
                  {parks.map((park: any) => (
                    <option key={park.id} value={park.id}>{park.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setStatusUpdate(null)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? t('users.updating') : t('users.updateUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title={t('users.deleteConfirmTitle')}
          message={t('users.deleteConfirmMessage')}
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default UserManagement; 