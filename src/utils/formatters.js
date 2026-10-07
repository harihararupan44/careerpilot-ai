export function formatCurrency(amount) {
  if (!amount) return 'Negotiable';
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }
  return amount;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return 'in ' + diffDays + ' days';
  if (diffDays === -1) return 'Yesterday';
  return Math.abs(diffDays) + ' days ago';
}

export function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case 'saved':
      return {
        label: 'Saved',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        borderColor: 'border-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-400',
        stepIndex: 0,
      };
    case 'applied':
      return {
        label: 'Applied',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-200 dark:border-blue-800',
        dotColor: 'bg-blue-500',
        stepIndex: 1,
      };
    case 'assessment':
      return {
        label: 'Assessment',
        bgColor: 'bg-purple-50 dark:bg-purple-950/40',
        textColor: 'text-purple-700 dark:text-purple-300',
        borderColor: 'border-purple-200 dark:border-purple-800',
        dotColor: 'bg-purple-500',
        stepIndex: 2,
      };
    case 'interview':
      return {
        label: 'Interview',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        textColor: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-200 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        stepIndex: 3,
      };
    case 'offer':
      return {
        label: 'Offer Received',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        stepIndex: 4,
      };
    case 'rejected':
      return {
        label: 'Rejected',
        bgColor: 'bg-rose-50 dark:bg-rose-950/40',
        textColor: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-200 dark:border-rose-800',
        dotColor: 'bg-rose-500',
        stepIndex: 4,
      };
    case 'withdrawn':
      return {
        label: 'Withdrawn',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
        borderColor: 'border-gray-300 dark:border-gray-700',
        dotColor: 'bg-gray-400',
        stepIndex: 4,
      };
    default:
      return {
        label: status || 'Unknown',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        dotColor: 'bg-slate-400',
        stepIndex: 0,
      };
  }
}

export function getFitScoreBadge(score) {
  if (score >= 85) {
    return {
      text: 'High Match',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      ringColor: '#10b981',
      bgBar: 'bg-emerald-500',
    };
  } else if (score >= 70) {
    return {
      text: 'Good Match',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      ringColor: '#3b82f6',
      bgBar: 'bg-blue-500',
    };
  } else if (score >= 50) {
    return {
      text: 'Moderate Match',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      ringColor: '#f59e0b',
      bgBar: 'bg-amber-500',
    };
  } else {
    return {
      text: 'Low Match',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-200 dark:border-rose-800',
      ringColor: '#ef4444',
      bgBar: 'bg-rose-500',
    };
  }
}
