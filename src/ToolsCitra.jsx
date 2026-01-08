import { useRef, useState, useEffect } from "react";
import { BiCode, BiDownload, BiExport, BiMinus, BiPlus, BiReset, BiRotateLeft, BiSolidImageAdd, BiX } from "react-icons/bi";
import { PiFlipHorizontal, PiFlipVertical } from "react-icons/pi";
import { RiToolsLine } from "react-icons/ri";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation"
import { MdCompare } from "react-icons/md";


export default function ToolsCitra() {
    const canvasRef = useRef(null)
    const [hasImage, setHasImage] = useState(false)

    const [originalImg, setOriginalImg] = useState(null)
    const [rotation, setRotation] = useState(0)
    const [flipX, setFlipX] = useState(false)
    const [flipY, setFlipY] = useState(false)

    const [isDragging, setIsDragging] = useState(false)

    const [splitChannels, setSplitChannels] = useState([]);

    const segmenterRef = useRef(null)
    const containInfoRef = useRef(null)

    const [zoom, setZoom] = useState(1)
    const [showZoomMenu, setShowZoomMenu] = useState(false)

    const activeImageRef = useRef(null)
    const originalCanvasRef = useRef(null)

    const [brightness, setBrightness] = useState(0)
    const [binary, setBinary] = useState(128)

    const originalImageDataRef = useRef(null)
    const processedImageDataRef = useRef(null)
    const baseImageDataRef = useRef(null)
    const zoomPercent = Math.round(zoom * 100)
    const [showSidebar, setShowSidebar] = useState(false)


    const loadImage = (file) => {
        if (!file || !file.type.startsWith("image/")) return

        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
            setOriginalImg(img)
            setRotation(0)
            setFlipX(false)
            setFlipY(false)
            setHasImage(true)

            // ORIGINAL (COMPARE)
            const oCanvas = document.createElement("canvas")
            oCanvas.width = img.width
            oCanvas.height = img.height
            oCanvas.getContext("2d").drawImage(img, 0, 0)
            originalCanvasRef.current = oCanvas

            // ACTIVE (EDITING)
            const aCanvas = document.createElement("canvas")
            aCanvas.width = img.width
            aCanvas.height = img.height
            const ctx = aCanvas.getContext("2d")
            ctx.drawImage(img, 0, 0)

            activeImageRef.current = aCanvas   // 🔥 INI KUNCI

            originalImageDataRef.current = ctx.getImageData(0, 0, aCanvas.width, aCanvas.height)
            processedImageDataRef.current = originalImageDataRef.current

            baseImageDataRef.current = ctx.getImageData(0, 0, aCanvas.width, aCanvas.height) // ← ini tambahan
            drawImage(aCanvas, 0, false, false, zoom)
        }


    }


    const handleImage = (e) => {
        const file = e.target.files[0]
        loadImage(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        loadImage(file)
    }

    const drawImage = (img, rotateDeg, flipX, flipY, zoomLevel = 1) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const container = canvas.parentElement
        const cw = container.clientWidth
        const ch = container.clientHeight

        canvas.width = cw
        canvas.height = ch

        ctx.clearRect(0, 0, cw, ch)
        ctx.save()

        // ⬇️ CENTER
        ctx.translate(cw / 2, ch / 2)

        // ⬇️ ZOOM
        ctx.scale(zoomLevel, zoomLevel)

        // ⬇️ ROTATE
        ctx.rotate((rotateDeg * Math.PI) / 180)

        // ⬇️ FLIP
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)

        // ===== OBJECT CONTAIN =====
        const rotated = rotateDeg % 180 !== 0
        const areaW = rotated ? ch : cw
        const areaH = rotated ? cw : ch

        const imgRatio = img.width / img.height
        const areaRatio = areaW / areaH

        let drawWidth, drawHeight

        if (imgRatio > areaRatio) {
            drawWidth = areaW
            drawHeight = areaW / imgRatio
        } else {
            drawHeight = areaH
            drawWidth = areaH * imgRatio
        }

        ctx.drawImage(
            img,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        )

        ctx.restore()

        containInfoRef.current = {
            drawWidth: drawWidth * zoomLevel,
            drawHeight: drawHeight * zoomLevel,
            offsetX: (canvas.width - drawWidth * zoomLevel) / 2,
            offsetY: (canvas.height - drawHeight * zoomLevel) / 2,
        }

        originalImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
        processedImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    const handleWheel = (e) => {
        e.preventDefault()

        let z = zoom
        z += e.deltaY < 0 ? 0.1 : -0.1
        z = Math.max(0.2, Math.min(z, 5))

        setZoom(z)

        // ✅ BENAR → render GAMBAR AKTIF
        drawImage(
            activeImageRef.current,
            rotation,
            flipX,
            flipY,
            z
        )
    }

    const rotate90 = () => {
        if (!originalImg) return
        const newRotation = (rotation + 90) % 360
        setRotation(newRotation)
        drawImage(activeImageRef.current, newRotation, flipX, flipY)
    }

    const flipHorizontal = () => {
        if (!originalImg) return
        const newFlipX = !flipX
        setFlipX(newFlipX)
        drawImage(activeImageRef.current, rotation, newFlipX, flipY)
    }

    const flipVertical = () => {
        if (!originalImg) return
        const newFlipY = !flipY
        setFlipY(newFlipY)
        drawImage(activeImageRef.current, rotation, flipX, newFlipY)
    }

    const resetImage = () => {
        if (!originalCanvasRef.current) return;

        setRotation(0);
        setFlipX(false);
        setFlipY(false);
        setZoom(1);
        setSplitChannels([]);
        setBrightness(0)
        setBinary(128)

        // 🔥 RESET SUMBER AKTIF
        activeImageRef.current = originalCanvasRef.current;

        renderActiveImage(); // pakai activeImageRef
    };

    const getNearestZoomPreset = (zoom) => {
        const percent = Math.round(zoom * 100)
        return zoomPresets.reduce((prev, curr) =>
            Math.abs(curr - percent) < Math.abs(prev - percent)
                ? curr
                : prev
        )
    }

    const applyZoom = (z) => {
        const clamped = Math.min(5, Math.max(0.1, z))
        setZoom(clamped)
    }

    useEffect(() => {
        renderActiveImage(zoom)
    }, [zoom])

    const zoomOut = () => applyZoom(zoom - 0.1)
    const zoomIn = () => applyZoom(zoom + 0.1)
    const zoomPresets = [25, 50, 75, 100, 150, 200, 300]


    useEffect(() => {
        const segmenter = new SelfieSegmentation({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        })

        segmenter.setOptions({
            modelSelection: 1
        })

        segmenter.onResults(onSegmentationResult)
        segmenterRef.current = segmenter
    }, [])

    // const onSegmentationResult = (results) => {
    //     if (!containInfoRef.current) return

    //     const canvas = canvasRef.current
    //     const ctx = canvas.getContext("2d")

    //     const { drawWidth, drawHeight, offsetX, offsetY } =
    //         containInfoRef.current

    //     ctx.clearRect(0, 0, canvas.width, canvas.height)

    //     ctx.drawImage(
    //         results.segmentationMask,
    //         offsetX,
    //         offsetY,
    //         drawWidth,
    //         drawHeight
    //     )

    //     ctx.globalCompositeOperation = "source-in"

    //     ctx.drawImage(
    //         results.image,
    //         offsetX,
    //         offsetY,
    //         drawWidth,
    //         drawHeight
    //     )

    //     ctx.globalCompositeOperation = "source-over"
    // }

    const onSegmentationResult = (results) => {
        if (!containInfoRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const { drawWidth, drawHeight, offsetX, offsetY } =
            containInfoRef.current

        // 🔹 Offscreen canvas = ukuran CANVAS
        const off = document.createElement("canvas")
        off.width = canvas.width
        off.height = canvas.height

        const offCtx = off.getContext("2d")

        // Hitam semua (background)
        offCtx.fillStyle = "black"
        offCtx.fillRect(0, 0, off.width, off.height)

        // Gambar segmentation mask di POSISI YANG BENAR
        offCtx.drawImage(
            results.segmentationMask,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight
        )

        const maskData = offCtx.getImageData(0, 0, off.width, off.height)

        // 🔹 Convert ke binary mask
        for (let i = 0; i < maskData.data.length; i += 4) {
            const v = maskData.data[i] > 128 ? 255 : 0
            maskData.data[i] =
                maskData.data[i + 1] =
                maskData.data[i + 2] = v
            maskData.data[i + 3] = 255
        }

        // 🔹 COPY ORIGINAL (JANGAN LANGSUNG MODIF)
        const original = originalImageDataRef.current
        const finalImage = ctx.createImageData(original)
        finalImage.data.set(original.data)

        // 🔹 APPLY ALPHA
        for (let i = 0; i < maskData.data.length; i += 4) {
            if (maskData.data[i] === 0) {
                finalImage.data[i + 3] = 0
            }
        }

        // 🔹 SIMPAN & RENDER
        processedImageDataRef.current = finalImage

        const temp = document.createElement("canvas")
        temp.width = finalImage.width
        temp.height = finalImage.height
        temp.getContext("2d").putImageData(finalImage, 0, 0)

        activeImageRef.current = temp
        renderActiveImage()


    }

    const handleRemoveBg = async () => {
        if (!originalImg || !segmenterRef.current) return

        await segmenterRef.current.send({ image: originalImg })
    }


    useEffect(() => {
        // Jika splitChannels baru saja dikosongkan DAN ada gambar original
        if (splitChannels.length === 0 && originalImg) {
            // Berikan sedikit delay (0ms) agar React selesai merender canvas ke DOM
            const timer = setTimeout(() => {
                drawImage(originalImg, rotation, flipX, flipY);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [splitChannels, originalImg]); // Berjalan setiap kali splitChannels berubah

    const [processType, setProcessType] = useState("")
    const [threshold, setThreshold] = useState(128)
    const [processType2, setProcessType2] = useState(false)

    const [isComparing, setIsComparing] = useState(false)


    const toGrayscale = () => {
        const data = processedImageDataRef.current.data

        for (let i = 0; i < data.length; i += 4) {
            const g =
                0.299 * data[i] +
                0.587 * data[i + 1] +
                0.114 * data[i + 2]

            data[i] = data[i + 1] = data[i + 2] = g
        }
    }


    const applySobel = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const imageData = processedImageDataRef.current
        const { width, height, data } = imageData

        // Copy data supaya tidak overwrite saat loop
        const output = new Uint8ClampedArray(data.length)

        const sobelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ]

        const sobelY = [
            -1, -2, -1,
            0, 0, 0,
            1, 2, 1
        ]

        const getIndex = (x, y) => (y * width + x) * 4

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0
                let gy = 0

                let k = 0
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = getIndex(x + kx, y + ky)
                        const intensity = data[idx] // grayscale → R saja

                        gx += intensity * sobelX[k]
                        gy += intensity * sobelY[k]
                        k++
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy)
                const edge = Math.min(255, magnitude)

                const outIdx = getIndex(x, y)
                output[outIdx] =
                    output[outIdx + 1] =
                    output[outIdx + 2] = edge
                output[outIdx + 3] = 255
            }
        }

        // Salin hasil ke imageData
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i]
        }

        // ctx.putImageData(imageData, 0, 0)
    }

    const applyThreshold = (threshold = 100) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const imageData = processedImageDataRef.current
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] // grayscale / sobel → R saja
            const binary = value >= threshold ? 255 : 0

            data[i] = data[i + 1] = data[i + 2] = binary
            data[i + 3] = 255
        }

        ctx.putImageData(imageData, 0, 0)
    }

    const applyDilation = () => {
        const imageData = processedImageDataRef.current
        const { width, height, data } = imageData
        const copy = new Uint8ClampedArray(data)

        const idx = (x, y) => (y * width + x) * 4

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let max = 0
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = copy[idx(x + kx, y + ky)]
                        if (v > max) max = v
                    }
                }
                const i = idx(x, y)
                data[i] = data[i + 1] = data[i + 2] = max
            }
        }
    }

    const applyErosion = () => {
        const imageData = processedImageDataRef.current
        const { width, height, data } = imageData
        const copy = new Uint8ClampedArray(data)

        const idx = (x, y) => (y * width + x) * 4

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let min = 255
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const v = copy[idx(x + kx, y + ky)]
                        if (v < min) min = v
                    }
                }
                const i = idx(x, y)
                data[i] = data[i + 1] = data[i + 2] = min
            }
        }
    }

    const fillBackground = () => {
        const imageData = processedImageDataRef.current
        const { width, height, data } = imageData

        const idx = (x, y) => (y * width + x) * 4
        const visited = new Uint8Array(width * height)
        const stack = []

        // 🔑 MULAI DARI TEPI CANVAS
        for (let x = 0; x < width; x++) {
            stack.push([x, 0])
            stack.push([x, height - 1])
        }
        for (let y = 0; y < height; y++) {
            stack.push([0, y])
            stack.push([width - 1, y])
        }

        while (stack.length) {
            const [x, y] = stack.pop()
            const i = y * width + x
            if (visited[i]) continue
            visited[i] = 1

            const p = idx(x, y)

            // Isi hanya area hitam (background)
            if (data[p] === 0) {
                data[p] = data[p + 1] = data[p + 2] = 255

                if (x > 0) stack.push([x - 1, y])
                if (x < width - 1) stack.push([x + 1, y])
                if (y > 0) stack.push([x, y - 1])
                if (y < height - 1) stack.push([x, y + 1])
            }
        }
    }

    const invertMask = () => {
        const imageData = processedImageDataRef.current
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            const v = data[i]
            const inv = v === 255 ? 0 : 255
            data[i] = data[i + 1] = data[i + 2] = inv
        }
    }

    const applyAlphaMask = () => {
        const original = originalImageDataRef.current
        const mask = processedImageDataRef.current

        const output = new ImageData(
            new Uint8ClampedArray(original.data),
            original.width,
            original.height
        )

        for (let i = 0; i < mask.data.length; i += 4) {
            if (mask.data[i] === 0) {
                output.data[i + 3] = 0
            }
        }

        processedImageDataRef.current = output
    }

    const renderActiveImage = () => {
        if (!activeImageRef.current) return

        drawImage(
            activeImageRef.current,
            rotation,
            flipX,
            flipY,
            zoom
        )
    }


    const removeBackground = () => {
        if (!originalImageDataRef.current) return

        // clone original
        processedImageDataRef.current = new ImageData(
            new Uint8ClampedArray(originalImageDataRef.current.data),
            originalImageDataRef.current.width,
            originalImageDataRef.current.height
        )

        toGrayscale()
        applySobel()
        applyThreshold(120)
        applyDilation()
        applyErosion()
        fillBackground()
        invertMask()
        applyAlphaMask()

        // 🔑 CONVERT ImageData → Canvas
        const temp = document.createElement("canvas")
        temp.width = processedImageDataRef.current.width
        temp.height = processedImageDataRef.current.height
        temp.getContext("2d").putImageData(processedImageDataRef.current, 0, 0)

        // 🔑 SET SEBAGAI SUMBER AKTIF
        activeImageRef.current = temp

        // 🔑 RENDER ULANG
        renderActiveImage()
    }

    const applyGrayscale = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        const src =
            processedImageDataRef.current ??
            ctx.getImageData(0, 0, canvas.width, canvas.height)

        const imageData = ctx.createImageData(src)
        imageData.data.set(src.data)

        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]

            const gray = 0.299 * r + 0.587 * g + 0.114 * b

            imageData.data[i] =
                imageData.data[i + 1] =
                imageData.data[i + 2] =
                gray
        }

        processedImageDataRef.current = imageData

        const temp = document.createElement("canvas")
        temp.width = imageData.width
        temp.height = imageData.height
        temp.getContext("2d").putImageData(imageData, 0, 0)

        activeImageRef.current = temp
        renderActiveImage()
    }
    // value: -100 sampai +100
    const applyBrightness = (value) => {
        const src = baseImageDataRef.current
        if (!src) return

        const factor = 1 + value / 100

        const imageData = new ImageData(
            new Uint8ClampedArray(src.data),
            src.width,
            src.height
        )

        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.min(255, Math.max(0, src.data[i] * factor))
            imageData.data[i + 1] = Math.min(255, Math.max(0, src.data[i + 1] * factor))
            imageData.data[i + 2] = Math.min(255, Math.max(0, src.data[i + 2] * factor))
        }

        processedImageDataRef.current = imageData

        const temp = document.createElement("canvas")
        temp.width = imageData.width
        temp.height = imageData.height
        temp.getContext("2d").putImageData(imageData, 0, 0)

        activeImageRef.current = temp
        renderActiveImage()
    }

    const applyBinary = (threshold = 128) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d", { willReadFrequently: true })

        const src = baseImageDataRef.current
        if (!src) return

        const imageData = ctx.createImageData(src)
        imageData.data.set(src.data)

        for (let i = 0; i < imageData.data.length; i += 4) {
            const gray =
                0.299 * src.data[i] +
                0.587 * src.data[i + 1] +
                0.114 * src.data[i + 2]

            const v = gray >= threshold ? 255 : 0
            imageData.data[i] =
                imageData.data[i + 1] =
                imageData.data[i + 2] =
                v
        }

        processedImageDataRef.current = imageData

        const temp = document.createElement("canvas")
        temp.width = imageData.width
        temp.height = imageData.height
        temp.getContext("2d").putImageData(imageData, 0, 0)

        activeImageRef.current = temp
        renderActiveImage()
    }



    return (
        <div className="bg-langitmalam h-screen w-full p-3 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center px-3 md:px-5 py-2 gap-2 mb-3">
                {/* LOGO */}
                <span className="text-neutral-50 text-xl font-semibold md:w-[30%] text-center md:text-left">
                    logo<span className="text-orange-300">logo</span>
                </span>

                {/* ACTION CENTER */}
                <div className="flex items-center gap-2 md:w-[30%] justify-center">
                    <label className="flex items-center gap-2 bg-white/10 backdrop-blur-sm
            text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/20 transition text-sm cursor-pointer">
                        <BiPlus className="text-lg" />
                        <span className="hidden sm:inline">Add Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>

                    <button
                        onClick={resetImage}
                        className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm
            text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/20 transition text-sm
            ${!hasImage ? "pointer-events-none opacity-50" : ""}`}
                    >
                        <BiReset className="text-lg" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </div>

                {/* EXPORT */}
                <div className="md:w-[30%] flex justify-center md:justify-end">
                    <button className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm
            text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/20 transition text-sm
            ${!hasImage ? "pointer-events-none opacity-50" : ""}`}>
                        <BiExport className="text-lg" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            <main className="h-full w-full flex flex-col md:flex-row gap-2 relative overflow-hidden">
                <div className="w-full md:w-[78%] h-full flex justify-center items-center relative overflow-hidden">

                    <button
                        onClick={() => hasImage && setShowSidebar(true)}
                        disabled={!hasImage}
                        className={`
        md:hidden
        fixed
        top-1/2
        -translate-y-1/2
        right-0
        z-50

        px-2 py-4
        rounded-l-xl
        border-l border-t border-b

        backdrop-blur-md
        transition-all duration-300

        ${hasImage
                                ? "bg-white/20 text-gray-100 border-white/20 hover:bg-white/30 cursor-pointer"
                                : "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed opacity-50"
                            }
    `}
                    >
                        &lt;
                    </button>




                    <canvas
                        ref={canvasRef}
                        onWheel={handleWheel}
                        className={`
      absolute inset-0
      w-full h-full
      rounded-3xl
      transition-all duration-500 ease-out
      ${hasImage
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-95 pointer-events-none"}
    `}
                    />

                    {!hasImage && (
                        <label
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
            w-[90%] h-[70%]
            sm:w-4/5 sm:h-4/5
            md:w-3/4 md:h-3/4

            border-2 border-dashed
            rounded-2xl sm:rounded-3xl
            cursor-pointer

            flex flex-col justify-center items-center
            text-gray-200
            gap-2 sm:gap-3

            bg-gradient-to-br from-[#0a151a] via-[#142b33] to-[#1f3e4b]
            transition-all duration-200 ease-out

            ${isDragging
                                    ? "border-indigo-400 bg-indigo-500/10 scale-[1.02] sm:scale-105"
                                    : "border-gray-600"
                                }

            ${hasImage
                                    ? "opacity-0 scale-95 pointer-events-none"
                                    : "opacity-100 scale-100"
                                }
        `}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImage}
                            />

                            {/* ICON */}
                            <BiSolidImageAdd
                                className="
                text-gray-300 mb-3
                text-6xl sm:text-7xl md:text-8xl
            "
                            />

                            {/* TITLE */}
                            <p className="font-medium text-center text-sm sm:text-base">
                                Drag & drop an image here
                                <span className="hidden sm:inline">, or click to select</span>
                            </p>

                            {/* SUBTEXT */}
                            <p className="font-light text-xs sm:text-sm text-center text-gray-300">
                                Supported formats:
                                <span className="font-normal ml-1">PNG, JPEG, JPG</span>
                            </p>
                        </label>
                    )}


                    {/* ZOOM */}
                    <div
                        className="
    absolute
    bottom-4
    left-4
    z-40

    flex items-center justify-between gap-8
    px-4 py-1.5

    bg-white/20
    backdrop-blur-md
    text-gray-100
    rounded-xl
    border border-white/20
    shadow-inner

    hover:bg-white/25
    transition
  "
                    >
                        <div className=" flex">
                            <button onClick={zoomIn}>
                                <BiPlus className="text-2xl text-gray-100" />
                            </button>

                            {/* ZOOM DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowZoomMenu(!showZoomMenu)}
                                    className="
        min-w-[80px]
        px-3 py-1.5
        rounded-lg
        text-sm
        hover:bg-white/20
        transition
      "
                                >
                                    {Math.round(zoom * 100)}%
                                </button>

                                {showZoomMenu && (
                                    <div
                                        className="
          absolute
          bottom-full
          mb-2
          left-1/2
          -translate-x-1/2

          w-28
          bg-white/70
          backdrop-blur-xl
          border border-black/20
          rounded-xl
          shadow-lg
          overflow-hidden
          z-50
        "
                                    >
                                        {zoomPresets.map(v => (
                                            <button
                                                key={v}
                                                onClick={() => {
                                                    applyZoom(v / 100)
                                                    setShowZoomMenu(false)
                                                }}
                                                className="
              w-full
              px-4 py-2
              text-sm text-gray-800
              hover:bg-black/20
              transition
            "
                                            >
                                                {v}%
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={zoomOut}>
                                <BiMinus className="text-2xl text-gray-100" />
                            </button>
                        </div>

                        <button
                            onMouseDown={() => {
                                setIsComparing(true)
                                drawImage(originalCanvasRef.current, rotation, flipX, flipY, zoom)
                            }}
                            onMouseUp={() => {
                                setIsComparing(false)
                                renderActiveImage()
                            }}
                            onMouseLeave={() => {
                                if (!processedImageDataRef.current) return
                                const ctx = canvasRef.current.getContext("2d")
                                ctx.putImageData(processedImageDataRef.current, 0, 0)
                            }}
                        >
                            <MdCompare className="text-2xl text-gray-100" />
                        </button>
                    </div>

                </div>

                {showSidebar && (
                    <div
                        onClick={() => setShowSidebar(false)}
                        className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}
                {/* SIDEBAR */}
                <div
                    className={`
        fixed md:static
        top-0 right-0
        h-full
        w-[85%] sm:w-[70%] md:w-[22%]
        z-50

        bg-[#0a151a]/90 md:bg-[#0a151a]/20
        backdrop-blur-xl
        shadow-lg shadow-black/40

        rounded-l-2xl md:rounded-xl
        p-3
        flex flex-col gap-3

        transform transition-transform duration-500 ease-in-out
        ${showSidebar ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0

        ${!hasImage ? "pointer-events-none opacity-50" : ""}
    `}
                >


                    {/* CLOSE BUTTON (MOBILE) */}
                    <button
                        onClick={() => setShowSidebar(false)}
                        className={`
        md:hidden
        absolute
        top-1/2
        -translate-y-1/2
        left-[-30px]
        z-50
        justify-center items-center ${showSidebar ? "flex" : "hidden"}

        px-2 py-4
        rounded-full
        h-12 w-12
        border-r border-t border-b

        bg-white/10
        backdrop-blur-md
        text-gray-100
        border-white/20
        hover:bg-white/20
        transition-all duration-300
                        `}
                    >
                        <BiX className=" text-2xl" />
                    </button>



                    <span className=" text-gray-100 font-semibold ml-1.5 flex items-center gap-1.5"><RiToolsLine size={20} />Tools</span>

                    <div className=" flex justify-center items-center w-full gap-1.5">
                        <button onClick={rotate90} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm 
                            text-gray-300 px-5 py-1.5 rounded-lg shadow-sm hover:bg-white/20 transition cursor-pointer
                            text-sm duration-500
                        ">
                            <BiRotateLeft className=" text-2xl text-gray-100" />
                        </button>
                        <button onClick={flipHorizontal} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm 
                            text-gray-300 px-5 py-1.5 rounded-lg shadow-sm hover:bg-white/20 transition cursor-pointer
                            text-sm duration-500
                        ">
                            <PiFlipHorizontal className=" text-2xl text-gray-100" />
                        </button>
                        <button onClick={flipVertical} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm 
                            text-gray-300 px-5 py-1.5 rounded-lg shadow-sm hover:bg-white/20 transition cursor-pointer
                            text-sm duration-500
                        ">
                            <PiFlipVertical className=" text-2xl text-gray-100" />
                        </button>
                    </div>

                    <hr className=" text-gray-500 my-2" />

                    <div
                        className={`flex w-full flex-col
                        transition-all duration-500
                        gap-1.5 bg-white/10 backdrop-blur-sm
                        rounded-xl overflow-hidden
                        border border-gray-500
                    `}
                    >
                        <span className=" text-gray-100 font-semibold w-full h-9 bg-white/0 backdrop-blur-sm flex items-center pl-3"><BiCode size={20} className=" text-gray-100 mr-1.5" /> Processing</span>
                        <div className="flex flex-col items-center p-4 h-full gap-6">
                            <div className="relative w-full flex flex-col gap-3">
                                <div className=" w-full flex gap-2">
                                    {/* REMOVE BG (NON-AI) */}
                                    <button
                                        onClick={removeBackground}
                                        className="
        w-full bg-white/20 backdrop-blur-md
        text-gray-100 rounded-xl
        px-4 py-1.5 text-sm font-medium
        border border-white/20
        shadow-inner
        hover:bg-white/25 transition
      "
                                    >
                                        RB
                                    </button>

                                    {/* REMOVE BG AI */}
                                    <button
                                        onClick={handleRemoveBg}
                                        className="
        w-full bg-white/20 backdrop-blur-md
        text-gray-100 rounded-xl
        px-4 py-1.5 text-sm font-medium
        border border-white/20
        shadow-inner
        hover:bg-white/25 transition
      "
                                    >
                                        RBA
                                    </button>
                                </div>
                                {/* DIVIDER */}
                                <div className="h-px bg-white/10 my-1" />

                                {/* GRAYSCALE */}
                                <button
                                    onClick={applyGrayscale}
                                    className="
        w-full bg-white/20 backdrop-blur-md
        text-gray-100 rounded-xl
        px-4 py-1.5 text-sm font-medium
        border border-white/20
        shadow-inner
        hover:bg-white/25 transition
      "
                                >
                                    Grayscale
                                </button>

                                {/* BRIGHTNESS */}
                                <div className="bg-white/10 rounded-xl p-2 border border-white/20">
                                    <div className="flex justify-between text-xs text-gray-300 mb-2">
                                        <span>Brightness</span>
                                        <span>{brightness}%</span> {/* ← tampilkan nilai sekarang */}
                                    </div>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="100"
                                        value={brightness}  // pakai value biar controlled
                                        onChange={(e) => {
                                            const val = Number(e.target.value)
                                            setBrightness(val)          // update state untuk angka
                                            applyBrightness(val)        // apply efek
                                        }}
                                        className="w-full accent-indigo-400 cursor-pointer"
                                    />
                                </div>

                                {/* BINARY */}
                                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                                    <div className="flex justify-between text-xs text-gray-300 mb-2">
                                        <span>Binary Threshold</span>
                                        <span>{binary}</span> {/* ← tampilkan nilai sekarang */}
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="255"
                                        value={binary}  // pakai value biar controlled
                                        onChange={(e) => {
                                            const val = Number(e.target.value)
                                            setBinary(val)       // update state untuk angka
                                            applyBinary(val)     // apply efek
                                        }}
                                        className="w-full accent-indigo-400 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    )
}