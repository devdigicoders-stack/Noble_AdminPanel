import Swal from 'sweetalert2';

// Custom themed toast configuration
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0A1931',
  color: '#FFFFFF',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Helper for luxury confirm modal (used in logout, delete, etc.)
export const confirmModal = async ({ title, text, confirmButtonText = 'Yes, Proceed', cancelButtonText = 'Cancel', icon = 'warning' }) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#C5A059',
    cancelButtonColor: '#e11d48',
    confirmButtonText,
    cancelButtonText,
    background: '#0A1931',
    color: '#FFFFFF',
    customClass: {
      popup: 'rounded-3xl border border-slate-700 shadow-2xl',
      confirmButton: 'px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-[#0A1931] !bg-[#DFBF7A]',
      cancelButton: 'px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-white !bg-rose-600'
    }
  });
};

export default Swal;
