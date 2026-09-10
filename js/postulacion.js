/* =========================================================
   ECOBIT EXCELLENCE
   SISTEMA DE POSTULACIÓN A BECAS

   ARCHIVO:
   js/postulacion.js
   ========================================================= */


/* =========================================================
   1. CONFIGURACIÓN
   ========================================================= */

const CONFIG = {

  API_URL:
    "/api/ecobit"

};


/* =========================================================
   2. ESTADO DEL FORMULARIO
   ========================================================= */

let currentStep = 1;

const totalSteps = 4;


/* =========================================================
   3. ELEMENTOS PRINCIPALES DEL DOM
   ========================================================= */

const form =
  document.getElementById(
    "scholarshipForm"
  );


const formSteps =
  document.querySelectorAll(
    ".form-step"
  );


const currentStepElement =
  document.getElementById(
    "currentStep"
  );


const progressBar =
  document.getElementById(
    "progressBar"
  );


const progressLabels =
  document.querySelectorAll(
    ".progress-labels span"
  );


const successScreen =
  document.getElementById(
    "successScreen"
  );


const applicationIdDisplay =
  document.getElementById(
    "applicationIdDisplay"
  );


/* =========================================================
   4. INICIALIZACIÓN
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeForm();

  }
);


/* =========================================================
   5. INICIALIZAR FORMULARIO
   ========================================================= */

function initializeForm() {

  loadPrograms();

  setupNavigationButtons();

  setupFormSubmission();

  updateStepInterface();

}


/* =========================================================
   6. CARGAR PROGRAMAS DESDE EL BACKEND
   ========================================================= */

async function loadPrograms() {

  const programField =
    document.getElementById(
      "programa"
    );


  if (!programField) {
    return;
  }


  try {

    /* =====================================================
       ESTADO DE CARGA
       ===================================================== */

    programField.innerHTML =
      '<option value="">Cargando programas...</option>';


    programField.disabled = true;


    /* =====================================================
       CONSULTAR BACKEND
       ===================================================== */

    const response =
      await fetch(
        CONFIG.API_URL +
        "?action=programas"
      );


    const data =
      await response.json();


    /* =====================================================
       VALIDAR RESPUESTA
       ===================================================== */

    if (!data.success) {

      throw new Error(
        data.message ||
        "No fue posible cargar los programas."
      );

    }


    /* =====================================================
       LIMPIAR SELECTOR
       ===================================================== */

    programField.innerHTML =
      '<option value="">Selecciona un programa</option>';


    /* =====================================================
       VALIDAR SI EXISTEN PROGRAMAS
       ===================================================== */

    if (
      !data.programs ||
      data.programs.length === 0
    ) {

      programField.innerHTML =
        '<option value="">No hay programas disponibles</option>';


      return;

    }


    /* =====================================================
       CREAR OPCIONES
       ===================================================== */

    data.programs.forEach(
      function (program) {

        const option =
          document.createElement(
            "option"
          );


        /*
           El valor enviado al backend será
           el nombre del programa.
        */

        option.value =
          program.name;


        /*
           Texto visible para el usuario.
        */

        option.textContent =
          program.subtitle
            ? program.name +
              " — " +
              program.subtitle
            : program.name;


        programField.appendChild(
          option
        );

      }
    );


    /* =====================================================
       REACTIVAR SELECTOR
       ===================================================== */

    programField.disabled = false;


    /* =====================================================
       SELECCIONAR PROGRAMA DESDE URL
       ===================================================== */

    selectProgramFromURL(
      programField
    );


  } catch (error) {

    console.error(
      "Error cargando programas:",
      error
    );


    programField.innerHTML =
      '<option value="">No fue posible cargar los programas</option>';


    programField.disabled = false;

  }

}


/* =========================================================
   7. SELECCIONAR PROGRAMA DESDE LA URL
   ========================================================= */

function selectProgramFromURL(
  programField
) {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const requestedProgram =
    params.get(
      "programa"
    );


  if (!requestedProgram) {
    return;
  }


  const normalizedRequestedProgram =
    requestedProgram
      .trim()
      .toLowerCase();


  const options =
    Array.from(
      programField.options
    );


  /*
     Primero buscamos coincidencia exacta
     con el value.
  */

  const matchingOption =
    options.find(
      function (option) {

        return (
          option.value
            .trim()
            .toLowerCase() ===
          normalizedRequestedProgram
        );

      }
    );


  if (matchingOption) {

    programField.value =
      matchingOption.value;

    return;

  }


  /*
     Como alternativa buscamos coincidencia
     dentro del nombre del programa.
  */

  const partialMatch =
    options.find(
      function (option) {

        return (
          option.value
            .trim()
            .toLowerCase()
            .includes(
              normalizedRequestedProgram
            )
        );

      }
    );


  if (partialMatch) {

    programField.value =
      partialMatch.value;

  }

}


/* =========================================================
   8. CONFIGURAR NAVEGACIÓN
   ========================================================= */

