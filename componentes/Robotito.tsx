'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// El barquero, en chiquito y de peluche. Cuerpo de fieltro, visor grande, mechon violeta
// y auriculares. Todavia no contesta: eso es la proxima etapa. Por ahora esta, te mira,
// y avisa que lo estan armando.
//
// La cara se dibuja en un canvas y se pega como textura en el visor. Es mucho mas barato
// que modelar ojos en 3D y permite cambiarle la expresion cuando queramos.

const PELUCHE = 0xd3cec6
const VIOLETA = 0x7c5cf5
const VISOR = '#0a0a12'
const BRILLO = '#e9e9ff'

type Cara = 'feliz' | 'atento' | 'cerrado'

function dibujarCara(ctx: CanvasRenderingContext2D, cara: Cara) {
  const { width: w, height: h } = ctx.canvas
  ctx.clearRect(0, 0, w, h)

  // el visor: un rectangulo con las esquinas bien redondeadas
  ctx.fillStyle = VISOR
  ctx.beginPath()
  ctx.roundRect(w * 0.06, h * 0.1, w * 0.88, h * 0.8, w * 0.3)
  ctx.fill()

  ctx.strokeStyle = BRILLO
  ctx.fillStyle = BRILLO
  ctx.shadowColor = BRILLO
  ctx.shadowBlur = w * 0.06
  ctx.lineCap = 'round'

  const ojoY = h * 0.5
  const sep = w * 0.2

  for (const lado of [-1, 1]) {
    const x = w / 2 + lado * sep
    if (cara === 'feliz') {
      // el arco de ojo contento, que es el que tiene casi siempre
      ctx.lineWidth = w * 0.055
      ctx.beginPath()
      ctx.arc(x, ojoY + h * 0.05, w * 0.115, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    } else if (cara === 'atento') {
      ctx.beginPath()
      ctx.ellipse(x, ojoY, w * 0.062, w * 0.085, 0, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.lineWidth = w * 0.05
      ctx.beginPath()
      ctx.moveTo(x - w * 0.1, ojoY)
      ctx.lineTo(x + w * 0.1, ojoY)
      ctx.stroke()
    }
  }
  ctx.shadowBlur = 0
}

// Un ruidito para que el material parezca tela y no plastico.
function texturaFieltro() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 135
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 4)
  return t
}

