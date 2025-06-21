import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Statistics: React.FC = () => {
  const { t } = useTranslation();

  // Fetch statistics data
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: apiService.getStatistics,
  });

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

  const isLoading = statsLoading || lanternsLoading || parksLoading || breakdownsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalLanterns = lanterns?.length || 0;
  const activeLanterns = lanterns?.filter((l: any) => l.status === 'working')?.length || 0;
  const brokenLanterns = lanterns?.filter((l: any) => l.status === 'broken')?.length || 0;
  const totalParks = parks?.length || 0;
  const activeBreakdowns = breakdowns?.filter((b: any) => b.status !== 'fixed')?.length || 0;

  const stats = [
    {
      name: t('dashboard.totalLanterns'),
      value: totalLanterns,
      icon: LightBulbIcon,
      color: 'bg-blue-500',
      description: t('statistics.totalLanternsDesc')
    },
    {
      name: t('dashboard.activeLanterns'),
      value: activeLanterns,
      icon: BoltIcon,
      color: 'bg-green-500',
      description: t('statistics.activeLanternsDesc')
    },
    {
      name: t('dashboard.brokenLanterns'),
      value: brokenLanterns,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      description: t('statistics.brokenLanternsDesc')
    },
    {
      name: t('statistics.totalParks'),
      value: totalParks,
      icon: MapPinIcon,
      color: 'bg-purple-500',
      description: t('statistics.totalParksDesc')
    },
    {
      name: t('statistics.activeBreakdowns'),
      value: activeBreakdowns,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      description: t('statistics.activeBreakdownsDesc')
    }
  ];

  // Calculate efficiency
  const efficiency = totalLanterns > 0 ? Math.round((activeLanterns / totalLanterns) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('statistics.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t('statistics.overview')}
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <p className="text-gray-600 text-xs">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Efficiency */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('statistics.systemEfficiency')}
          </h3>
          <div className="mt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">{t('statistics.workingLanterns')}</div>
                  <div className="font-medium text-gray-900">{efficiency}%</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      efficiency >= 80
                        ? 'bg-green-500'
                        : efficiency >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${efficiency}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lantern Status Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('statistics.lanternStatusDistribution')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.working')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{activeLanterns}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.broken')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{brokenLanterns}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.other')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {totalLanterns - activeLanterns - brokenLanterns}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('statistics.breakdownReports')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.reported')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {breakdowns?.filter((b: any) => b.status === 'reported')?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.inProgress')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {breakdowns?.filter((b: any) => b.status === 'in_progress')?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('statistics.fixed')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {breakdowns?.filter((b: any) => b.status === 'fixed')?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics from API */}
      {statistics && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('statistics.apiStatisticsSummary')}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalLanterns}</div>
                <div className="text-sm text-gray-500">{t('statistics.totalLanterns')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.activeLanterns}</div>
                <div className="text-sm text-gray-500">{t('statistics.activeLanterns')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.totalParks}</div>
                <div className="text-sm text-gray-500">{t('statistics.totalParks')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.activeBreakdowns}</div>
                <div className="text-sm text-gray-500">{t('statistics.activeBreakdowns')}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              {t('statistics.lastUpdated')}: {new Date(statistics.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Statistics; 