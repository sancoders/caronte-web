import { ImageResponse } from 'next/og'

export const alt = 'Caronte · tu app vibecodeada, a producción'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Lo que se ve cuando alguien pasa el link por WhatsApp. Es el hallazgo que Caronte
// nos marcaba a nosotros mismos: sin esto sale un recuadro vacio.
export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '90px',
          background: 'linear-gradient(135deg, #16122b 0%, #0b0a12 55%)',
          color: '#ece9f6', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, color: '#a78bfa' }}>
          Caronte
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34, fontSize: 88, lineHeight: 1.08, fontWeight: 600 }}>
          <span>Tu app vibecodeada,</span>
          <span style={{ color: '#a78bfa' }}>a producción.</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 32, color: '#b9b4cd' }}>
          Pegá el link de tu repo y te decimos qué le falta.
        </div>
      </div>
    ),
    size,
  )
}
