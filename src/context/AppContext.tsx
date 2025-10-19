import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { AppState, AppAction, AppContextType } from "../types";

// Initial state
const initialState: AppState = {
  currentStep: "upload",
  resumeData: null,
  selectedTemplate: "",
  errors: [],
  isProcessing: false,
  previewContent: "",
  uploadedFile: null,
  markdownContent: "",
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "SET_RESUME_DATA":
      return {
        ...state,
        resumeData: action.payload,
      };

    case "SET_TEMPLATE":
      return {
        ...state,
        selectedTemplate: action.payload,
      };

    case "ADD_ERROR":
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: [],
      };

    case "SET_PROCESSING":
      return {
        ...state,
        isProcessing: action.payload,
      };

    case "SET_PREVIEW_CONTENT":
      return {
        ...state,
        previewContent: action.payload,
      };

    case "SET_UPLOADED_FILE":
      return {
        ...state,
        uploadedFile: action.payload,
      };

    case "SET_MARKDOWN_CONTENT":
      return {
        ...state,
        markdownContent: action.payload,
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
