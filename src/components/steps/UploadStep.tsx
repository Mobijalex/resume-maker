import { useAppContext } from "../../context/AppContext";
import FileUploadComponent from "../FileUploadComponent";
import TextInputComponent from "../TextInputComponent";

export default function UploadStep() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-10">
        <div className="mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Your Resume
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Upload your Markdown resume file or paste the content directly below.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* File Upload Section */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Option 1: Upload File
            </h3>
          </div>
          <FileUploadComponent />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 py-1 bg-white text-gray-500 text-sm font-medium rounded-full border border-gray-200 shadow-sm">
              OR
            </span>
          </div>
        </div>

        {/* Direct Text Input Section */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Option 2: Direct Input
            </h3>
          </div>
          <TextInputComponent />
        </div>

        {/* Status indicator */}
        {(state.uploadedFile || state.markdownContent.trim()) && (
          <div className="text-center mt-10 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="inline-flex items-center px-6 py-3 bg-white border border-green-200 rounded-xl shadow-sm mb-6">
              <svg
                className="w-6 h-6 text-green-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-semibold text-lg">
                {state.uploadedFile
                  ? `File uploaded: ${state.uploadedFile.name}`
                  : "Direct input content ready"}
              </span>
            </div>
            <div className="text-center">
              <p className="text-gray-700 mb-6 text-lg">
                Your content is ready to be processed. Click below to continue.
              </p>
              <button
                onClick={() => dispatch({ type: "SET_STEP", payload: "parse" })}
                className="btn-primary text-lg py-4 px-8"
                data-testid="proceed-to-parse"
              >
                Process Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
