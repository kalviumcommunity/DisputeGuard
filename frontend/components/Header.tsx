import CounterButton from './CounterButton';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '1rem',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <p>Static footer content</p>
      <CounterButton />
    </footer>
  );
}