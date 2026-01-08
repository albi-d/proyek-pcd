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
              <h1 className="font-bold text-base sm:text-lg">MyWebsite</h1>

              <Link
                to="/tools"
                className="text-sm sm:text-base font-medium hover:opacity-80 transition"
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
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-left">
          DILMAGES REMOVE <br /> BACKGROUND
        </h1>

        <span className="text-sm sm:text-base md:text-xl mb-5 max-w-xl text-left leading-relaxed">
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
      w-2/4
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
          <section className="
    aspect-[4/5]
    border rounded-2xl
    p-6
    bg-white/5 backdrop-blur-sm
    flex flex-col justify-between
  ">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Remove Background
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Menghilangkan background pada gambar secara otomatis.
              </p>
            </div>
          </section>

          <section className="
    aspect-[4/5]
    border rounded-2xl
    p-6
    bg-white/5 backdrop-blur-sm
    flex flex-col justify-between
  ">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Brightness & Contrast
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Mengatur intensitas cahaya dan kontras citra digital.
              </p>
            </div>
          </section>

          <section className="
    aspect-[4/5]
    border rounded-2xl
    p-6
    bg-white/5 backdrop-blur-sm
    flex flex-col justify-between
  ">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Segmentation Monochrome
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Mengubah citra menjadi tampilan monokrom.
              </p>
            </div>
          </section>

        </div>

      </main>

    </div>
  )
}

export default App
