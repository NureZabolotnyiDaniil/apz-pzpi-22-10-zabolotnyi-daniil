import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import {
  HomeIcon,
  LightBulbIcon,
  MapIcon,

  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const mainNavigation = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: HomeIcon,
    },
  ];

  const infrastructureNavigation = [
    {
      name: t('navigation.lanterns'),
      href: '/lanterns',
      icon: LightBulbIcon,
    },
    {
      name: t('navigation.parks'),
      href: '/parks',
      icon: MapIcon,
    },

  ];

  const maintenanceNavigation = [
    {
      name: t('navigation.breakdowns'),
      href: '/breakdowns',
      icon: ExclamationTriangleIcon,
    },
    {
      name: t('navigation.renovations'),
      href: '/renovations',
      icon: WrenchScrewdriverIcon,
    },
  ];

  const managementNavigation = [
    {
      name: t('navigation.companies'),
      href: '/companies',
      icon: BuildingOfficeIcon,
    },
    {
      name: t('navigation.repairmen'),
      href: '/repairmen',
      icon: UserGroupIcon,
    },
  ];

  const analyticsNavigation = [
    {
      name: t('navigation.statistics'),
      href: '/statistics',
      icon: ChartBarIcon,
    },
  ];

  const adminNavigation = [
    {
      name: t('navigation.users'),
      href: '/admin/users',
      icon: UsersIcon,
    },
    {
      name: t('admin.dataManagement'),
      href: '/admin/data',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <Transition
        show={isOpen}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 z-40 lg:hidden"
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      </Transition>

      {/* Sidebar */}
      <Transition
        show={isOpen}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <LightBulbIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                SmartLighting
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Main navigation */}
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Infrastructure section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.infrastructure')}
                </h3>
              </div>
              <div className="space-y-1">
                {infrastructureNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Maintenance section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.maintenance')}
                </h3>
              </div>
              <div className="space-y-1">
                {maintenanceNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Management section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.management')}
                </h3>
              </div>
              <div className="space-y-1">
                {managementNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Analytics section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.analytics')}
                </h3>
              </div>
              <div className="space-y-1">
                {analyticsNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Admin section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.admin')}
                </h3>
              </div>
              <div className="space-y-1">
                {adminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <LightBulbIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              SmartLighting
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Main navigation */}
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Infrastructure section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.infrastructure')}
                </h3>
              </div>
              <div className="space-y-1">
                {infrastructureNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Maintenance section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.maintenance')}
                </h3>
              </div>
              <div className="space-y-1">
                {maintenanceNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Management section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.management')}
                </h3>
              </div>
              <div className="space-y-1">
                {managementNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Analytics section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.analytics')}
                </h3>
              </div>
              <div className="space-y-1">
                {analyticsNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Admin section */}
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('navigation.admin')}
                </h3>
              </div>
              <div className="space-y-1">
                {adminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 