export function Robotito() {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const [hablando, setHablando] = useState(false)
  const saludar = useRef(0)

  useEffect(() => {
    const canvas = lienzo.current
    if (!canvas) return

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const escena = new THREE.Scene()
    const camara = new THREE.PerspectiveCamera(30, 190 / 215, 0.1, 100)
    camara.position.set(0, -0.15, 8.6)

    const render = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    render.setSize(190, 215, false)

    escena.add(new THREE.AmbientLight(0xffffff, 2.1))
    const principal = new THREE.DirectionalLight(0xffffff, 2.4)
    principal.position.set(2.5, 3.5, 4)
    escena.add(principal)
    const relleno = new THREE.PointLight(VIOLETA, 18, 14)
    relleno.position.set(-2.5, 0.5, -1.5)
    escena.add(relleno)

    const fieltro = texturaFieltro()
    const cuerpoMat = new THREE.MeshStandardMaterial({
      color: PELUCHE, roughness: 1, metalness: 0, bumpMap: fieltro, bumpScale: 1.6,
    })
    const violetaMat = new THREE.MeshStandardMaterial({
      color: VIOLETA, roughness: 0.85, metalness: 0, bumpMap: fieltro, bumpScale: 0.8,
    })
    const negroMat = new THREE.MeshStandardMaterial({ color: 0x14121f, roughness: 0.6 })

    const robot = new THREE.Group()
    robot.position.y = -0.1
    escena.add(robot)

    // --- cuerpo: chiquito, la cabeza es la que manda
    const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(1.28, 1.02, 0.95, 5, 0.42), cuerpoMat)
    cuerpo.position.y = -0.92
    robot.add(cuerpo)

    // el parchecito del pecho
    const parche = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.3, 0.06, 4, 0.09), violetaMat)
    parche.position.set(0, -0.88, 0.49)
    robot.add(parche)

    // --- cabeza
    const cabeza = new THREE.Group()
    cabeza.position.y = 0.3
    robot.add(cabeza)

    const craneo = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.5, 1.35, 6, 0.5), cuerpoMat)
    cabeza.add(craneo)

    // la cara, dibujada en un canvas
    const caraCanvas = document.createElement('canvas')
    caraCanvas.width = caraCanvas.height = 256
    const caraCtx = caraCanvas.getContext('2d')!
    dibujarCara(caraCtx, 'feliz')
    const caraTex = new THREE.CanvasTexture(caraCanvas)
    const visor = new THREE.Mesh(
      new THREE.PlaneGeometry(1.38, 1.08),
      new THREE.MeshBasicMaterial({ map: caraTex, transparent: true }),
    )
    visor.position.set(0, 0.03, 0.7)
    cabeza.add(visor)

    // --- auriculares
    for (const lado of [-1, 1]) {
      const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 24), violetaMat)
      aro.rotation.z = Math.PI / 2
      aro.position.set(lado * 0.88, 0.0, 0)
      cabeza.add(aro)
      const centro = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 20), negroMat)
      centro.rotation.z = Math.PI / 2
      centro.position.set(lado * 0.93, 0.0, 0)
      cabeza.add(centro)
    }

    // --- el mechon, tipo llamita
    const mechon = new THREE.Group()
    mechon.position.set(-0.04, 0.72, 0)
    cabeza.add(mechon)
    const llama1 = new THREE.Mesh(new THREE.ConeGeometry(0.165, 0.42, 16), violetaMat)
    llama1.position.y = 0.19
    llama1.rotation.z = -0.16
    llama1.scale.z = 0.7
    mechon.add(llama1)
    const llama2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 14), violetaMat)
    llama2.position.set(0.15, 0.1, 0.01)
    llama2.rotation.z = 0.5
    llama2.scale.z = 0.7
    mechon.add(llama2)

    // --- brazos: cortitos, con manoplas
    function brazo(lado: number) {
      const pivote = new THREE.Group()
      pivote.position.set(lado * 0.64, -0.68, 0.05)
      pivote.rotation.z = lado * -0.35
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.2, 6, 14), cuerpoMat)
      m.position.y = -0.2
      pivote.add(m)
      const mano = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 18), cuerpoMat)
      mano.position.y = -0.4
      pivote.add(mano)
      robot.add(pivote)
      return pivote
    }
    const brazoIzq = brazo(-1)
    const brazoDer = brazo(1)

    // --- patitas
    for (const lado of [-1, 1]) {
      const pie = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 18), cuerpoMat)
      pie.scale.set(1, 0.72, 1.15)
      pie.position.set(lado * 0.33, -1.52, 0.06)
      robot.add(pie)
    }

    // el mouse, de -1 a 1 sobre toda la ventana
    const mouse = { x: 0, y: 0 }
    function mover(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', mover)

    let corriendo = true
    let parpadeo = 2 + Math.random() * 3
    let caraActual: Cara = 'feliz'
    function ponerCara(c: Cara) {
      if (c === caraActual) return
      caraActual = c
      dibujarCara(caraCtx, c)
      caraTex.needsUpdate = true
    }

    const reloj = new THREE.Clock()

    function cuadro() {
      if (!corriendo) return
      requestAnimationFrame(cuadro)
      const t = reloj.getElapsedTime()
      const d = reloj.getDelta()

      // te sigue con la cabeza, sin desnucarse
      const objY = THREE.MathUtils.clamp(mouse.x * 0.75, -0.85, 0.85)
      const objX = THREE.MathUtils.clamp(mouse.y * 0.38, -0.28, 0.42)
      cabeza.rotation.y += (objY - cabeza.rotation.y) * 0.08
      cabeza.rotation.x += (objX - cabeza.rotation.x) * 0.08
      robot.rotation.y += (objY * 0.28 - robot.rotation.y) * 0.05

      if (!quieto) {
        robot.position.y = -0.1 + Math.sin(t * 1.5) * 0.06
        robot.rotation.z = Math.sin(t * 0.95) * 0.022
        brazoIzq.rotation.x = Math.sin(t * 1.5 + 1) * 0.1
        mechon.rotation.z = Math.sin(t * 2.2) * 0.1
      }

      // saluda cuando lo tocas
      if (saludar.current > 0) {
        saludar.current -= d
        brazoDer.rotation.z = -1.9 + Math.sin(t * 15) * 0.4
      } else {
        brazoDer.rotation.z += (0.35 - brazoDer.rotation.z) * 0.12
        brazoDer.rotation.x = quieto ? 0 : Math.sin(t * 1.5) * 0.1
      }

      // pestañea
      parpadeo -= d
      if (parpadeo > 0) {
        ponerCara('feliz')
      } else if (parpadeo > -0.13) {
        ponerCara('cerrado')
      } else {
        parpadeo = 2.5 + Math.random() * 3.5
      }

      render.render(escena, camara)
    }
    cuadro()

    // si la pestaña no se ve, no gastamos bateria
    function visibilidad() {
      corriendo = !document.hidden
      if (corriendo) cuadro()
    }
    document.addEventListener('visibilitychange', visibilidad)

    return () => {
      corriendo = false
      window.removeEventListener('mousemove', mover)
      document.removeEventListener('visibilitychange', visibilidad)
      escena.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose())
      })
      fieltro.dispose()
      caraTex.dispose()
      render.dispose()
    }
  }, [])

  function tocar() {
    saludar.current = 1.8
    setHablando(true)
    window.setTimeout(() => setHablando(false), 6500)
  }

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex flex-col items-end sm:bottom-4 sm:right-4">
      {hablando && (
        <div className="pointer-events-auto mb-1 max-w-[245px] rounded-2xl rounded-br-md border border-borde bg-panel px-4 py-3 text-[13px] leading-relaxed text-[#d6d2e6] shadow-xl">
          Todavía me están armando. Cuando esté listo te voy a acompañar en cada paso, no
          solo al final. Mientras tanto, lo mismo que sé lo contesto en el chat de acá abajo.
        </div>
      )}

      <button
        onClick={tocar}
        aria-label="Bot en desarrollo"
        className="pointer-events-auto flex flex-col items-center transition hover:scale-[1.04]"
      >
        <canvas ref={lienzo} width={190} height={215} className="h-[104px] w-[92px] sm:h-[150px] sm:w-[133px]" />
        <span className="-mt-2 flex items-center gap-1.5 rounded-full border border-acento/40 bg-acento/15 px-3 py-1 text-[11px] text-acentoSuave backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acentoSuave" />
          Bot en desarrollo
        </span>
      </button>
    </div>
  )
}
