/**
 * Application state management interfaces
 */

import type { ResumeData } from './resume';
import type { AppError } from './errors';

export type AppStep = 'upload' | 'parse' | 'template' | 'preview' | 'download';

export interface AppState {
    currentStep: AppStep;
    resumeData: ResumeData | null;
    selectedTemplate: string;
    errors: AppError[];
    isProcessing: boolean;
    previewContent: string;
    uploadedFile: File | null;
    markdownContent: string;
}

export type AppAction =
    | { type: 'SET_STEP'; payload: AppStep }
    | { type: 'SET_RESUME_DATA'; payload: ResumeData }
    | { type: 'SET_TEMPLATE'; payload: string }
    | { type: 'ADD_ERROR'; payload: AppError }
    | { type: 'CLEAR_ERRORS' }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_PREVIEW_CONTENT'; payload: string }
    | { type: 'SET_UPLOADED_FILE'; payload: File | null }
    | { type: 'SET_MARKDOWN_CONTENT'; payload: string }
    | { type: 'RESET_STATE' };

export interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}