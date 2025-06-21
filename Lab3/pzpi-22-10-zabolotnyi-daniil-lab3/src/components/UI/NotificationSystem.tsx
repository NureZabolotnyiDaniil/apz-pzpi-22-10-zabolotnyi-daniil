import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  BellIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'registration' | 'breakdown';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const NotificationSystem: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    // Load from localStorage to remember dismissed notifications across sessions
    const stored = localStorage.getItem('read_notifications');
    return stored ? JSON.parse(stored) : [];
  });
  const queryClient = useQueryClient();

  // Fetch pending registrations for full access admins
  const { data: admins } = useQuery({
    queryKey: ['admins'],
    queryFn: apiService.getAdmins,
    enabled: user?.rights === 'full_access',
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch breakdowns for notifications
  const { data: breakdowns } = useQuery({
    queryKey: ['breakdowns'],
    queryFn: apiService.getBreakdowns,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch lanterns to check for repairs
  const { data: lanterns } = useQuery({
    queryKey: ['lanterns'],
    queryFn: apiService.getLanterns,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Generate notifications from data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Registration notifications for full access admins
    if (user?.rights === 'full_access' && admins) {
      const pendingAdmins = admins.filter((admin: any) => admin.status === 'inactive');
      pendingAdmins.forEach((admin: any) => {
        newNotifications.push({
          id: `registration-${admin.id}`,
          type: 'registration',
          title: t('notifications.newRegistration'),
          message: t('notifications.registrationMessage', { 
            name: `${admin.first_name} ${admin.surname}`, 
            email: admin.email 
          }),
          timestamp: admin.created_at || new Date().toISOString(),
          read: false,
          data: admin,
        });
      });
    }

    // Breakdown notifications for all admins
    if (breakdowns && lanterns) {
      const recentBreakdowns = breakdowns
        .filter((breakdown: any) => {
          // Don't show breakdown notifications if lantern is now working
          const lantern = lanterns.find((l: any) => l.id === breakdown.lantern_id);
          if (lantern && lantern.status === 'working') {
            // Check if lantern was repaired after breakdown
            const breakdownDate = new Date(breakdown.created_at || breakdown.date);
            const lanternLastSeen = new Date(lantern.last_seen || new Date());
            return lanternLastSeen <= breakdownDate; // Only show if breakdown is newer than last repair
          }
          return breakdown.status !== 'fixed';
        })
        .slice(0, 5); // Show only recent 5 breakdowns

      recentBreakdowns.forEach((breakdown: any) => {
        newNotifications.push({
          id: `breakdown-${breakdown.id}`,
          type: 'breakdown',
          title: t('notifications.lanternBreakdown'),
          message: t('notifications.breakdownMessage', {
            lanternId: breakdown.lantern_id,
            parkId: breakdown.park_id || t('notifications.unknownPark'),
            description: breakdown.description
          }),
          timestamp: breakdown.created_at || breakdown.date || new Date().toISOString(),
          read: false,
          data: breakdown,
        });
      });
    }

    // Sort by timestamp (newest first)
    newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter out notifications that were already read in previous sessions
    const filtered = newNotifications.map(n => ({ ...n, read: readIds.includes(n.id) }));
    setNotifications(filtered);
  }, [admins, breakdowns, lanterns, user, t, readIds]);

  // Activate admin mutation
  const activateAdminMutation = useMutation({
    mutationFn: ({ email, data }: { email: string, data: any }) => 
      apiService.updateAdminStatus(email, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('notifications.adminActivated'));
      // Remove registration notifications for this admin from all admins
      setNotifications(prev => 
        prev.filter(notif => 
          !(notif.type === 'registration' && notif.data?.email === variables.email)
        )
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t('notifications.adminActivationError'));
    },
  });

  const handleActivateAdmin = (admin: any) => {
    activateAdminMutation.mutate({
      email: admin.email,
      data: { status: 'active', rights: 'restricted_access' }
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setReadIds(prev => {
      const updated = [...prev, notificationId];
      localStorage.setItem('read_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setReadIds(allIds);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
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
      return 'Unknown time';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <UserPlusIcon className="h-5 w-5 text-blue-500" />;
      case 'breakdown':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-400 text-xs font-medium text-white text-center leading-4">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('notifications.title')}</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    {t('notifications.markAllAsRead')}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('notifications.noNotifications')}
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 mt-2">
                          {notification.type === 'registration' && user?.rights === 'full_access' && (
                            <button
                              onClick={() => handleActivateAdmin(notification.data)}
                              disabled={activateAdminMutation.isPending}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckIcon className="h-3 w-3 mr-1" />
                              {t('notifications.activate')}
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-500"
                            >
                              {t('notifications.markAsRead')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem; 