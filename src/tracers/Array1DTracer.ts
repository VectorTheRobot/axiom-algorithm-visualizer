// src/tracers/Array1DTracer.ts
import { BaseTracer } from './BaseTracer';

export class Array1DTracer extends BaseTracer {
    private data: number[];

    constructor(key: string, initialData: number[]) {
        super(key);
        this.data = [...initialData];
        this.pushCommand('alloc', [this.data]);
    }

    // Intercept index assignment
    public set(index: number, value: number): void {
        this.data[index] = value;
        this.pushCommand('set', [index, value]);
    }

    // Common algorithmic helper
    public swap(index1: number, index2: number): void {
        const temp = this.data[index1];
        this.data[index1] = this.data[index2];
        this.data[index2] = temp;
        this.pushCommand('swap', [index1, index2]);
    }

    // Highlight pointers during traversal (e.g., two-pointer problems)
    public select(index: number): void {
        this.pushCommand('select', [index]);
    }

    public deselect(index: number): void {
        this.pushCommand('deselect', [index]);
    }
    
    public get snapshot(): number[] {
        return [...this.data];
    }
}