'use client';

interface PaymentBadgeProps {
  payment: 'PAID' | 'PENDING' | 'OVERDUE';
}

export function PaymentBadge({ payment }: PaymentBadgeProps) {
  const colors = {
    PAID: { 
      bg: '#ECFDF3', 
      border: '#ABEFC6', 
      text: '#067647',
      dot: '#17B26A'
    },
    PENDING: { 
      bg: '#FFFAEB', 
      border: '#FEDF89', 
      text: '#B54708',
      dot: '#F79009'
    },
    OVERDUE: { 
      bg: '#FEF3F2', 
      border: '#FECDCA', 
      text: '#B42318',
      dot: '#F04438'
    },
  };

  const color = colors[payment];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide border"
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
        color: color.text
      }}
    >
      <div 
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color.dot }}
      />
      {payment}
    </div>
  );
}
