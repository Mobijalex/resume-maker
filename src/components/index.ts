/**
 * Central export file for all components
 * Core components are exported directly, while heavy components use lazy loading
 */

// Core components (always loaded)
export { Layout } from './Layout';
export { ProgressIndicator } from './ProgressIndicator';
export { StepRouter } from './StepRouter';
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { ErrorNotification, useErrorNotification } from './ErrorNotification';

// Input components (loaded on demand)
export { default as FileUploadComponent } from './FileUploadComponent';
export { default as TextInputComponent } from './TextInputComponent';

// Heavy components (lazy loaded)
import { lazy } from 'react';

export const TemplateSelector = lazy(() => import('./TemplateSelector'));
export const ResumePreview = lazy(() => import('./ResumePreview'));
export const DownloadComponent = lazy(() => import('./DownloadComponent'));