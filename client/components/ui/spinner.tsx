import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        default: "h-8 w-8 border-4",
        sm: "h-4 w-4 border-2",
        lg: "h-12 w-12 border-[6px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export function Spinner({ className, size }: SpinnerProps) {
  return (
    <div className={cn(spinnerVariants({ size }), className)} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  )
} 