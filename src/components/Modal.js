import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    'full': 'max-w-none',
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className={`flex min-h-full items-center justify-center ${size === 'full' ? 'p-0' : 'p-4'}`}>
        <div 
          className={`relative w-full ${sizeClasses[size]} transform ${size === 'full' ? 'min-h-screen w-screen' : 'rounded-lg'} bg-white shadow-xl transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - only show for non-full size modals */}
          {size !== 'full' && (
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Close button for full-screen modal */}
          {/* {size === 'full' && (
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-[10000] p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 mt-16"
              title="Close"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          )} */}
          
          {/* Content */}
          <div className={size === 'full' ? '' : 'px-6 py-4'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 