// src/components/Navigator.tsx
import { useState, useMemo } from 'react';

interface NavigatorProps {
    onSelectAlgorithm: (files: Record<string, string>, contributors?: string[]) => void;
}

// Automatically import all files from src/algorithms/[category]/[algorithm]/[file]
const algorithmModules = import.meta.glob<string>(
    '../algorithms/*/*/*', 
    { eager: true, query: '?raw', import: 'default' }
);

export default function Navigator({ onSelectAlgorithm }: NavigatorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const [selectedAlgoId, setSelectedAlgoId] = useState<string>('backtracking-knights-tour');

    // Dynamically build the registry from disk structure (or use fallback if empty)
    const algorithmRegistry = useMemo(() => {
        const entries = Object.entries(algorithmModules);

        const registry: Record<string, { title: string; category: string; contributors: string[]; files: Record<string, string> }> = {};

        entries.forEach(([path, content]) => {
            const parts = path.split('/');
            if (parts.length < 4) return;
            
            const categoryDir = parts[parts.length - 3];
            const algoDir = parts[parts.length - 2];
            const fileName = parts[parts.length - 1];

            // Fixed the extra closing parenthesis here
            const defaultCategory = categoryDir.charAt(0).toUpperCase() + categoryDir.slice(1).replace(/-/g, ' ');
            const algoId = `${categoryDir}-${algoDir}`;

            if (!registry[algoId]) {
                registry[algoId] = {
                    title: algoDir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    category: defaultCategory,
                    contributors: [],
                    files: {}
                };
            }

            if (fileName === 'info.json' && typeof content === 'string') {
                try {
                    const info = JSON.parse(content);
                    if (info.title) registry[algoId].title = info.title;
                    if (info.category) registry[algoId].category = info.category;
                    if (Array.isArray(info.contributors)) registry[algoId].contributors = info.contributors;
                } catch {
                    // Ignore malformed JSON and keep folder-derived title
                }
            } else {
                // Only add actual code/markdown files to editor tabs (skip info.json)
                registry[algoId].files[fileName] = typeof content === 'string' ? content : '';
            }
        });

        return registry;
    }, []);

    const categories = useMemo(() => {
        const groups: Record<string, Array<{ id: string; title: string }>> = {};
        
        Object.entries(algorithmRegistry).forEach(([id, algo]) => {
            if (algo.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                if (!groups[algo.category]) groups[algo.category] = [];
                groups[algo.category].push({ id, title: algo.title });
            }
        });

        return groups;
    }, [searchQuery, algorithmRegistry]);

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const clipStyle: React.CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', minWidth: 0 };

    return (
        <nav style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', borderRight: '1px solid #505050', minWidth: 0, minHeight: 0, height: '100%', fontSize: '13px' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #505050', flexShrink: 0 }}>
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#2d2d2d', border: '1px solid #505050', color: '#fff', padding: '6px 8px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box' }}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                {Object.entries(categories).map(([category, algos]) => {
                    const isCollapsed = collapsedCategories[category];
                    return (
                        <div key={category} style={{ borderBottom: '1px solid #333' }}>
                            <div 
                                onClick={() => toggleCategory(category)}
                                style={{ padding: '8px 12px', backgroundColor: '#252526', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
                            >
                                <span style={{ fontWeight: 'bold', ...clipStyle }}>{category}</span>
                                <span>{isCollapsed ? '▸' : '▾'}</span>
                            </div>

                            {!isCollapsed && algos.map(algo => {
                                const isSelected = selectedAlgoId === algo.id;
                                return (
                                    <div 
                                        key={algo.id}
                                        onClick={() => {
                                            setSelectedAlgoId(algo.id);
                                            onSelectAlgorithm(algorithmRegistry[algo.id].files, algorithmRegistry[algo.id].contributors);
                                        }}
                                        style={{ 
                                            padding: '8px 12px 8px 24px', 
                                            cursor: 'pointer', 
                                            backgroundColor: isSelected ? '#37373d' : 'transparent',
                                            color: isSelected ? '#fff' : '#9cdcfe',
                                            ...clipStyle 
                                        }}
                                    >
                                        {algo.title}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #505050', backgroundColor: '#252526', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, fontSize: '12px' }}>
                <span style={{ cursor: 'pointer', color: '#bbbbbb' }}>📄 Scratch Paper</span>
                <span style={{ cursor: 'pointer', color: '#bbbbbb' }}>➕ New ...</span>
                <span style={{ cursor: 'pointer', color: '#bbbbbb' }}>📖 API Reference</span>
            </div>
        </nav>
    );
}