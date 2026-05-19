'use client';

interface MemberAvatarProps {
  initials: string;
}

export function MemberAvatar({ initials }: MemberAvatarProps) {
  return (
    <div 
      className="flex items-center justify-center flex-shrink-0 rounded-full border"
      style={{ 
        width: '40px',
        height: '40px',
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        borderWidth: '1px'
      }}
    >
      <span style={{ color: '#334155', fontSize: '16px', fontWeight: '600' }}>
        {initials}
      </span>
    </div>
  );
}
