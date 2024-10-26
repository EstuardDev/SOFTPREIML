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

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: new URLSearchParams(new FormData(formLogin)).toString()
        })
        .then(response => response.json())
        .then(data => handleLoginResponse(data));
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
                confirmButtonColor: '#3085d6'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/inicio';
                }
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message,
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
            .then(data => handleRegisterResponse(data))
            .catch(error => handleErrorResponse(error));
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

    // 6. Animaciones adicionales (comentadas si no se usan)
    /* 
    const logoImg = document.querySelector('.logo-img');
    setInterval(function () {
        logoImg.classList.add('animate');
        setTimeout(function () {
            logoImg.classList.remove('animate');
        }, 4000); // Duración de la animación (4 segundos)
    }, 10000); // Intervalo de tiempo entre animaciones (10 segundos) 
    */
});


// document.addEventListener('DOMContentLoaded', function () {
//     const dniInput = document.getElementById('dni');
//     const nombreInput = document.getElementById('nombre');
//     const apellidosInput = document.getElementById('apellidos');
//     const formLogin = document.getElementById('form-login');
//     const formRegister = document.getElementById('form-register');
//     const registerLink = document.getElementById('register-link');
//     const loginLink = document.getElementById('login-link');
//     const passwordInput = document.getElementById('password');
//     const passwordToggle = document.getElementById('password-toggle');
//     const passwordToggle2 = document.getElementById('password-toggle2');
//     const lockIcon = document.querySelector('.fa-lock');

//     // VALIDAMOS CAMPOS DEL FORMULARIOD DE ERGISTOR
//     const validateDNI = () => {
//         const dni = dniInput.value.trim();
//         if (dni.length !== 8) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Advertencia',
//                 text: 'El DNI debe tener 8 dígitos',
//             });
//             return false;
//         }
//         if (!/^\d+$/.test(dni)) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Advertencia',
//                 text: 'El DNI solo puede contener dígitos',
//             });
//             return false;
//         }
//         return true;
//     };

//     const validateNombre = () => {
//         const nombre = nombreInput.value.trim();
//         if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Advertencia',
//                 text: 'El nombre solo puede contener letras',
//             });
//             return false;
//         }
//         return true;
//     };

//     const validateApellidos = () => {
//         const apellidos = apellidosInput.value.trim();
//         if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellidos)) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Advertencia',
//                 text: 'Los apellidos solo pueden contener letras',
//             });
//             return false;
//         }
//         return true;
//     };

//     const validarFormRegistro = () => {
//         if (!validateDNI() || !validateNombre() || !validateApellidos()) {
//             return false;
//         }
//         return true;
//     };

//     passwordInput.addEventListener('input', function () {
//         if (passwordInput.value.length > 0) {
//             lockIcon.style.display = 'none';
//             if (passwordInput.type === 'password') {
//                 passwordToggle.style.display = 'block';
//                 passwordToggle2.style.display = 'none';
//             } else {
//                 passwordToggle.style.display = 'none';
//                 passwordToggle2.style.display = 'block';
//             }
//         } else {
//             lockIcon.style.display = 'block';
//             passwordToggle.style.display = 'none';
//             passwordToggle2.style.display = 'none';
//         }
//     });

//     passwordToggle.addEventListener('click', function () {
//         if (passwordInput.type === 'password') {
//             passwordInput.type = 'text';
//             passwordToggle.style.display = 'none';
//             passwordToggle2.style.display = 'block';
//         } else {
//             passwordInput.type = 'password';
//             passwordToggle.style.display = 'block';
//             passwordToggle2.style.display = 'none';
//         }
//     });

//     passwordToggle2.addEventListener('click', function () {
//         if (passwordInput.type === 'password') {
//             passwordInput.type = 'text';
//             passwordToggle.style.display = 'block';
//             passwordToggle2.style.display = 'none';
//         } else {
//             passwordInput.type = 'password';
//             passwordToggle.style.display = 'block';
//             passwordToggle2.style.display = 'none';
//         }
//     });

//     registerLink.addEventListener('click', function (e) {
//         e.preventDefault();
//         formLogin.classList.add('d-none');
//         formRegister.classList.remove('d-none');
//         formLogin.reset();
//         if (passwordInput.value.length > 0) {
//             lockIcon.style.display = 'none';
//             passwordToggle.style.display = 'block';
//         } else {
//             lockIcon.style.display = 'block';
//             passwordToggle.style.display = 'none';
//         }
//     });

//     loginLink.addEventListener('click', function (e) {
//         e.preventDefault();
//         formRegister.classList.add('d-none');
//         formLogin.classList.remove('d-none');
//         formRegister.reset();
//     });

//     formLogin.addEventListener('submit', function (e) {
//         e.preventDefault();
        
//         fetch('', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
//             },
//             body: new URLSearchParams(new FormData(formLogin)).toString()
//         })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     Swal.fire({
//                         title: 'Bienvenido a Softly!',
//                         text: data.message,
//                         icon: 'success',
//                         background: '#e9efff',
//                         confirmButtonColor: '#3085d6'
//                     }).then((result) => {
//                         if (result.isConfirmed) {
//                             window.location.href = '/inicio';  // Redirige a la página de inicio
//                         }
//                     });
//                 } else {
//                     Swal.fire({
//                         title: 'Error!',
//                         text: data.message,
//                         icon: 'error',
//                         background: '#f8d7da',
//                         confirmButtonColor: '#d33'
//                     });
//                 }
//             });
//     });

//     // Manejador para el formulario de registro
//     formRegister.addEventListener('submit', function (e) {
//         e.preventDefault();

//         if (validarFormRegistro()) {
//             fetch('/registrarPersonal/', { 
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
//                 },
//                 body: new URLSearchParams(new FormData(formRegister)).toString()
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     if (data.success) {
//                         Swal.fire({
//                             title: 'Registro Exitoso!',
//                             text: data.message,
//                             icon: 'success',
//                             background: '#e9efff',
//                             confirmButtonColor: '#3085d6'
//                         }).then((result) => {
//                             if (result.isConfirmed) {
//                                 formRegister.reset();  // Limpiar los campos del formulario
//                                 //window.location.reload();  // Redirige a la página de inicio o a otro lugar
//                             }
//                         });
//                     } else {
//                         Swal.fire({
//                             title: 'Error en el Registro!',
//                             text: data.message,
//                             icon: 'error',
//                             background: '#f8d7da',
//                             confirmButtonColor: '#d33'
//                         });
//                     }
//                 })
//                 .catch(error => {
//                     Swal.fire({
//                         title: 'Error!',
//                         text: 'Ocurrió un error inesperado.',
//                         icon: 'error',
//                         background: '#f8d7da',
//                         confirmButtonColor: '#d33'
//                     });
//                     console.error('Error:', error);
//                 });
//         }
//     });

//     //  let logoImg = document.querySelector('.logo-img');

//     /*setInterval(function () {
//         logoImg.classList.add('animate');
//         setTimeout(function () {
//             logoImg.classList.remove('animate');
//         }, 4000); // 5000ms = 5s (duración de la animación)
//     }, 10000);*/ // 10000ms = 10s (tiempo de espera entre animaciones)

// });
