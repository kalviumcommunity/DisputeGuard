// Outside app/layout.tsx so the root theme cookie cannot make this control dynamic.
export default function RenderingControl() {
  return <main><h1>DisputeGuard static rendering control</h1><p>This build-time page does not read request cookies or headers.</p></main>;
}
