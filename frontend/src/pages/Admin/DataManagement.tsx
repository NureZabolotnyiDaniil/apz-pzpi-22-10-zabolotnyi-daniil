import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DataManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await apiService.exportData(format);
      
      if (!response.success) {
        throw new Error(response.error || 'Export failed');
      }
      
      const dataToExport = response.data || response;
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(dataToExport, null, 2) : JSON.stringify(dataToExport)], 
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartlighting_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Дані експортовано в форматі ${format.toUpperCase()}`);
    } catch (error) {

      toast.error('Помилка експорту даних');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await apiService.exportExcel();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartlighting_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Дані експортовано в форматі Excel');
    } catch (error) {

      toast.error('Помилка експорту Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await apiService.createBackup();
      
      if (!response.success) {
        throw new Error(response.error || 'Backup failed');
      }
      
      const backupData = response.data || response;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename || `${response.name || 'smartlighting_backup'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Бекап створено: ${response.name || 'smartlighting_backup'}`);
    } catch (error) {

      toast.error('Помилка створення бекапу');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith('.json')) {
        toast.error('Будь ласка, виберіть JSON файл');
        return;
      }

      setIsImporting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiService.importData(formData);
        
        if (!response.success) {
          throw new Error(response.error || 'Import failed');
        }
        
        toast.success(response.message || 'Дані успішно імпортовано');
        
        // Refresh the page after successful import
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
  
        toast.error('Помилка імпорту даних');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('admin.dataManagement')}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          {t('admin.dataManagementDescription')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Import Data */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col min-h-[200px]">
          <div className="flex items-center mb-4">
            <ArrowUpTrayIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {t('admin.importData')}
            </h3>
          </div>
          <p className="text-gray-500 mb-4 flex-grow">
            {t('admin.importDataDescription')}
          </p>
          <button 
            onClick={handleImportData}
            disabled={isImporting}
            className="w-full inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-10"
          >
            {isImporting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <FolderOpenIcon className="h-4 w-4 mr-2" />
                {t('admin.selectFile')}
              </>
            )}
          </button>
        </div>
        
        {/* Export Data */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col min-h-[200px]">
          <div className="flex items-center mb-4">
            <ArrowDownTrayIcon className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {t('admin.exportData')}
            </h3>
          </div>
          <p className="text-gray-500 mb-4 flex-grow">
            {t('admin.exportDataDescription')}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => handleExportData('json')}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed h-10"
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('admin.exportJSON')}
                </>
              )}
            </button>
            <button 
              onClick={() => handleExportData('csv')}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed h-10"
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('admin.exportCSV')}
                </>
              )}
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed h-10"
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('admin.exportExcel')}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Create Backup */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col min-h-[200px]">
          <div className="flex items-center mb-4">
            <DocumentDuplicateIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {t('admin.backup')}
            </h3>
          </div>
          <p className="text-gray-500 mb-4 flex-grow">
            {t('admin.backupDescription')}
          </p>
          <button 
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="w-full inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed h-10"
          >
            {isCreatingBackup ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                {t('admin.createBackup')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">{t('admin.importantInformation')}</h4>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>{t('admin.exportInfo')}</li>
                <li>{t('admin.backupInfo')}</li>
                <li>{t('admin.importInfo')}</li>
                <li>{t('admin.backupRecommendation')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement; 