document.addEventListener('DOMContentLoaded', function () {

    // 1. Inicialización de elementos del DOM
    const dniInput = document.getElementById('dni');
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const passwordToggle2 = document.getElementById('password-toggle2');
    const lockIcon = document.querySelector('.fa-lock');

    let isSubmitting = false; // Bandera para evitar múltiples envíos

    /**
     * Funciones de validación del formulario de registro
     */
    const validateDNI = () => {
        const dni = dniInput.value.trim();
        if (dni.length !== 8) {
            showWarning('El DNI debe tener 8 dígitos');
            return false;
        }
        if (!/^\d+$/.test(dni)) {
            showWarning('El DNI solo puede contener dígitos');
            return false;
        }
        if (/^(\d)\1+$/.test(dni)) { // Validación para evitar números repetidos
            showWarning('Por favor, ingrese un DNI valido.');
            return false;
        }
        return true;
    };

    const validateNombre = () => {
        const nombre = nombreInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
            showWarning('El nombre solo puede contener letras');
            return false;
        }
        return true;
    };

    const validateApellidos = () => {
        const apellidos = apellidosInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellidos)) {
            showWarning('Los apellidos solo pueden contener letras');
            return false;
        }
        return true;
    };

    const validarFormRegistro = () => {
        return validateDNI() && validateNombre() && validateApellidos();
    };

    /**
     * Función para mostrar advertencias con SweetAlert
     * @param {string} message - Mensaje a mostrar
     */
    const showWarning = (message) => {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: message,
        });
    };

    /**
     * Función para alternar la visibilidad de los íconos de la contraseña
     * @param {boolean} isVisible - Define si la contraseña es visible o no
     */
    const togglePasswordVisibility = (isVisible) => {
        passwordInput.type = isVisible ? 'text' : 'password';
        passwordToggle.style.display = isVisible ? 'none' : 'block';
        passwordToggle2.style.display = isVisible ? 'block' : 'none';
    };

    /**
     * Función para controlar el ícono de bloqueo en el campo de la contraseña
     */
    const handlePasswordIconDisplay = () => {
        const hasPassword = passwordInput.value.length > 0;
        lockIcon.style.display = hasPassword ? 'none' : 'block';
        passwordToggle.style.display = hasPassword && passwordInput.type === 'password' ? 'block' : 'none';
        passwordToggle2.style.display = hasPassword && passwordInput.type === 'text' ? 'block' : 'none';
    };

    /**
     * Funciones para alternar entre formularios de login y registro
     */
    const showRegisterForm = () => {
        formLogin.classList.add('d-none');
        formRegister.classList.remove('d-none');
        formLogin.reset();
        handlePasswordIconDisplay();
    };

    const showLoginForm = () => {
        formRegister.classList.add('d-none');
        formLogin.classList.remove('d-none');
        formRegister.reset();
    };

    /**
     * Función para manejar el envío del formulario de login
     * @param {Event} e - Evento de envío del formulario
     */
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Evitar múltiples envíos
        isSubmitting = true;

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: new URLSearchParams(new FormData(formLogin)).toString()
        })
        .then(response => response.json())
        .then(data => {
            handleLoginResponse(data);
            isSubmitting = false; // Resetear la bandera al terminar la solicitud
        })
        .catch(() => isSubmitting = false); // Resetear la bandera si ocurre un error
    };

    /**
     * Maneja la respuesta del servidor al enviar el formulario de login
     * @param {Object} data - Datos de respuesta del servidor
     */
    const handleLoginResponse = (data) => {
        if (data.success) {
            Swal.fire({
                title: 'Bienvenido a SoftPreI!',
                text: data.message,
                icon: 'success',
                background: '#e9efff',
                confirmButtonColor: '#3085d6',
                allowOutsideClick: false, // Evitar cerrar al hacer clic fuera
                willClose: () => {
                    // Redirigir al usuario a la página de inicio al cerrar el mensaje
                    window.location.href = '/inicio';
                }
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message.concat(' https://wa.me/ 935240562'),
                icon: 'error',
                background: '#f8d7da',
                confirmButtonColor: '#d33'
            });
        }
    };

    /**
     * Función para manejar el envío del formulario de registro
     * @param {Event} e - Evento de envío del formulario
     */
    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Evitar múltiples envíos
        isSubmitting = true;

        if (validarFormRegistro()) {
            fetch('/registrarPersonal/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: new URLSearchParams(new FormData(formRegister)).toString()
            })
            .then(response => response.json())
            .then(data => {
                handleRegisterResponse(data);
                isSubmitting = false; // Resetear la bandera al terminar la solicitud
            })
            .catch(error => {
                handleErrorResponse(error);
                isSubmitting = false; // Resetear la bandera si ocurre un error
            });
        } else {
            isSubmitting = false; // Resetear la bandera si no pasa la validación
        }
    };

    /**
     * Maneja la respuesta del servidor al enviar el formulario de registro
     * @param {Object} data - Datos de respuesta del servidor
     */
    const handleRegisterResponse = (data) => {
        if (data.success) {
            Swal.fire({
                title: 'Registro Exitoso',
                text: data.message,
                icon: 'success',
                background: '#e9efff',
                confirmButtonColor: '#3085d6'
            }).then((result) => {
                if (result.isConfirmed) {
                    formRegister.reset();
                }
            });
        } else {
            Swal.fire({
                title: 'Error en el Registro!',
                text: data.message,
                icon: 'error',
                background: '#f8d7da',
                confirmButtonColor: '#d33'
            });
        }
    };

    /**
     * Maneja el error de respuesta del servidor
     * @param {Error} error - Error ocurrido durante la solicitud
     */
    const handleErrorResponse = (error) => {
        Swal.fire({
            title: 'Error!',
            text: 'Ocurrió un error inesperado.',
            icon: 'error',
            background: '#f8d7da',
            confirmButtonColor: '#d33'
        });
        console.error('Error:', error);
    };

    // 3. Eventos para alternar la visibilidad de la contraseña
    passwordInput.addEventListener('input', handlePasswordIconDisplay);
    passwordToggle.addEventListener('click', () => togglePasswordVisibility(true));
    passwordToggle2.addEventListener('click', () => togglePasswordVisibility(false));

    // 4. Eventos para alternar entre los formularios de login y registro
    registerLink.addEventListener('click', showRegisterForm);
    loginLink.addEventListener('click', showLoginForm);

    // 5. Eventos de envío de formularios
    formLogin.addEventListener('submit', handleLoginSubmit);
    formRegister.addEventListener('submit', handleRegisterSubmit);

});
