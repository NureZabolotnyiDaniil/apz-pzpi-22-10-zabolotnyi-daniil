import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Bars3Icon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from '../UI/NotificationSystem';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('navigation.dashboard');
    if (path.includes('/lanterns')) return t('navigation.lanterns');
    if (path.includes('/parks')) return t('navigation.parks');
    if (path.includes('/statistics')) return t('navigation.statistics');
    if (path.includes('/breakdowns')) return t('navigation.breakdowns');
    if (path.includes('/renovations')) return t('navigation.renovations');
    if (path.includes('/companies')) return t('navigation.companies');
    if (path.includes('/repairmen')) return t('navigation.repairmen');
    if (path.includes('/admin/users')) return t('navigation.users');
    if (path.includes('/admin')) return t('navigation.admin');
    return t('navigation.dashboard');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900 lg:ml-0">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Language switcher, notifications, and user menu */}
        <div className="flex items-center space-x-4">
          {/* Language switcher */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <LanguageIcon className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">
                {i18n.language.toUpperCase()}
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        English
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage('uk')}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Українська
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Notification System */}
          <NotificationSystem />

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <UserCircleIcon className="h-6 w-6" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {user?.name || user?.email}
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/admin/profile"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3" />
                        {t('auth.profile')}
                      </Link>
                    )}
                  </Menu.Item>
                  <div className="border-t border-gray-100"></div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        {t('navigation.logout')}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header; 