import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import GoogleMap from '../../components/Map/GoogleMap';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: lanterns, isLoading: lanternsLoading } = useQuery({
    queryKey: ['lanterns'],
    queryFn: apiService.getLanterns,
  });

  const { data: parks, isLoading: parksLoading } = useQuery({
    queryKey: ['parks'],
    queryFn: apiService.getParks,
  });

  const { data: breakdowns, isLoading: breakdownsLoading } = useQuery({
    queryKey: ['breakdowns'],
    queryFn: apiService.getBreakdowns,
  });

  const { data: renovations, isLoading: renovationsLoading } = useQuery({
    queryKey: ['renovations'],
    queryFn: apiService.getRenovations,
  });

  // Fetch recent activities for Recent Activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => apiService.getRecentActivities(10),
  });



  // Fetch admin's park data if user has parkId
  const { data: adminPark, isLoading: adminParkLoading } = useQuery({
    queryKey: ['adminPark', user?.parkId],
    queryFn: () => apiService.getPark(user!.parkId!),
    enabled: !!user?.parkId,
  });

  // Filter lanterns for admin's park
  const adminParkLanterns = lanterns?.filter((lantern: any) => lantern.park_id === user?.parkId) || [];

  const isLoading = lanternsLoading || parksLoading || breakdownsLoading || renovationsLoading || activitiesLoading || adminParkLoading;

  // Calculate statistics
  const totalLanterns = lanterns?.length || 0;
  const activeLanterns = lanterns?.filter((l: any) => l.status === 'working')?.length || 0;
  const brokenLanterns = lanterns?.filter((l: any) => l.status === 'broken')?.length || 0;
  const totalParks = parks?.length || 0;
  const activeBreakdowns = breakdowns?.filter((b: any) => b.status !== 'fixed')?.length || 0;
  const activeRenovations = renovations?.filter((r: any) => r.status === 'in_progress')?.length || 0;

  const stats = [
    {
      name: t('dashboard.totalLanterns'),
      value: totalLanterns,
      icon: LightBulbIcon,
      color: 'bg-blue-500',
    },
    {
      name: t('dashboard.activeLanterns'),
      value: activeLanterns,
      icon: BoltIcon,
      color: 'bg-green-500',
    },
    {
      name: t('dashboard.brokenLanterns'),
      value: brokenLanterns,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      name: t('dashboard.totalParks'),
      value: totalParks,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: t('dashboard.activeBreakdowns'),
      value: activeBreakdowns,
      icon: WrenchScrewdriverIcon,
      color: 'bg-orange-500',
    },
    {
      name: t('dashboard.activeRenovations'),
      value: activeRenovations,
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500',
    },
  ];

  // Map activity types to display information
  const getActivityDisplayInfo = (activity: any) => {
    const activityTypeMap: Record<string, { icon: any; iconColor: string; title: string }> = {
      'lantern_created': { icon: LightBulbIcon, iconColor: 'bg-green-500', title: t('dashboard.activities.lantern_created') },
      'lantern_updated': { icon: LightBulbIcon, iconColor: 'bg-blue-500', title: t('dashboard.activities.lantern_updated') },
      'lantern_deleted': { icon: LightBulbIcon, iconColor: 'bg-red-500', title: t('dashboard.activities.lantern_deleted') },
      'park_created': { icon: ChartBarIcon, iconColor: 'bg-green-500', title: t('dashboard.activities.park_created') },
      'park_updated': { icon: ChartBarIcon, iconColor: 'bg-blue-500', title: t('dashboard.activities.park_updated') },
      'park_deleted': { icon: ChartBarIcon, iconColor: 'bg-red-500', title: t('dashboard.activities.park_deleted') },
      'breakdown_created': { icon: ExclamationTriangleIcon, iconColor: 'bg-red-500', title: t('dashboard.activities.breakdown_created') },
      'breakdown_updated': { icon: ExclamationTriangleIcon, iconColor: 'bg-yellow-500', title: t('dashboard.activities.breakdown_updated') },
      'breakdown_fixed': { icon: ExclamationTriangleIcon, iconColor: 'bg-green-500', title: t('dashboard.activities.breakdown_fixed') },
      'renovation_created': { icon: WrenchScrewdriverIcon, iconColor: 'bg-blue-500', title: t('dashboard.activities.renovation_created') },
      'renovation_updated': { icon: WrenchScrewdriverIcon, iconColor: 'bg-yellow-500', title: t('dashboard.activities.renovation_updated') },
      'renovation_completed': { icon: WrenchScrewdriverIcon, iconColor: 'bg-green-500', title: t('dashboard.activities.renovation_completed') },
      'user_created': { icon: UserGroupIcon, iconColor: 'bg-green-500', title: t('dashboard.activities.user_created') },
      'user_updated': { icon: UserGroupIcon, iconColor: 'bg-blue-500', title: t('dashboard.activities.user_updated') },
      'user_deleted': { icon: UserGroupIcon, iconColor: 'bg-red-500', title: t('dashboard.activities.user_deleted') },
      'system_update': { icon: BoltIcon, iconColor: 'bg-purple-500', title: t('dashboard.activities.system_update') },
      'data_export': { icon: BuildingOfficeIcon, iconColor: 'bg-indigo-500', title: t('dashboard.activities.data_export') },
      'backup_created': { icon: BuildingOfficeIcon, iconColor: 'bg-teal-500', title: t('dashboard.activities.backup_created') },
    };

    return activityTypeMap[activity.activity_type] || {
      icon: BoltIcon,
      iconColor: 'bg-gray-500',
      title: t('dashboard.activities.system_activity')
    };
  };

  // Translate activity description
  const translateActivityDescription = (description: string) => {
    // Pattern matching for Ukrainian descriptions
    if (i18n.language === 'en') {
      if (description.includes('Оновлено ліхтар #')) {
        const match = description.match(/Оновлено ліхтар #(\d+)/);
        return match ? `Updated lantern #${match[1]}` : description;
      }
      if (description.includes('Створено ліхтар #')) {
        const match = description.match(/Створено ліхтар #(\d+)/);
        return match ? `Created lantern #${match[1]}` : description;
      }
      if (description.includes('Видалено ліхтар #')) {
        const match = description.match(/Видалено ліхтар #(\d+)/);
        return match ? `Deleted lantern #${match[1]}` : description;
      }
      if (description.includes('Оновлено парк')) {
        return description.replace('Оновлено парк', 'Updated park');
      }
      if (description.includes('Створено парк')) {
        return description.replace('Створено парк', 'Created park');
      }
    }
    return description;
  };

  // Format time helper function with local timezone
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Format the date and time according to user's timezone and language
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      };
      
      // Use current language for date formatting
      const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
      return date.toLocaleDateString(locale, options);
    } catch {
      return t('dashboard.unknownTime');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentActivities = activities || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('dashboard.overview')}
        </p>
      </div>



      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('dashboard.quickActions')}
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/lanterns/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 ring-4 ring-white">
                  <LightBulbIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t('dashboard.addNewLantern')}
                  </span>
                </h3>
                                  <p className="mt-2 text-sm text-gray-500">
                    {t('dashboard.addNewLanternDesc')}
                  </p>
              </div>
            </a>

            <a
              href="/statistics"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t('dashboard.viewStatistics')}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                                      {t('dashboard.viewStatisticsDesc')}
                </p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                  <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t('dashboard.manageUsers')}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                                      {t('dashboard.manageUsersDesc')}
                </p>
              </div>
            </a>

            <a
              href="/breakdowns"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-300 hover:border-gray-400"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-600 ring-4 ring-white">
                  <WrenchScrewdriverIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t('dashboard.viewBreakdowns')}
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                                      {t('dashboard.viewBreakdownsDesc')}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Admin's Park Map */}
      {user?.parkId && adminPark && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                {t('dashboard.yourPark')}: {adminPark.name}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {t('dashboard.lanternsCount')}: {adminParkLanterns.length}
                </div>
                <a
                  href={`/parks/${adminPark.id}/map`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {t('parks.openParkPage')}
                </a>
              </div>
            </div>
            <div className="h-96 rounded-lg overflow-hidden">
              <GoogleMap
                park={adminPark}
                lanterns={adminParkLanterns}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-green-600">
                  {adminParkLanterns.filter((l: any) => l.status === 'working').length}
                </div>
                <div className="text-sm text-green-700">{t('dashboard.workingLanterns')}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-red-600">
                  {adminParkLanterns.filter((l: any) => l.status === 'broken').length}
                </div>
                <div className="text-sm text-red-700">{t('dashboard.brokenLanterns')}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-lg font-semibold text-yellow-600">
                  {adminParkLanterns.filter((l: any) => l.status === 'maintenance').length}
                </div>
                <div className="text-sm text-yellow-700">{t('dashboard.maintenanceLanterns')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('dashboard.recentActivities')}
          </h3>
          <div className="mt-5">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500">{t('dashboard.noRecentActivities')}</p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity: any, activityIdx: number) => {
                    const displayInfo = getActivityDisplayInfo(activity);
                    return (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== recentActivities.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className={`h-10 w-10 rounded-full ${displayInfo.iconColor} flex items-center justify-center ring-8 ring-white`}>
                                <displayInfo.icon className="h-5 w-5 text-white" aria-hidden="true" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">{displayInfo.title}</span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    {formatTime(activity.created_at)}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">{translateActivityDescription(activity.description)}</p>
                                {activity.performed_by && (
                                  <p className="mt-0.5 text-xs text-gray-400">
                                    {t('dashboard.performedBy')}: {activity.performed_by}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 