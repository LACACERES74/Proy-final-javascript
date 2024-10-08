// Obtiene los elementos del DOM
const main = document.getElementById("Main");
const carritoDOM = document.getElementById("carrito");
const mensajeDOM = document.getElementById("mensaje");
const carritoIcono = document.getElementById("carritoIcono");
const carritoCantidad = document.getElementById("carritoCantidad");
let menuComidas = [];

// Inicializar carrito
const carrito = [];

// Cargar el carrito desde localStorage
const cargarCarritoDesdeLocalStorage = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito.push(...JSON.parse(carritoGuardado));
    }
};

// Función para actualizar la cantidad del carrito en el ícono
const actualizarCantidadCarrito = () => {
    const cantidad = carrito.length;
    carritoCantidad.textContent = cantidad;
    carritoIcono.style.display = cantidad > 0 ? 'block' : 'none';
};

// Función para mostrar el menú de comidas
const mostrarMenu = (menuComidas) => {
    main.innerHTML = "";
    menuComidas.forEach(el => {
        const ejemploCard = `
            <div>
                <h3>${el.nombre}</h3>
                <img src="${el.img}" alt="${el.nombre}" />
                <p>Precio: $${el.precio}</p>
                <button class="btnAgregar" data-id="${el.id}">Agregar al Carrito</button>
            </div>
        `;
        main.innerHTML += ejemploCard;
    });
    agregarEventoBotones();
};

// Función para obtener el menú de comidas desde el JSON
const cargarMenuDesdeJSON = async () => {
    try {
        const response = await fetch('js/menuComidas.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        menuComidas = await response.json();
        mostrarMenu(menuComidas);
    } catch (error) {
        console.error('Hubo un problema con la operación fetch:', error);
    }
};

// Función para mostrar el carrito de compras
const mostrarCarrito = () => {
    carritoDOM.innerHTML = "";
    if (carrito.length === 0) {
        carritoDOM.innerHTML = "<p>El carrito está vacío</p>";
        return;
    }
    const carritoAgrupado = carrito.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, cantidad: 1 };
        } else {
            acc[item.id].cantidad++;
        }
        return acc;
    }, {});

    let total = 0;

    for (const item of Object.values(carritoAgrupado)) {
        carritoDOM.innerHTML += `<h3>${item.nombre} - $${item.precio} x ${item.cantidad} = $${item.precio * item.cantidad}</h3>`;
        total += item.precio * item.cantidad;
    }

    carritoDOM.innerHTML += `<h3>Total: $${total}</h3>`;

    carritoDOM.innerHTML += `
        <button type="button" id="btnProcederCompra">Proceder a Compra</button>
    `;

    document.getElementById("btnProcederCompra").addEventListener("click", mostrarDatosCliente);
};

// Función para agregar eventos a los botones de agregar al carrito
const agregarEventoBotones = () => {
    const botonesEventos = document.getElementsByClassName("btnAgregar");
    Array.from(botonesEventos).forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const comida = menuComidas.find(el => el.id == id);
            if (comida) {
                carrito.push(comida);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                mostrarCarrito();
                actualizarCantidadCarrito();
            } else {
                mostrarMensaje(`No se encontró el item con id ${id}`, "error");
            }
        });
    });
};

// Función para mostrar el formulario de datos del cliente
const mostrarDatosCliente = () => {
    if (carrito.length === 0) {
        mostrarMensaje("El carrito está vacío. Agregue productos antes de proceder.", "error");
        return;
    }

    carritoDOM.innerHTML = `
        <h3>Datos del Cliente</h3>
        <form id="formCliente">
            <label for="nombreCliente">Nombre:</label>
            <input type="text" id="nombreCliente" name="nombreCliente" required><br><br>
            <label for="telefonoCliente">Teléfono:</label>
            <input type="text" id="telefonoCliente" name="telefonoCliente" required><br><br>
            <label for="direccionCliente">Dirección:</label>
            <input type="text" id="direccionCliente" name="direccionCliente" required><br><br>
            <button type="button" id="btnConfirmar">Confirmar Compra</button>
            <button type="button" id="btnCancelar">Cancelar Compra</button>
        </form>
    `;

    document.getElementById("btnConfirmar").addEventListener("click", confirmarCompra);
    document.getElementById("btnCancelar").addEventListener("click", cancelarCompra);
};

// Función para confirmar la compra
const confirmarCompra = () => {
    if (carrito.length === 0) {
        mostrarMensaje("No hay productos en el carrito para confirmar.", "error");
        return;
    }

    const nombre = document.getElementById("nombreCliente").value;
    const telefono = document.getElementById("telefonoCliente").value;
    const direccion = document.getElementById("direccionCliente").value;

    if (!nombre || !telefono || !direccion) {
        mostrarMensaje("Por favor, complete todos los campos.", "error");
        return;
    }

    mostrarMensaje(`Compra confirmada. Total a pagar: $${calcularTotal()}<br>Nombre: ${nombre}<br>Teléfono: ${telefono}<br>Dirección: ${direccion}`, "success");

    carrito.length = 0;
    localStorage.removeItem('carrito');
    mostrarCarrito();
    actualizarCantidadCarrito();
    mostrarGif();
};

// Función para cancelar la compra
const cancelarCompra = () => {
    if (carrito.length === 0) {
        mostrarMensaje("No hay productos en el carrito para cancelar.", "error");
        return;
    }

    carrito.length = 0;
    localStorage.removeItem('carrito');
    mostrarCarrito();
    actualizarCantidadCarrito();
    mostrarGifCancelacion();

    setTimeout(() => {
        location.reload();
    }, 2000);
};

// Función para calcular el total del carrito
const calcularTotal = () => {
    const carritoAgrupado = carrito.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, cantidad: 1 };
        } else {
            acc[item.id].cantidad++;
        }
        return acc;
    }, {});

    return Object.values(carritoAgrupado).reduce((total, item) => total + item.precio * item.cantidad, 0);
};

// Función para mostrar mensajes en el contenedor
const mostrarMensaje = (mensaje, tipo) => {
    mensajeDOM.innerHTML = mensaje;
    mensajeDOM.className = `mensaje ${tipo}`;
};

// Función para mostrar el GIF usando SweetAlert2
const mostrarGif = () => {
    Swal.fire({
        timer: 2000,
        imageUrl: "https://media.giphy.com/media/3oxOCdRCzsIW9GPqWA/giphy.gif",
        imageAlt: "Descripción del GIF",
        showConfirmButton: false
    });
};

// Función para mostrar el GIF de cancelación usando SweetAlert2
const mostrarGifCancelacion = () => {
    Swal.fire({
        timer: 2000,
        imageUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3g3ajd6MnJ4cHZsYmxkNDZmeTgybmZocXJsOXF2Mno3ZHRuenkwaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26mfgnMdWDeC71IQg/giphy.gif",
        imageAlt: "GIF de Cancelación",
        showConfirmButton: false
    });
};

// Evento de clic para alternar visibilidad del carrito
const toggleCarrito = () => {
    carritoDOM.classList.toggle("mostrar");
};

carritoIcono.addEventListener("click", toggleCarrito);

// Renderizado inicial
const renderizadoInicial = async () => {
    cargarCarritoDesdeLocalStorage();
    await cargarMenuDesdeJSON();
    mostrarCarrito();
    actualizarCantidadCarrito();
};

document.addEventListener('DOMContentLoaded', renderizadoInicial);
