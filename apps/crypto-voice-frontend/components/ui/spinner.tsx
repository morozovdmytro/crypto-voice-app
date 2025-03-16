import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

interface SpinnerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const spinnerVariants = cva('', {
  variants: {
    color: {
      key: 'border-brand--1 text-brand--1',
      dark: 'border-brand--5 text-brand--5',
      gray: 'border-gray-500 text-gray-500',
      light: 'border-gray-100 text-gray-100',
      white: 'border-white text-white',
      black: 'border-black text-black',
      yellow: 'border-brand--1 text-brand--4'
    },
    strokeWidth: {
      small: 'border-1',
      medium: 'border-2',
      large: 'border-4',
    },
    size: {
      small: 'w-4 h-4',
      medium: 'w-6 h-6',
      large: 'w-8 h-8',
    }
  },
  defaultVariants: {
    color: 'key',
    strokeWidth: 'medium',
  },
});

const Spinner = ({
  className,
  color = 'key',
  strokeWidth = 'medium',
  size = 'medium',
}: SpinnerProps & VariantProps<typeof spinnerVariants>) => {
  return (
    <div
      className={cn(
        'relative',
        spinnerVariants({ size }),
        "!border-0",
        className,
      )}
    >
      <span
        className={cn(
          'absolute inset-0 rounded-full opacity-30',
          spinnerVariants({ color, strokeWidth }),
        )}
      ></span>
      <span
        className={cn(
          'absolute inset-0 animate-spin rounded-full',
          
          spinnerVariants({ color, strokeWidth }),
        )}
        style={{ borderColor: `transparent transparent currentColor transparent` }}
      ></span>
    </div>
  );
};

export default Spinner;
