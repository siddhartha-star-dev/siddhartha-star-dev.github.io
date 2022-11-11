const DEFAULT_COLOR = '#333333'
const DEFAULT_BG_COLOR = '#fefefe'
const DEFAULT_MODE = 'rainbow'
const DEFAULT_SIZE = 16

let currentColor = DEFAULT_COLOR
let currentMode = DEFAULT_MODE
let currentSize = DEFAULT_SIZE
let backgroundColor = DEFAULT_BG_COLOR

function setCurrentColor(newColor) {
    currentColor = newColor
}

function setbackgroundColor(bgColor) {
    backgroundColor = bgColor
    gridElements = grid.children
    for (var i = 0; i < gridElements.length; i++) {
        if (gridElements[i].getAttribute("inked") === "false") {
            gridElements[i].style.backgroundColor = bgColor
        }
    }
}

function setCurrentMode(newMode) {
    activateButton(newMode)
    currentMode = newMode
}

function setCurrentSize(newSize) {
    currentSize = newSize
}

const colorPicker = document.getElementById('colorPicker')
const colorBtn = document.getElementById('colorBtn')
const rainbowBtn = document.getElementById('rainbowBtn')
const eraserBtn = document.getElementById('eraserBtn')
const clearBtn = document.getElementById('clearBtn')
const sizeValue = document.getElementById('sizeValue')
const sizeSlider = document.getElementById('sizeSlider')
const grid = document.getElementById('grid')
const bgColorPicker = document.getElementById('bgColorSelect')
const shaderButton = document.getElementById('shaderBtn')
const lightenButton = document.getElementById('lightenBtn')
const grabber = document.getElementById('colorGrabber')
const filler = document.getElementById('colorFill')

colorPicker.oninput = (e) => setCurrentColor(e.target.value)
colorBtn.onclick = () => setCurrentMode('color')
rainbowBtn.onclick = () => setCurrentMode('rainbow')
shaderButton.onclick = () => setCurrentMode('shading')
lightenButton.onclick = () => setCurrentMode('lightening')
eraserBtn.onclick = () => setCurrentMode('eraser')
clearBtn.onclick = () => reloadGrid()
grabber.onclick = () => grabColor()
filler.onclick = () => fillColor()
sizeSlider.onmousemove = (e) => updateSizeValue(e.target.value)
sizeSlider.onchange = (e) => changeSize(e.target.value)
bgColorPicker.oninput = (e) => setbackgroundColor(e.target.value)

let grab = false
let mouseDown = false
document.body.onmousedown = () => (mouseDown = true)
document.body.onmouseup = () => (mouseDown = false)

function changeSize(value) {
    setCurrentSize(value)
    updateSizeValue(value)
    reloadGrid()
}

function updateSizeValue(value) {
    sizeValue.innerHTML = `${value} x ${value}`
}

function reloadGrid() {
    clearGrid()
    setupGrid(currentSize)
}

function clearGrid() {
    grid.innerHTML = ''
    bgColorPicker.value = DEFAULT_BG_COLOR
}

