import fs from 'fs';
import ts from 'typescript';
const path = 'src/components/ChosenView.tsx';
const source = fs.readFileSync(path, 'utf8');
const program = ts.createProgram([path], { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.NodeJs });
const diagnostics = ts.getPreEmitDiagnostics(program);
for (const d of diagnostics) {
  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  if (d.file && d.start !== undefined) {
    const loc = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(`${d.code} ${loc.line+1}:${loc.character+1} ${message}`);
  } else {
    console.log(`${d.code} ${message}`);
  }
}