function setupNavigationButtons() {

  const nextButtons =
    document.querySelectorAll(
      "[data-next]"
    );


  nextButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          nextStep();

        }
      );

    }
  );


  const backButtons =
    document.querySelectorAll(
      "[data-back]"
    );


  backButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          previousStep();

        }
      );

    }
  );

}


/* =========================================================
   9. SIGUIENTE PASO
   ========================================================= */

function nextStep() {

  if (!validateCurrentStep()) {
    return;
  }


  if (
    currentStep < totalSteps
  ) {

    currentStep++;

    updateStepInterface();

  }

}


/* =========================================================
   10. PASO ANTERIOR
   ========================================================= */

function previousStep() {

  if (
    currentStep > 1
  ) {

    currentStep--;

    updateStepInterface();

  }

}


/* =========================================================
   11. ACTUALIZAR INTERFAZ
   ========================================================= */

function updateStepInterface() {

  /* =====================================================
     MOSTRAR PASO ACTUAL
     ===================================================== */

  formSteps.forEach(
    function (step) {

      const stepNumber =
        Number(
          step.dataset.step
        );


      step.classList.remove(
        "active"
      );


      if (
        stepNumber === currentStep
      ) {

        step.classList.add(
          "active"
        );

      }

    }
  );


  /* =====================================================
     CONTADOR
     ===================================================== */

  if (currentStepElement) {

    currentStepElement.textContent =
      currentStep;

  }


  /* =====================================================
     BARRA DE PROGRESO
     ===================================================== */

  if (progressBar) {

    const percentage =
      (currentStep / totalSteps) * 100;


    progressBar.style.width =
      percentage + "%";

  }


  /* =====================================================
     ETIQUETAS DEL PROGRESO
     ===================================================== */

  progressLabels.forEach(
    function (label, index) {

      label.classList.remove(
        "active"
      );


      if (
        index < currentStep
      ) {

        label.classList.add(
          "active"
        );

      }

    }
  );


  /* =====================================================
     SCROLL HACIA EL FORMULARIO
     ===================================================== */

  scrollToApplicationCard();

}


/* =========================================================
   12. SCROLL HACIA LA TARJETA
   ========================================================= */

function scrollToApplicationCard() {

  const applicationCard =
    document.querySelector(
      ".application-card"
    );


  if (!applicationCard) {
    return;
  }


  const top =
    applicationCard
      .getBoundingClientRect()
      .top
    +
    window.scrollY
    -
    20;


  window.scrollTo({

    top: top,

    behavior: "smooth"

  });

}


/* =========================================================
   13. VALIDAR PASO ACTUAL
   ========================================================= */

function validateCurrentStep() {

  const step =
    document.querySelector(
      `.form-step[data-step="${currentStep}"]`
    );


  if (!step) {
    return true;
  }


  /* Limpiar errores anteriores */

  clearStepErrors(
    step
  );


  const requiredFields =
    step.querySelectorAll(
      "[required]"
    );


  let isValid = true;


  requiredFields.forEach(
    function (field) {

      /* ===============================================
         CHECKBOX
         =============================================== */

      if (
        field.type === "checkbox"
      ) {

        if (!field.checked) {

          showCheckboxError(
            field,
            "Debes confirmar esta condición para continuar."
          );


          isValid = false;

        }


        return;

      }


      /* ===============================================
         CAMPOS NORMALES
         =============================================== */

      const value =
        String(
          field.value || ""
        ).trim();


      if (!value) {

        showFieldError(
          field,
          "Este campo es obligatorio."
        );


        isValid = false;

        return;

      }


      /* ===============================================
         EMAIL
         =============================================== */

      if (
        field.type === "email"
      ) {

        if (
          !isValidEmail(value)
        ) {

          showFieldError(
            field,
            "Ingresa un correo electrónico válido."
          );


          isValid = false;

        }

      }

    }
  );


  return isValid;

}


/* =========================================================
   14. VALIDAR EMAIL
   ========================================================= */

function isValidEmail(email) {

  const expression =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  return expression.test(
    email
  );

}


/* =========================================================
   15. MOSTRAR ERROR DE CAMPO
   ========================================================= */

function showFieldError(
  field,
  message
) {

  const formGroup =
    field.closest(
      ".form-group"
    );


  if (!formGroup) {
    return;
  }


  formGroup.classList.add(
    "error"
  );


  const error =
    document.createElement(
      "div"
    );


  error.className =
    "error-message";


  error.textContent =
    message;


  formGroup.appendChild(
    error
  );

}


/* =========================================================
   16. MOSTRAR ERROR DE CHECKBOX
   ========================================================= */

function showCheckboxError(
  field,
  message
) {

  const checkboxGroup =
    field.closest(
      ".checkbox-group"
    );


  if (!checkboxGroup) {
    return;
  }


  const error =
    document.createElement(
      "div"
    );


  error.className =
    "error-message";


  error.textContent =
    message;


  checkboxGroup.appendChild(
    error
  );

}


/* =========================================================
   17. LIMPIAR ERRORES
   ========================================================= */

