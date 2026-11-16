// src/components/SupportModal.tsx
import { useState } from 'react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CRYPTO_ADDRESSES = [
    { label: 'Bitcoin (BTC)', address: 'bc1q4uuch0r8x833fzz3rs960ckpu49g65v6tkmh9n' },
    { label: 'Ethereum (ETH)', address: '0xffB1029A8E474FB3620B5703585ce6641ff25559' },
    { label: 'Solana (SOL)', address: '6qaFLzxAbegRAxp285USepLapSQsXqecUd9iP7BgMAxy' }
];

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const [copiedCoin, setCopiedCoin] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCopy = (label: string, address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedCoin(label);
        setTimeout(() => setCopiedCoin(null), 2000);
    };

    const cardStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: '#2d2d2d',
        border: '1px solid #505050',
        borderRadius: '4px',
        color: '#e0e0e0',
        textDecoration: 'none',
        fontSize: '13px',
        cursor: 'pointer'
    };

    return (
        <div 
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{ width: '440px', maxWidth: '92vw', backgroundColor: '#242424', border: '1px solid #505050', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', color: '#ccc' }}
            >
                {/* Modal Header */}
                <div style={{ padding: '14px 18px', backgroundColor: '#393939', borderBottom: '1px solid #505050', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ea4aaa', fontSize: '16px' }}>♥</span> Support the Project
                    </span>
                    <span onClick={onClose} style={{ cursor: 'pointer', fontSize: '16px', color: '#999', lineHeight: 1 }}>✕</span>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#bbb' }}>
                        Help keep this open-source visualizer fast, free, and actively maintained. Choose your preferred way to support below:
                    </p>

                    {/* Direct Platforms Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <a href="https://github.com/sponsors/jessebaugh" target="_blank" rel="noopener noreferrer" style={cardStyle}>
                            <span>🐙 GitHub Sponsors</span>
                            <span style={{ color: '#888' }}>↗</span>
                        </a>
                        <a href="https://ko-fi.com/axiomalgorithmvisualizer" target="_blank" rel="noopener noreferrer" style={cardStyle}>
                            <span>☕ Ko-fi</span>
                            <span style={{ color: '#888' }}>↗</span>
                        </a>
                        <a href="https://www.paypal.com/donate/?hosted_button_id=MM2CMME59NZWS" target="_blank" rel="noopener noreferrer" style={cardStyle}>
                            <span>💳 PayPal</span>
                            <span style={{ color: '#888' }}>↗</span>
                        </a>
                        {/* Stripe Payment Links natively render Apple Pay & Google Pay in the browser */}
                        <a href="https://buy.stripe.com/aFabJ17IeePmeVbfX88Zq00" target="_blank" rel="noopener noreferrer" style={cardStyle}>
                            <span> / G Pay</span>
                            <span style={{ color: '#888' }}>↗</span>
                        </a>
                    </div>

                    {/* Crypto Section */}
                    <div style={{ borderTop: '1px solid #393939', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Cryptocurrency (Click to Copy)
                        </span>
                        {CRYPTO_ADDRESSES.map(({ label, address }) => (
                            <div 
                                key={label} 
                                onClick={() => handleCopy(label, address)}
                                style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{label}</span>
                                    <span style={{ color: copiedCoin === label ? '#4c1' : '#9cdcfe', fontSize: '11px' }}>
                                        {copiedCoin === label ? '✓ Copied!' : '📋 Copy'}
                                    </span>
                                </div>
                                <code style={{ fontSize: '11px', color: '#888', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {address}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}