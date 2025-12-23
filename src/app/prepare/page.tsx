"use client";

export default function SimplePrepare() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>STORZY Preparation Pipeline</h1>
      <p>Initializing secure environment...</p>
      <button onClick={() => window.location.href = '/'}>Go Home</button>
    </div>
  );
}
