import { useState, useEffect } from 'react';
import { MdClose, MdDownload, MdPictureAsPdf, MdVideoLibrary, MdDescription, MdImage } from 'react-icons/md';

const DocumentViewer = ({ 
  isOpen, 
  onClose, 
  document, 
  onDownload,
  loading = false 
}) => {
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document) {
      setIsLoading(true);
      // If document has a fileUrl (blob URL), use it directly
      if (document.fileUrl) {
        setDocumentUrl(document.fileUrl);
        setIsLoading(false);
      } else if (document.file_path) {
        // If it's a file path, create a blob URL from fetch
        fetchDocument();
      }
    }

    return () => {
      // Cleanup blob URL when component unmounts or modal closes
      if (documentUrl && documentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [isOpen, document]);

  const fetchDocument = async () => {
    try {
      // This will be called by parent component that passes the blob URL
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading document:', error);
      setIsLoading(false);
    }
  };

  const getFileIcon = (format, type) => {
    const lowerFormat = format?.toLowerCase() || '';
    
    if (['pdf'].includes(lowerFormat) || type === 'document') {
      return <MdPictureAsPdf className="h-10 w-10 text-red-500" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(lowerFormat) || type === 'video') {
      return <MdVideoLibrary className="h-10 w-10 text-blue-500" />;
    } else if (['ppt', 'pptx'].includes(lowerFormat) || type === 'presentation') {
      return <MdDescription className="h-10 w-10 text-yellow-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(lowerFormat) || type === 'image') {
      return <MdImage className="h-10 w-10 text-green-500" />;
    } else {
      return <MdDescription className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (format) => {
    const lowerFormat = format?.toLowerCase() || '';
    if (['pdf'].includes(lowerFormat)) return 'application/pdf';
    if (['jpg', 'jpeg'].includes(lowerFormat)) return 'image/jpeg';
    if (['png'].includes(lowerFormat)) return 'image/png';
    if (['gif'].includes(lowerFormat)) return 'image/gif';
    if (['mp4'].includes(lowerFormat)) return 'video/mp4';
    if (['doc'].includes(lowerFormat)) return 'application/msword';
    if (['docx'].includes(lowerFormat)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/octet-stream';
  };

  const handleClose = () => {
    if (documentUrl && documentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(documentUrl);
    }
    setDocumentUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  const fileType = getFileType(document?.format);
  const displayUrl = documentUrl || document?.fileUrl;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-slideUp">
        {/* Modal Header */}
        <div className="bg-tracked-primary px-6 py-5 rounded-t-xl flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
              {document?.title || document?.name || 'Document Viewer'}
            </h3>
            {document && (
              <div className="text-white/90 text-sm">
                <span className="font-medium">
                  {document.format?.toUpperCase() || 'FILE'}
                </span>
                {document.size && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">Size: {formatFileSize(document.size)}</span>
                  </>
                )}
                {document.uploaded_at && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </span>
                  </>
                )}
                {document.uploadDate && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">Uploaded: {document.uploadDate}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 hover:cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content - Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-inner p-4 min-h-[500px] flex items-center justify-center">
            {(loading || isLoading) ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            ) : fileType?.startsWith('image/') ? (
              <img
                src={displayUrl}
                alt={document?.title || document?.name}
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
              />
            ) : fileType === 'application/pdf' ? (
              <iframe
                src={displayUrl}
                className="w-full h-[600px] rounded-lg border-2 border-gray-200"
                title={document?.title || document?.name}
              />
            ) : fileType?.startsWith('video/') ? (
              <video
                controls
                className="max-w-full max-h-[600px] rounded-lg shadow-lg"
                src={displayUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(fileType) ? (
              <div className="text-center">
                <div className="mb-6">
                  {getFileIcon(document?.format, document?.type)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Office Document Preview
                </h3>
                <p className="text-gray-600 mb-6">
                  This is a {document?.format?.toUpperCase()} file. To view it, please download the file and open it with Microsoft Office or a compatible application.
                </p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(document.id)}
                    className="w-full max-w-md flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <MdDownload className="h-5 w-5 mr-2" />
                    Download to View
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Supported viewers: Microsoft Office, LibreOffice, Google Docs (after download)
                </p>
              </div>
            ) : document ? (
              <div className="text-center">
                <div className="text-6xl mb-4 text-gray-400 flex justify-center">
                  {getFileIcon(document.format, document.type)}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {document.title || document.name}
                </h4>
                <p className="text-gray-600 mb-4">
                  Preview not available for this file type
                </p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(document.id)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <MdDownload className="h-5 w-5 mr-2" />
                    Download File
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        {document && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {document.description || 'No description available'}
              </div>
              <div className="flex space-x-3">
                {onDownload && (
                  <button
                    onClick={() => onDownload(document.id)}
                    className="px-6 py-2.5 bg-blue-600 hover:cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    <MdDownload className="h-5 w-5 mr-2" />
                    Download
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gray-600 hover:cursor-pointer hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
