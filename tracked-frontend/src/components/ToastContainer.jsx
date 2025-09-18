import Toast from './Toast';

const ToastContainer = ({ toasts, onHideToast }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          duration={toast.duration}
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;