function setupGrid(size) {
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`

    for (let i = 0; i < size * size; i++) {
        const gridElement = document.createElement('div')
        gridElement.classList.add('grid-element')
        gridElement.setAttribute("inked", false)
        gridElement.addEventListener('mouseover', changeColor)
        gridElement.addEventListener('mousedown', changeColor)
        gridElement.addEventListener('mouseenter', changeColor)
        grid.appendChild(gridElement)
    }
}
function RGBToHex(rgb) {
    let sep = rgb.indexOf(',') > -1 ? ',' : ' '
    rgb = rgb.substr(4).split(')')[0].split(sep)

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16)

    if (r.length == 1) r = '0' + r
    if (g.length == 1) g = '0' + g
    if (b.length == 1) b = '0' + b
    b = (+rgb[2]).toString(16)

    if (r.length == 1) r = '0' + r
    if (g.length == 1) g = '0' + g
    if (b.length == 1) b = '0' + b
    return '#' + r + g + b
}

function LightenDarkenColor(col, amt) {
    col = RGBToHex(col)
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1)
        usePound = true
    }
    var num = parseInt(col, 16)
    var r = (num >> 16) + amt

    if (r > 255) r = 255
    else if (r < 0) r = 0

    var b = ((num >> 8) & 0x00FF) + amt

    if (b > 255) b = 255
    else if (b < 0) b = 0

    var g = (num & 0x0000FF) + amt

    if (g > 255) g = 255
    else if (g < 0) g = 0
    console.log((usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16))

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16)
}

function changeColor(e) {
    if (e.type === 'mouseenter') {
        if (currentMode === 'shading') {
            if (!e.target.getAttribute("data-shade")) {
                e.target.setAttribute("data-shade", "0")
            }
            let shadeAmount = parseInt(e.target.getAttribute("data-shade"))
            shadeAmount++
            e.target.setAttribute("data-shade", `${shadeAmount}`)
            if (e.target.style.backgroundColor == '' || e.target.style.backgroundColor == 'transperent') {
                e.target.style.backgroundColor = backgroundColor
            }
            e.target.style.backgroundColor = LightenDarkenColor(e.target.style.backgroundColor, -15)
        }
        if (currentMode === 'lightening') {
            e.target.setAttribute("data-shade", "0")
            let shadeAmount = parseInt(e.target.getAttribute('data-shade'))
            shadeAmount--
            e.target.setAttribute("data-shade", `${shadeAmount}`)
            if (e.target.style.backgroundColor == '' || e.target.style.backgroundColor == 'transperent') {
                e.target.style.backgroundColor = backgroundColor
            }
            e.target.style.backgroundColor = LightenDarkenColor(e.target.style.backgroundColor, 15)
        }

        return
    }
    if ((e.type === 'mouseover' && !mouseDown) || grab) return
    e.target.setAttribute("inked", true)
    e.target.setAttribute("data-shade", "0")
    if (currentMode === 'rainbow') {
        const randomR = Math.floor(Math.random() * 256)
        const randomG = Math.floor(Math.random() * 256)
        const randomB = Math.floor(Math.random() * 256)
        e.target.style.backgroundColor = `rgb(${randomR}, ${randomG}, ${randomB})`
    } else if (currentMode === 'color') {
        e.target.style.backgroundColor = currentColor
    } else if (currentMode === 'eraser') {
        e.target.style.backgroundColor = backgroundColor
        e.target.setAttribute("inked", false)
    }
}

function setGrabber(e) {
    if (grab) {
        currentColor = e.target.style.backgroundColor
        colorPicker.value = RGBToHex(currentColor)
        grabber.classList.remove('active')
        grab = false
    }
}

function grabColor() {
    grab = true
    grabber.classList.add('active')
    gridItems = grid.children
    for (let i = 0; i < gridItems.length; i++) {
        gridItems[i].addEventListener('click', setGrabber)
    }
}

function activateButton(newMode) {
    if (currentMode === 'rainbow') {
        rainbowBtn.classList.remove('active')
    } else if (currentMode === 'color') {
        colorBtn.classList.remove('active')
    } else if (currentMode === 'eraser') {
        eraserBtn.classList.remove('active')
    } else if (currentMode === 'lightening') {
        console.log(lightenButton)
        lightenButton.classList.remove('active')
    } else if (currentMode === 'shading') {
        console.log(shaderButton)
        shaderButton.classList.remove('active')
    }

    if (newMode === 'rainbow') {
        rainbowBtn.classList.add('active')
    } else if (newMode === 'color') {
        colorBtn.classList.add('active')
    } else if (newMode === 'eraser') {
        eraserBtn.classList.add('active')
    } else if (newMode === 'shading') {
        shaderButton.classList.add('active')
    } else if (newMode === 'lightening') {
        lightenButton.classList.add('active')
    }
}

window.onload = () => {
    setupGrid(DEFAULT_SIZE)
    activateButton(DEFAULT_MODE)
}