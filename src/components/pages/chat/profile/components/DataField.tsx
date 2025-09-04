type DataFieldValue = string | number | Date | Array<string | number> | { value: number; unit: string } | null | undefined;

interface DataFieldProps {
  label: string;
  value: DataFieldValue;
  type?: 'weight' | 'time' | 'date' | 'percentage' | 'list' | 'text';
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  formatter?: (value: DataFieldValue) => string;
}

export default function DataField({
  label,
  value,
  type = 'text',
  placeholder = 'Not provided yet',
  className = '',
  labelClassName = '',
  valueClassName = '',
  formatter,
}: DataFieldProps) {
  const formatValue = (val: DataFieldValue): string => {
    if (formatter) {
      return formatter(val);
    }
    
    if (val === null || val === undefined || val === '') {
      return placeholder;
    }
    
    switch (type) {
      case 'weight':
        if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
          const weightObj = val as { value: number; unit: string };
          return `${weightObj.value} ${weightObj.unit}`;
        }
        return String(val);
        
      case 'time':
        if (typeof val === 'number') {
          if (val >= 60) {
            const hours = Math.floor(val / 60);
            const minutes = val % 60;
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
          }
          return `${val}m`;
        }
        return String(val);
        
      case 'date':
        if (val instanceof Date) {
          return val.toLocaleDateString();
        }
        if (typeof val === 'string') {
          try {
            return new Date(val).toLocaleDateString();
          } catch {
            return val;
          }
        }
        return String(val);
        
      case 'percentage':
        if (typeof val === 'number') {
          return `${val}%`;
        }
        return String(val);
        
      case 'list':
        if (Array.isArray(val)) {
          return val.length > 0 ? val.join(', ') : 'None specified';
        }
        return String(val);
        
      default:
        if (Array.isArray(val)) {
          return val.join(', ');
        }
        return String(val);
    }
  };

  const formattedValue = formatValue(value);
  const isEmpty = value === null || value === undefined || value === '' || 
    (Array.isArray(value) && value.length === 0) || 
    (typeof value === 'object' && Object.keys(value).length === 0);

  return (
    <div className={`flex justify-between items-start py-2 ${className}`}>
      <span className={`text-sm text-gray-600 ${labelClassName}`}>
        {label}:
      </span>
      <span 
        className={`text-sm font-medium text-right ml-4 ${
          isEmpty ? 'text-gray-400 italic' : 'text-gray-900'
        } ${valueClassName}`}
        style={{ maxWidth: '60%' }}
      >
        {formattedValue}
      </span>
    </div>
  );
}