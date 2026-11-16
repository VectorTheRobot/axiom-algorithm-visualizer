interface HeaderProps {
    onOpenSupport?: () => void;
}

export default function Header({ onOpenSupport }: HeaderProps) {
    return (
        <header style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #505050', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}>Algorithm Visualizer ▾</span>
                <span style={{ cursor: 'pointer' }}>Sign In</span>
                <span style={{ cursor: 'pointer', color: '#fff' }}>JavaScript</span>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <a
                    href="/support"
                    onClick={(e) => {
                    e.preventDefault();
                    onOpenSupport?.();
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #505050',
                        borderRadius: '3px',
                        color: '#e0e0e0',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <span style={{ color: '#ea4aaa', fontSize: '13px', lineHeight: 1 }}>♥</span>
                    <span>Donate</span>
                </a>
                <span style={{ cursor: 'pointer' }}>Fork</span>
                <span style={{ cursor: 'pointer' }}>Share</span>
                <span style={{ cursor: 'pointer' }}>Fullscreen</span>
            </div>
        </header>
    );
}