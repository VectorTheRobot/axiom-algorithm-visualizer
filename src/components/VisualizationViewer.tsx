// src/components/VisualizationViewer.tsx
import { marked } from 'marked';
import { useRef, useMemo } from 'react';

interface VisualizationViewerProps {
    commands: any[][];
    step: number;
    activeFile?: { name: string; language: string; content: string };
}

export default function VisualizationViewer({ commands, step, activeFile }: VisualizationViewerProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const weights = useRef([1, 1, 1]); 

    const tracers = useMemo(() => {
        const state: Record<string, any> = {};
        const visibleChunks = commands.slice(0, step);

        visibleChunks.forEach(chunk => {
            chunk.forEach(cmd => {
                if (!cmd.key) return; 

                if (cmd.method === 'construct') {
                    state[cmd.key] = { title: cmd.key, type: 'unknown', data: [], log: [] };
                } 
                else if (cmd.method === 'set') {
                    // A `set` can arrive without a preceding `construct` (e.g. a tracer created
                    // after the layout delay, or a step window that starts mid-timeline), so the
                    // entry may be missing. Create it on demand instead of throwing.
                    const tracer = state[cmd.key] ?? (state[cmd.key] = { title: cmd.key, type: 'unknown', data: [], log: [] });
                    if (Array.isArray(cmd.args[0]) && Array.isArray(cmd.args[0][0])) {
                        tracer.type = 'Array2D';
                        tracer.data = cmd.args[0].map((row: any[]) => row.map((val: any) => ({ val, bg: '' })));
                    } else if (Array.isArray(cmd.args[0])) {
                        tracer.type = 'Array1D';
                        tracer.data = [cmd.args[0].map((val: any) => ({ val, bg: '' }))];
                    }
                } 
                else if (cmd.method === 'select') {
                    const [row, col] = cmd.args;
                    if (state[cmd.key]?.data?.[row]?.[col]) state[cmd.key].data[row][col].bg = '#2962ff';
                }
                else if (cmd.method === 'deselect') {
                    const [row, col] = cmd.args;
                    if (state[cmd.key]?.data?.[row]?.[col]) state[cmd.key].data[row][col].bg = '';
                }
                else if (cmd.method === 'selectRow') {
                    const [row, startCol, endCol] = cmd.args;
                    if (state[cmd.key]?.data?.[row]) {
                        for (let c = startCol; c <= endCol; c++) {
                            if (state[cmd.key].data[row][c]) state[cmd.key].data[row][c].bg = '#2962ff';
                        }
                    }
                } 
                else if (cmd.method === 'deselectRow') {
                    const [row, startCol, endCol] = cmd.args;
                    if (state[cmd.key]?.data?.[row]) {
                        for (let c = startCol; c <= endCol; c++) {
                            if (state[cmd.key].data[row][c]) state[cmd.key].data[row][c].bg = '';
                        }
                    }
                }
                else if (cmd.method === 'patch') {
                    const [row, col, val] = cmd.args;
                    if (state[cmd.key]?.data?.[row]?.[col]) {
                        state[cmd.key].data[row][col].bg = '#c51162';
                        if (val !== undefined) state[cmd.key].data[row][col].val = val;
                    }
                } 
                else if (cmd.method === 'depatch') {
                    const [row, col] = cmd.args;
                    if (state[cmd.key]?.data?.[row]?.[col]) state[cmd.key].data[row][col].bg = '';
                }
                else if (cmd.method === 'println') {
                    // Same as `set`: a LogTracer may log before any `construct` is replayed.
                    const tracer = state[cmd.key] ?? (state[cmd.key] = { title: cmd.key, type: 'unknown', data: [], log: [] });
                    tracer.type = 'Log';
                    tracer.log.push(cmd.args[0]);
                }
            });
        });

        return state;
    }, [commands, step]);

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startWeights = [...weights.current];
        const gridHeight = gridRef.current?.offsetHeight || 1;
        const totalWeight = startWeights.reduce((a, b) => a + b, 0);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const deltaWeight = (deltaY / gridHeight) * totalWeight;
            const newWeights = [...startWeights];
            
            if (index === 0) {
                newWeights[0] = Math.max(0.1, startWeights[0] + deltaWeight);
                newWeights[1] = Math.max(0.1, startWeights[1] - deltaWeight);
            } else if (index === 1) {
                newWeights[1] = Math.max(0.1, startWeights[1] + deltaWeight);
                newWeights[2] = Math.max(0.1, startWeights[2] - deltaWeight);
            }

            weights.current = newWeights;

            if (gridRef.current) {
                gridRef.current.style.setProperty('--row1', `${newWeights[0]}fr`);
                gridRef.current.style.setProperty('--row2', `${newWeights[1]}fr`);
                gridRef.current.style.setProperty('--row3', `${newWeights[2]}fr`);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const renderGrid = (title: string, data: { val: number | string, bg?: string }[][], showRowHeaders = true) => (
        <div key={title} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, borderBottom: '1px solid #505050' }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#505050', color: '#fff', fontSize: '12px', flexShrink: 0 }}>{title}</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '16px' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            {showRowHeaders && <td style={{ minWidth: '28px' }}></td>}
                            {data[0]?.map((_, i) => <td key={i} style={{ minWidth: '28px', textAlign: 'center', color: '#bbbbbb', padding: '0 4px', fontSize: '12px' }}>{i}</td>)}
                        </tr>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ height: '28px' }}>
                                {showRowHeaders && <td style={{ minWidth: '28px', textAlign: 'center', color: '#bbbbbb', padding: '0 4px', fontSize: '12px' }}>{rowIndex}</td>}
                                {row.map((cell, colIndex) => <td key={colIndex} style={{ minWidth: '28px', textAlign: 'center', backgroundColor: cell.bg || '#393939', border: '1px solid #505050', padding: '0 4px', color: '#fff' }}>{cell.val}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLog = (title: string, logs: string[]) => (
        <div key={title} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ padding: '4px 8px', backgroundColor: '#505050', color: '#fff', fontSize: '12px', flexShrink: 0 }}>{title}</div>
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: '"Monaco", "Menlo", monospace', fontSize: '13px', whiteSpace: 'pre-wrap', color: '#bbbbbb' }}>
                {logs.join('\n')}
            </div>
        </div>
    );

    const activeTracers = Object.values(tracers);

    const isMarkdown = activeFile?.name.endsWith('.md') || activeFile?.language === 'markdown';

    return (
        <main style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#242424', minWidth: 0, minHeight: 0 }}>
            {isMarkdown ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ padding: '4px 8px', backgroundColor: '#505050', color: '#fff', fontSize: '12px', alignSelf: 'flex-start' }}>
                        Markdown
                    </div>
                    <style>{`
                        .markdown-body a { color: #9cdcfe; text-decoration: underline; }
                        .markdown-body img { max-width: 100%; background: #fff; display: block; margin: 16px 0; }
                        .markdown-body code { background: #393939; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                        .markdown-body h1, .markdown-body h2 { color: #fff; border-bottom: 1px solid #393939; padding-bottom: 8px; }
                    `}</style>
                    <div 
                        className="markdown-body"
                        style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '14px', lineHeight: '1.6', color: '#ccc' }}
                        dangerouslySetInnerHTML={{ __html: marked.parse(activeFile?.content || '') as string }}
                    />
                </div>
            ) : (
                <div ref={gridRef} style={{ display: 'grid', gridTemplateRows: 'var(--row1, 1fr) 1px var(--row2, 1fr) 1px var(--row3, 1fr)', flex: 1, minHeight: 0 }}>
                    {activeTracers.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            No tracers active. Click Build to compile code.
                        </div>
                    ) : (
                        activeTracers.flatMap((tracer, idx) => {
                            const elements = [];
                            if (idx > 0) {
                                elements.push(
                                    <div key={`divider-${idx}`} style={{ position: 'relative', backgroundColor: '#505050' }}>
                                        <div onMouseDown={handleMouseDown(idx - 1)} style={{ position: 'absolute', top: '-4px', bottom: '-4px', left: 0, right: 0, cursor: 'row-resize', zIndex: 50 }} />
                                    </div>
                                );
                            }
                            elements.push(
                                <div key={tracer.title} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    {tracer.type === 'Array2D' || tracer.type === 'Array1D' ? renderGrid(tracer.title, tracer.data, tracer.type === 'Array2D') : null}
                                    {tracer.type === 'Log' ? renderLog(tracer.title, tracer.log) : null}
                                </div>
                            );
                            return elements;
                        })
                    )}
                </div>
            )}
        </main>
    );
} 