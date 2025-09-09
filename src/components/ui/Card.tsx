interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
