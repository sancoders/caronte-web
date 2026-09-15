'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// El barquero, en chiquito. Todavia no contesta: eso es la proxima etapa. Por ahora
// esta, te mira, y avisa que lo estan armando. Cuando este, es el mismo copiloto que
// ya contesta en el chat, pero acompañandote en cada pantalla.

const VIOLETA = 0x8b5cf6
const CLARO = 0xd9d5ea
const OSCURO = 0x1b1830

export function Robotito() {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const [hablando, setHablando] = useState(false)
  const saludar = useRef(0)

  useEffect(() => {
    const canvas = lienzo.current
    if (!canvas) return

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const escena = new THREE.Scene()
    const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camara.position.set(0, 0.15, 6.2)

    const render = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    render.setSize(170, 200, false)

    escena.add(new THREE.AmbientLight(0xffffff, 1.5))
    const luz = new THREE.DirectionalLight(0xffffff, 2.2)
    luz.position.set(2, 3, 4)
    escena.add(luz)
    const contraluz = new THREE.PointLight(VIOLETA, 12, 12)
    contraluz.position.set(-2, 1, -2)
    escena.add(contraluz)

    const cuerpoMat = new THREE.MeshStandardMaterial({ color: CLARO, roughness: 0.45, metalness: 0.15 })
    const acentoMat = new THREE.MeshStandardMaterial({ color: VIOLETA, roughness: 0.35, metalness: 0.3 })
    const visorMat = new THREE.MeshStandardMaterial({ color: OSCURO, roughness: 0.2, metalness: 0.5 })
    const ojoMat = new THREE.MeshBasicMaterial({ color: 0xc4b5fd })

    const robot = new THREE.Group()
    escena.add(robot)

    // torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.6), cuerpoMat)
    torso.position.y = -0.15
    robot.add(torso)

    const pecho = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.05), acentoMat)
    pecho.position.set(0, 0.05, 0.31)
    robot.add(pecho)

    // cabeza, con su propio grupo para que pueda girar sola
    const cabeza = new THREE.Group()
    cabeza.position.y = 0.72
    robot.add(cabeza)

    const craneo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.82, 0.78), cuerpoMat)
    cabeza.add(craneo)

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.4, 0.06), visorMat)
    visor.position.set(0, 0.03, 0.4)
    cabeza.add(visor)

    const ojoIzq = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), ojoMat)
    ojoIzq.position.set(-0.17, 0.03, 0.44)
    cabeza.add(ojoIzq)
    const ojoDer = ojoIzq.clone()
    ojoDer.position.x = 0.17
    cabeza.add(ojoDer)

    const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3), cuerpoMat)
    palo.position.y = 0.55
    cabeza.add(palo)
    const foquito = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), acentoMat)
    foquito.position.y = 0.72
    cabeza.add(foquito)

    // brazos: el pivote va en el hombro, si no el brazo gira desde el centro
    function brazo(lado: number) {
      const pivote = new THREE.Group()
      pivote.position.set(lado * 0.62, 0.22, 0)
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.42, 4, 12), cuerpoMat)
      m.position.y = -0.3
      pivote.add(m)
      const mano = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), acentoMat)
      mano.position.y = -0.58
      pivote.add(mano)
      robot.add(pivote)
      return pivote
    }
    const brazoIzq = brazo(-1)
    const brazoDer = brazo(1)

    // patas colgando: flota, asi no hace falta animar una caminata
    function pata(lado: number) {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.3, 4, 12), cuerpoMat)
      m.position.set(lado * 0.27, -0.95, 0)
      robot.add(m)
      const pie = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), acentoMat)
      pie.position.set(lado * 0.27, -1.2, 0.03)
      robot.add(pie)
    }
    pata(-1)
    pata(1)

    // el mouse, en coordenadas de -1 a 1 sobre toda la ventana
    const mouse = { x: 0, y: 0 }
    function mover(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', mover)

    let corriendo = true
    let parpadeo = 2 + Math.random() * 3
    const reloj = new THREE.Clock()

    function cuadro() {
      if (!corriendo) return
      requestAnimationFrame(cuadro)
      const t = reloj.getElapsedTime()
      const d = reloj.getDelta()

      // te sigue con la cabeza, sin desnucarse
      const objetivoY = THREE.MathUtils.clamp(mouse.x * 0.7, -0.8, 0.8)
      const objetivoX = THREE.MathUtils.clamp(mouse.y * 0.4, -0.3, 0.45)
      cabeza.rotation.y += (objetivoY - cabeza.rotation.y) * 0.08
      cabeza.rotation.x += (objetivoX - cabeza.rotation.x) * 0.08
      robot.rotation.y += (objetivoY * 0.3 - robot.rotation.y) * 0.05

      if (!quieto) {
        robot.position.y = Math.sin(t * 1.4) * 0.07          // flota
        robot.rotation.z = Math.sin(t * 0.9) * 0.025
        brazoIzq.rotation.x = Math.sin(t * 1.4 + 1) * 0.12
      }

      // saluda cuando lo tocas
      if (saludar.current > 0) {
        saludar.current -= d
        brazoDer.rotation.z = -2.1 + Math.sin(t * 14) * 0.45
        foquito.scale.setScalar(1 + Math.sin(t * 10) * 0.18)
      } else {
        brazoDer.rotation.z += (0 - brazoDer.rotation.z) * 0.12
        brazoDer.rotation.x = quieto ? 0 : Math.sin(t * 1.4) * 0.12
        foquito.scale.setScalar(1)
      }

      // pestañea
      parpadeo -= d
      if (parpadeo < 0) {
        const cerrado = parpadeo > -0.12
        ojoIzq.scale.y = cerrado ? 0.1 : 1
        ojoDer.scale.y = cerrado ? 0.1 : 1
        if (parpadeo < -0.12) parpadeo = 2.5 + Math.random() * 3.5
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
      render.dispose()
    }
  }, [])

  function tocar() {
    saludar.current = 1.6
    setHablando(true)
    window.setTimeout(() => setHablando(false), 6000)
  }

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex flex-col items-end sm:bottom-4 sm:right-4">
      {hablando && (
        <div className="pointer-events-auto mb-2 max-w-[240px] rounded-2xl rounded-br-md border border-borde bg-panel px-4 py-3 text-[13px] leading-relaxed text-[#d6d2e6] shadow-xl">
          Todavía me están armando. Cuando esté listo te voy a acompañar en cada paso, no
          solo al final. Mientras tanto, lo mismo que sé lo contesto en el chat de acá abajo.
        </div>
      )}

      <button
        onClick={tocar}
        aria-label="Bot en desarrollo"
        className="pointer-events-auto flex flex-col items-center transition hover:scale-[1.03]"
      >
        <canvas ref={lienzo} width={170} height={200} className="h-[100px] w-[85px] sm:h-[150px] sm:w-[128px]" />
        <span className="-mt-1 flex items-center gap-1.5 rounded-full border border-acento/40 bg-acento/15 px-3 py-1 text-[11px] text-acentoSuave backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acentoSuave" />
          Bot en desarrollo
        </span>
      </button>
    </div>
  )
}
