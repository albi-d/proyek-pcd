import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

function App() {
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY

      // hide / show navbar
      if (current > lastScrollY && current > 80) {
        setShowNavbar(false)
      } else {
        setShowNavbar(true)
      }

      // transparent → solid
      setScrolled(current > window.innerHeight - 100)

      setLastScrollY(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <div className="relative">

      {/* NAVBAR */}
      <AnimatePresence>
        {showNavbar && (
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`
        fixed top-0 left-0 w-full z-50
        ${scrolled
                ? "bg-white shadow-md text-gray-800"
                : "bg-transparent text-white"}
      `}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4 flex justify-between items-center">
              <h1 className="font-bold text-base sm:text-lg"><span className=" text-orange-300 font-extrabold">Wava</span>Crew</h1>

              <Link
                to="/tools"
                className="text-sm sm:text-base font-medium hover:opacity-80 transition bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-lg"
              >
                Mulai sekarang
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section
        className="
    fixed top-0 left-0 w-full h-screen
    bg-gambar bg-cover bg-center
    flex flex-col justify-center
    text-white
    px-5 sm:px-10 md:px-16
    z-0
  "
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-left text-shadow-soft">
          DILMAGES REMOVE <br /> BACKGROUND
        </h1>

        <span className="text-sm sm:text-base md:text-xl mb-5 max-w-xl text-left leading-relaxed text-shadow-soft">
          Implementasi teknik pengolahan citra digital
          untuk pembelajaran dan eksperimen.
        </span>

        <Link
          to="/tools"
          className="
      inline-block
      bg-blue-500 hover:bg-blue-600
      px-4 py-2.5
      sm:px-5 sm:py-3
      rounded-lg
      text-sm sm:text-base
      transition
      w-fit
    "
        >
          Mulai sekarang
        </Link>
      </section>

      {/* CONTENT */}
      <main
        className="
    relative z-10
    mt-[100vh]
    bg-langitmalam
    px-4 sm:px-6 md:px-8
    py-20 sm:py-24
    space-y-16 sm:space-y-24
  "
      >
        <div className="
  grid grid-cols-1
  md:grid-cols-3
  gap-6 md:gap-8
  max-w-7xl mx-auto
">

          {/* CARD */}
          <section
            className="
    relative
    aspect-[4/5]
    rounded-2xl
    overflow-hidden
    flex flex-col justify-end
  "
          >
            {/* BACKGROUND IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/image.png')" }}
            />

            {/* OVERLAY */}
            <div className="
    absolute inset-0
    bg-gradient-to-t
    from-black/70 via-black/40 to-black/10
  " />

            {/* CONTENT */}
            <div className="relative z-10 p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 drop-shadow-lg">
                Remove Background
              </h2>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed drop-shadow">
                Menghilangkan background pada gambar secara otomatis.
              </p>
            </div>
          </section>

          <section
            className="
    relative
    aspect-[4/5]
    rounded-2xl
    overflow-hidden
    flex flex-col justify-end
  "
          >
            {/* BACKGROUND IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/image1.png')" }}
            />

            {/* OVERLAY */}
            <div
              className="
      absolute inset-0
      bg-gradient-to-t
      from-black/70 via-black/40 to-black/10
    "
            />

            {/* CONTENT */}
            <div className="relative z-10 p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 drop-shadow-lg">
                Brightness & Contrast
              </h2>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed drop-shadow">
                Mengatur intensitas cahaya dan kontras citra digital.
              </p>
            </div>
          </section>


          <section
            className="
    relative
    aspect-[4/5]
    rounded-2xl
    overflow-hidden
    flex flex-col justify-end
  "
          >
            {/* BACKGROUND IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center grayscale"
              style={{ backgroundImage: "url('/image2.png')" }}
            />

            {/* OVERLAY */}
            <div
              className="
      absolute inset-0
      bg-gradient-to-t
      from-black/80 via-black/50 to-black/20
    "
            />

            {/* CONTENT */}
            <div className="relative z-10 p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 drop-shadow-lg">
                Segmentation Monochrome
              </h2>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed drop-shadow">
                Mengubah citra menjadi tampilan monokrom.
              </p>
            </div>
          </section>


        </div>

      </main>

      <footer className="relative bg-langitmalam border-t border-white/10">
        {/* GRADIENT GLOW */}
        <div className="
    absolute inset-x-0 top-0 h-px
    bg-gradient-to-r from-transparent via-blue-500/40 to-transparent
  " />

        <div className="
    max-w-7xl mx-auto
    px-4 sm:px-6 md:px-8
    py-12
    grid grid-cols-1 md:grid-cols-3
    gap-8
    text-gray-300
  ">
          {/* BRAND */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">
              <span className="text-orange-300">Wava</span>Crew
            </h2>
            <p className="text-sm leading-relaxed max-w-sm">
              Proyek kelompok implementasi pengolahan citra digital
              untuk pembelajaran dan eksperimen teknologi visual.
            </p>
          </div>

          {/* TEAM */}
          <div>
            <h3 className="text-white font-semibold mb-3">Tim Pengembang</h3>
            <ul className="space-y-1 text-sm">
              <li>• Ahmad Albi Syahputra Dalimunthe</li>
              <li>• Windy Amelia Pratiwi</li>
              <li>• Mhd Izwandi</li>
              <li>• Vico Delon Hutagaol</li>
            </ul>
          </div>

          {/* INFO */}
          <div>
            <h3 className="text-white font-semibold mb-3">Tentang Proyek</h3>
            <p className="text-sm leading-relaxed">
              Aplikasi ini dikembangkan sebagai bagian dari tugas
              mata kuliah <span className="text-white font-medium">Pengolahan Citra Digital</span>,
              dengan fokus pada remove background, brightness, dan segmentasi monokrom.
            </p>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="
    border-t border-white/10
    py-4 text-center
    text-xs text-gray-400
  ">
          © {new Date().getFullYear()} WavaCrew • Digital Image Processing Project
        </div>
      </footer>


    </div>
  )
}

export default App
