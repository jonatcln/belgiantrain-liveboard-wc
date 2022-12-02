import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
    input: './belgiantrain-liveboard.js',
    output: {
        file: './dist/belgiantrain-liveboard.min.js',
        format: 'es',
        sourcemap: false,
    },
    plugins: [resolve(), terser({ format: { comments: false } })],
};