function clearStepErrors(step) {

  const groups =
    step.querySelectorAll(
      ".form-group"
    );


  groups.forEach(
    function (group) {

      group.classList.remove(
        "error"
      );

    }
  );


  const errors =
    step.querySelectorAll(
      ".error-message"
    );


  errors.forEach(
    function (error) {

      error.remove();

    }
  );

}


/* =========================================================
   18. CONFIGURAR ENVÍO DEL FORMULARIO
   ========================================================= */

function setupFormSubmission() {

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      /* ===============================================
         VALIDAR PASO FINAL
         =============================================== */

      if (!validateCurrentStep()) {
        return;
      }


      /* ===============================================
         ENVIAR POSTULACIÓN
         =============================================== */

      await submitApplication();

    }
  );

}


/* =========================================================
   19. ENVIAR POSTULACIÓN AL BACKEND
   ========================================================= */

async function submitApplication() {

  const submitButton =
    document.getElementById(
      "submitButton"
    );


  try {

    /* =====================================================
       ACTIVAR CARGA
       ===================================================== */

    setLoadingState(
      submitButton,
      true
    );


    /* =====================================================
       OBTENER DATOS
       ===================================================== */

    const formData =
      new FormData(
        form
      );


    /* =====================================================
       CONVERTIR PARA APPS SCRIPT
       ===================================================== */

    const params =
      new URLSearchParams();


    formData.forEach(
      function (value, key) {

        params.append(
          key,
          value
        );

      }
    );


    /* =====================================================
       ENVIAR AL BACKEND
       ===================================================== */

    const response =
      await fetch(
        CONFIG.API_URL,
        {

          method: "POST",

          body: params

        }
      );


    /* =====================================================
       VALIDAR RESPUESTA HTTP
       ===================================================== */

    if (!response.ok) {

      throw new Error(
        "Error de conexión con el servidor."
      );

    }


    /* =====================================================
       LEER RESPUESTA JSON
       ===================================================== */

    const data =
      await response.json();


    /* =====================================================
       VALIDAR RESULTADO
       ===================================================== */

    if (!data.success) {

      throw new Error(
        data.message ||
        "No fue posible registrar tu postulación."
      );

    }


    /* =====================================================
       MOSTRAR ÉXITO
       ===================================================== */

    showSuccessScreen(
      data.applicationId
    );


  } catch (error) {

    console.error(
      "Error al registrar postulación:",
      error
    );


    showSubmissionError(
      error.message
    );


  } finally {

    setLoadingState(
      submitButton,
      false
    );

  }

}


/* =========================================================
   20. ESTADO DE CARGA DEL BOTÓN
   ========================================================= */

function setLoadingState(
  button,
  isLoading
) {

  if (!button) {
    return;
  }


  const buttonText =
    button.querySelector(
      ".button-text"
    );


  if (isLoading) {

    button.disabled = true;


    button.classList.add(
      "loading"
    );


    if (buttonText) {

      buttonText.textContent =
        "ENVIANDO POSTULACIÓN...";

    }


  } else {

    button.disabled = false;


    button.classList.remove(
      "loading"
    );


    if (buttonText) {

      buttonText.textContent =
        "ENVIAR POSTULACIÓN";

    }

  }

}


/* =========================================================
   21. MOSTRAR ERROR DE ENVÍO
   ========================================================= */

function showSubmissionError(
  message
) {

  /*
     Por ahora usamos una alerta clara.
     Posteriormente, si queremos, podemos
     integrarla visualmente al diseño.
  */

  alert(

    "No pudimos registrar tu postulación.\n\n" +

    (
      message ||
      "Por favor, verifica tu conexión e inténtalo nuevamente."
    )

  );

}


/* =========================================================
   22. MOSTRAR PANTALLA DE ÉXITO
   ========================================================= */

function showSuccessScreen(
  applicationId
) {

  /* =====================================================
     OCULTAR FORMULARIO
     ===================================================== */

  if (form) {

    form.style.display =
      "none";

  }


  /* =====================================================
     OCULTAR ENCABEZADO
     ===================================================== */

  const formHeader =
    document.querySelector(
      ".form-header"
    );


  if (formHeader) {

    formHeader.style.display =
      "none";

  }


  /* =====================================================
     OCULTAR PROGRESO
     ===================================================== */

  const progressWrapper =
    document.querySelector(
      ".progress-wrapper"
    );


  if (progressWrapper) {

    progressWrapper.style.display =
      "none";

  }


  /* =====================================================
     MOSTRAR APPLICATION ID
     ===================================================== */

  if (applicationIdDisplay) {

    applicationIdDisplay.textContent =
      applicationId ||
      "REGISTRADO";

  }


  /* =====================================================
     MOSTRAR PANTALLA FINAL
     ===================================================== */

  if (successScreen) {

    successScreen.classList.add(
      "active"
    );

  }


  /* =====================================================
     SCROLL
     ===================================================== */

  scrollToApplicationCard();

}