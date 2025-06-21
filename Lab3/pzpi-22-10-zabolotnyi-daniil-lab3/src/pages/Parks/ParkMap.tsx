import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  LightBulbIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import GoogleMap from '../../components/Map/GoogleMap';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { useMap } from '../../contexts/MapContext';

const ParkMap: React.FC = () => {
  const { t } = useTranslation();
  const { parkId } = useParams<{ parkId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentPark, isEditMode, setIsEditMode } = useMap();

  const [pendingUpdates, setPendingUpdates] = useState<Record<number, { lat: number; lng: number }>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch park data
  const { data: park, isLoading: parkLoading, error: parkError } = useQuery({
    queryKey: ['park', parkId],
    queryFn: () => apiService.getPark(Number(parkId)),
    enabled: !!parkId,
  });

  // Fetch lanterns for this park
  const { data: allLanterns, isLoading: lanternsLoading } = useQuery({
    queryKey: ['lanterns'],
    queryFn: apiService.getLanterns,
  });

  // Filter lanterns for current park
  const parkLanterns = allLanterns?.filter((lantern: any) => lantern.park_id === Number(parkId)) || [];

  // Update lantern position mutation
  const updateLanternMutation = useMutation({
    mutationFn: ({ lanternId, latitude, longitude }: { lanternId: number; latitude: number; longitude: number }) =>
      apiService.updateLantern(lanternId, { latitude, longitude }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
      toast.success(t('map.lanternPositionUpdated'));
    },
    onError: (error) => {
      console.error('Error updating lantern position:', error);
      toast.error(t('map.errorUpdatingPosition'));
    },
  });

  // Delete park mutation
  const deleteParkMutation = useMutation({
    mutationFn: () => apiService.deletePark(Number(parkId)),
    onSuccess: () => {
      toast.success(t('common.deleteSuccess'));
      navigate('/parks');
    },
    onError: (error) => {
      console.error('Error deleting park:', error);
      toast.error(t('common.deleteError'));
    },
  });

  // Set current park in context when park data loads
  useEffect(() => {
    if (park) {
      setCurrentPark(park);
    }
    return () => {
      setCurrentPark(null);
    };
  }, [park, setCurrentPark]);

  const handleLanternPositionUpdate = (lanternId: number, lat: number, lng: number) => {
    setPendingUpdates(prev => ({
      ...prev,
      [lanternId]: { lat, lng }
    }));
  };

      const handleMapClick = (_lat: number, _lng: number) => {
      
    };

  const handleStartPlacingLantern = (lanternId: number) => {
    // Assign park coordinates to lantern as initial position
    if (park && park.latitude && park.longitude) {
      setPendingUpdates(prev => ({
        ...prev,
        [lanternId]: { lat: park.latitude, lng: park.longitude }
      }));
      toast.success(t('map.lanternPlacedInCenter', { id: lanternId }));
    } else {
              toast.error(t('map.parkCoordinatesNotSet'));
    }
  };

  const handleSaveChanges = async () => {
    const updates = Object.entries(pendingUpdates);
    if (updates.length === 0) {
      setIsEditMode(false);
      return;
    }

    try {
      await Promise.all(
        updates.map(([lanternId, position]) =>
          updateLanternMutation.mutateAsync({
            lanternId: Number(lanternId),
            latitude: position.lat,
            longitude: position.lng,
          })
        )
      );
      setPendingUpdates({});
      setIsEditMode(false);
      toast.success(t('map.allChangesSaved'));
    } catch (error) {
      toast.error(t('map.errorSavingChanges'));
    }
  };

  const handleCancelChanges = () => {
    setPendingUpdates({});
    setIsEditMode(false);
    // Refresh lanterns to reset positions
    queryClient.invalidateQueries({ queryKey: ['lanterns'] });
  };

  const handleDeletePark = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeletePark = () => {
    deleteParkMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (parkLoading || lanternsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (parkError || !park) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('parks.parkNotFound')}</p>
        <button
          onClick={() => navigate('/parks')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          {t('common.goBack')}
        </button>
      </div>
    );
  }

  // Merge pending updates with current lantern data
  const lanternsWithUpdates = parkLanterns.map((lantern: any) => {
    const pendingUpdate = pendingUpdates[lantern.id];
    if (pendingUpdate) {
      return {
        ...lantern,
        latitude: pendingUpdate.lat,
        longitude: pendingUpdate.lng,
      };
    }
    return lantern;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/parks')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2 text-green-600" />
              {park.name}
            </h1>
            <p className="text-sm text-gray-600">{park.address}</p>
          </div>
        </div>
        
        {/* Park Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/parks/${park.id}/edit`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            {t('parks.edit')}
          </button>
          <button
            onClick={() => handleDeletePark()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            {t('parks.delete')}
          </button>
        </div>
      </div>

      {/* Map and Lanterns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {t('map.parkMap')}
                </h2>
                <div className="flex items-center space-x-4">
                  {/* Edit Controls */}
                  {isEditMode ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveChanges}
                        disabled={Object.keys(pendingUpdates).length === 0 || updateLanternMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        {updateLanternMutation.isPending ? t('common.saving') : t('common.save')}
                      </button>
                      <button
                        onClick={handleCancelChanges}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      {t('map.editPositions')}
                    </button>
                  )}
                  
                  {/* Status Legend */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      {t('map.workingLanterns')}
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      {t('map.brokenLanterns')}
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      {t('map.unknownStatus')}
                    </div>
                  </div>
                </div>
              </div>
              {isEditMode && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    {t('map.editModeInstructions')}
                  </p>
                  {Object.keys(pendingUpdates).length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      {t('map.pendingChanges', { count: Object.keys(pendingUpdates).length })}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <GoogleMap
                park={park}
                lanterns={lanternsWithUpdates}
                onLanternPositionUpdate={handleLanternPositionUpdate}
                onMapClick={handleMapClick}
                isEditMode={isEditMode}
                className="w-full h-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Lanterns List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {t('map.lanternsInPark')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {parkLanterns.length > 0 
                  ? t('map.lanternCount', { count: parkLanterns.length })
                  : t('map.noLanterns')
                }
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {parkLanterns.length > 0 ? (
                <div className="p-4 space-y-3">
                  {parkLanterns.map((lantern: any) => {
                    const hasPendingUpdate = lantern.id in pendingUpdates;
                    const statusColor = lantern.status === 'working' ? 'green' : 
                                       lantern.status === 'broken' ? 'red' : 'yellow';
                    
                    return (
                      <div
                        key={lantern.id}
                        className={`p-3 border rounded-lg ${
                          hasPendingUpdate ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {t('lanterns.lantern')} #{lantern.id}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}
                          >
                            {lantern.status === 'working' ? t('lanterns.working') : 
                             lantern.status === 'broken' ? t('lanterns.broken') : t('lanterns.unknown')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>{t('lanterns.brightness')}: 
                            {lantern.status === 'active' ? 
                              `${lantern.active_brightness || 0}% (активна)` : 
                              `${lantern.base_brightness || 0}% (базова)`
                            }
                          </p>
                          {lantern.latitude && lantern.longitude ? (
                            <p>
                              {t('map.coordinates')}: {lantern.latitude.toFixed(6)}, {lantern.longitude.toFixed(6)}
                              {hasPendingUpdate && (
                                <span className="ml-1 text-blue-600 font-medium">
                                  ({t('map.updated')})
                                </span>
                              )}
                            </p>
                          ) : (
                            <div className="flex items-center justify-between">
                              <p className="text-red-500">{t('map.noCoordinates')}</p>
                              {isEditMode && (
                                <button 
                                  className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  onClick={() => handleStartPlacingLantern(lantern.id)}
                                >
                                  {t('map.addToMap')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('map.noLanterns')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('map.noLanternsDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeletePark}
          title={t('common.confirmDelete')}
          message={t('parks.confirmDelete')}
          type="danger"
          isLoading={deleteParkMutation.isPending}
        />
      )}
    </div>
  );
};

export default ParkMap; 