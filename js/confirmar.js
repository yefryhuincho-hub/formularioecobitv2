/* =========================================================
   ECOBIT EXCELLENCE
   CONFIRMACIÓN DE PARTICIPACIÓN
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbzvJGoOIN5YePzN2uwRLa39qJEDFLQY3F3VpEPM9wCaHbwEZTL0luix4x1xHmnHO3I/exec";


/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let currentApplication = null;

let loadingState = null;
let errorState = null;
let confirmationContent = null;
let successState = null;
let errorMessage = null;


/* =========================================================
   INICIAR PÁGINA DE FORMA SEGURA
   ========================================================= */

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializePage
  );

} else {

  initializePage();

}


/* =========================================================
   INICIALIZACIÓN GENERAL
   ========================================================= */

function initializePage() {

  /* =======================================================
     OBTENER ELEMENTOS DEL DOM
     ======================================================= */

  loadingState =
    document.getElementById("loadingState");

  errorState =
    document.getElementById("errorState");

  confirmationContent =
    document.getElementById("confirmationContent");

  successState =
    document.getElementById("successState");

  errorMessage =
    document.getElementById("errorMessage");


  /* =======================================================
     OCULTAR ESTADOS INICIALES
     ======================================================= */

  if (errorState) {

    hideElement(errorState);

  }


  if (confirmationContent) {

    hideElement(confirmationContent);

  }


  if (successState) {

    hideElement(successState);

  }


  if (loadingState) {

    showElement(loadingState);

  }


  /* =======================================================
     CONFIGURAR EVENTOS
     ======================================================= */

  initializeFileEvents();

  initializeFormEvent();


  /* =======================================================
     CARGAR POSTULACIÓN
     ======================================================= */

  initializeConfirmationPage();

}


/* =========================================================
   INICIALIZAR CONFIRMACIÓN
   ========================================================= */

async function initializeConfirmationPage() {

  try {

    console.log(
      "Iniciando página de confirmación..."
    );


    const urlParams =
      new URLSearchParams(
        window.location.search
      );


    const applicationId =
      String(
        urlParams.get("id") || ""
      )
        .trim()
        .toUpperCase();


    console.log(
      "APPLICATION ID recibido:",
      applicationId
    );


    /* =====================================================
       VALIDAR ID
       ===================================================== */

    if (!applicationId) {

      showError(
        "No se encontró un identificador de postulación válido."
      );

      return;

    }


    /* =====================================================
       CONSULTAR POSTULACIÓN
       ===================================================== */

    const response =
      await fetchApplication(
        applicationId
      );


    console.log(
      "Respuesta recibida:",
      response
    );


    /* =====================================================
       VALIDAR RESPUESTA
       ===================================================== */

    if (
      !response ||
      !response.success ||
      !response.application
    ) {

      showError(
        response &&
        response.message
          ? response.message
          : "No fue posible encontrar tu postulación."
      );

      return;

    }


    /* =====================================================
       GUARDAR INFORMACIÓN
       ===================================================== */

    currentApplication =
      response.application;


    /* =====================================================
       MOSTRAR DATOS
       ===================================================== */

    populateApplicationData(
      currentApplication
    );


    /* =====================================================
       CAMBIAR ESTADOS VISUALES
       ===================================================== */

    hideElement(
      loadingState
    );


    hideElement(
      errorState
    );


    hideElement(
      successState
    );


    showElement(
      confirmationContent
    );


    console.log(
      "Información cargada correctamente."
    );


  } catch (error) {

    console.error(
      "Error al iniciar confirmación:",
      error
    );


    showError(
      error.message ||
      "Ocurrió un error al cargar tu información. Intenta nuevamente."
    );

  }

}


/* =========================================================
   CONSULTAR POSTULACIÓN
   ========================================================= */

async function fetchApplication(applicationId) {

  const url =
    `${API_URL}?action=postulacion&id=${encodeURIComponent(applicationId)}`;


  console.log(
    "Consultando:",
    url
  );


  const response =
    await fetch(
      url,
      {
        method: "GET"
      }
    );


  if (!response.ok) {

    throw new Error(
      `No fue posible conectar con el servidor. Código: ${response.status}`
    );

  }


  const data =
    await response.json();


  return data;

}


/* =========================================================
   MOSTRAR DATOS DE POSTULACIÓN
   ========================================================= */

function populateApplicationData(application) {

  if (!application) {

    throw new Error(
      "No se recibió información de la postulación."
    );

  }


  /* =======================================================
     NOMBRE
     ======================================================= */

  const participantName =
    application.nombres ||
    application.nombreCompleto ||
    "Participante";


  setText(
    "participantName",
    participantName
  );


  /* =======================================================
     PROGRAMA
     ======================================================= */

  setText(
    "programName",
    application.programa || "—"
  );


  /* =======================================================
     APPLICATION ID
     ======================================================= */

  setText(
    "applicationId",
    application.applicationId || "—"
  );


  /* =======================================================
     BECA
     ======================================================= */

  setText(
    "scholarshipValue",
    formatScholarship(
      application.becaAsignada
    )
  );


  /* =======================================================
     VALOR ACADÉMICO
     ======================================================= */

  setText(
    "academicValue",
    formatCurrency(
      application.valorAcademico
    )
  );


  /* =======================================================
     DERECHOS ADMINISTRATIVOS
     ======================================================= */

  setText(
    "administrativeValue",
    formatCurrency(
      application.derechosAdministrativos
    )
  );


  /* =======================================================
     TOTAL A PAGAR
     ======================================================= */

  setText(
    "totalValue",
    formatCurrency(
      application.totalPagar
    )
  );


  /* =======================================================
     LINK DE PAGO
     ======================================================= */

  const paymentLink =
    document.getElementById(
      "paymentLink"
    );


  if (paymentLink) {

    if (application.linkPago) {

      paymentLink.href =
        application.linkPago;


      paymentLink.style.display =
        "";

    } else {

      paymentLink.style.display =
        "none";

    }

  }


  console.log(
    "Datos mostrados correctamente."
  );

}


/* =========================================================
   FORMATEAR BECA
   ========================================================= */

function formatScholarship(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "Sin información";

  }


  const number =
    Number(value);


  if (!isNaN(number)) {

    if (number === 1) {

      return "Beca del 100 %";

    }


    if (number === 0.8) {

      return "Beca del 80 %";

    }


    if (number === 0.5) {

      return "Beca del 50 %";

    }


    if (number === 0) {

      return "Sin beca";

    }


    if (
      number > 0 &&
      number <= 1
    ) {

      return `Beca del ${number * 100} %`;

    }

  }


  return String(value);

}


/* =========================================================
   FORMATEAR MONEDA
   ========================================================= */

function formatCurrency(value) {

  const number =
    Number(value || 0);


  return new Intl.NumberFormat(
    "es-PE",
    {

      style:
        "currency",

      currency:
        "USD",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2

    }
  ).format(number);

}


/* =========================================================
   EVENTOS DE ARCHIVOS
   ========================================================= */

function initializeFileEvents() {

  const paymentReceipt =
    document.getElementById(
      "paymentReceipt"
    );


  if (paymentReceipt) {

    paymentReceipt.addEventListener(
      "change",
      function (event) {

        const file =
          event.target.files[0];


        const nameElement =
          document.getElementById(
            "paymentReceiptName"
          );


        if (!nameElement) {

          return;

        }


        if (file) {

          nameElement.textContent =
            file.name;

        } else {

          nameElement.textContent =
            "Ningún archivo seleccionado";

        }

      }
    );

  }


  const professionalPhoto =
    document.getElementById(
      "professionalPhoto"
    );


  if (professionalPhoto) {

    professionalPhoto.addEventListener(
      "change",
      function (event) {

        const file =
          event.target.files[0];


        const nameElement =
          document.getElementById(
            "professionalPhotoName"
          );


        if (!nameElement) {

          return;

        }


        if (file) {

          nameElement.textContent =
            file.name;

        } else {

          nameElement.textContent =
            "Ningún archivo seleccionado";

        }

      }
    );

  }

}


/* =========================================================
   EVENTO DEL FORMULARIO
   ========================================================= */

function initializeFormEvent() {

  const confirmationForm =
    document.getElementById(
      "confirmationForm"
    );


  if (!confirmationForm) {

    console.warn(
      "No se encontró confirmationForm."
    );

    return;

  }


  confirmationForm.addEventListener(
    "submit",
    handleConfirmationSubmit
  );

}


/* =========================================================
   ENVÍO DEL FORMULARIO
   ========================================================= */

async function handleConfirmationSubmit(event) {

  event.preventDefault();


  try {

    /* =====================================================
       VALIDAR POSTULACIÓN
       ===================================================== */

    if (!currentApplication) {

      throw new Error(
        "No se encontró información de la postulación."
      );

    }


    /* =====================================================
       OBTENER ELEMENTOS
       ===================================================== */

    const confirmationCheckbox =
      document.getElementById(
        "participationConfirmation"
      );


    const paymentReceiptInput =
      document.getElementById(
        "paymentReceipt"
      );


    const professionalPhotoInput =
      document.getElementById(
        "professionalPhoto"
      );


    const biographyInput =
      document.getElementById(
        "biography"
      );


    const paymentReceipt =
      paymentReceiptInput
        ? paymentReceiptInput.files[0]
        : null;


    const professionalPhoto =
      professionalPhotoInput
        ? professionalPhotoInput.files[0]
        : null;


    const biography =
      biographyInput
        ? biographyInput.value.trim()
        : "";


    /* =====================================================
       VALIDACIONES
       ===================================================== */

    if (
      !confirmationCheckbox ||
      !confirmationCheckbox.checked
    ) {

      alert(
        "Debes confirmar tu participación."
      );

      return;

    }


    if (!paymentReceipt) {

      alert(
        "Debes adjuntar el comprobante de pago."
      );

      return;

    }


    if (!professionalPhoto) {

      alert(
        "Debes adjuntar tu foto profesional."
      );

      return;

    }


    if (!biography) {

      alert(
        "Debes completar tu reseña biográfica."
      );

      return;

    }


    /* =====================================================
       VALIDAR TAMAÑO
       ===================================================== */

    const maxFileSize =
      5 * 1024 * 1024;


    if (
      paymentReceipt.size >
      maxFileSize
    ) {

      alert(
        "El comprobante no debe superar los 5 MB."
      );

      return;

    }


    if (
      professionalPhoto.size >
      maxFileSize
    ) {

      alert(
        "La foto no debe superar los 5 MB."
      );

      return;

    }


    /* =====================================================
       BOTÓN
       ===================================================== */

    const submitButton =
      document.getElementById(
        "submitConfirmation"
      );


    if (submitButton) {

      submitButton.disabled =
        true;


      submitButton.textContent =
        "Enviando información...";

    }


    /* =====================================================
       CONVERTIR COMPROBANTE
       ===================================================== */

    const receiptFile =
      await convertFileToBase64(
        paymentReceipt
      );


    /* =====================================================
       CONVERTIR FOTO
       ===================================================== */

    const photoFile =
      await convertFileToBase64(
        professionalPhoto
      );


    /* =====================================================
       PREPARAR PAYLOAD
       ===================================================== */

    const payload = {

      action:
        "confirmation",


      applicationId:
        currentApplication.applicationId,


      email:
        currentApplication.email || "",


      confirmation:
        "CONFIRMADA",


      biography:
        biography,


      /* FOTO */

      photoBase64:
        photoFile.base64,


      photoFileName:
        photoFile.name,


      photoMimeType:
        photoFile.mimeType,


      /* COMPROBANTE */

      receiptBase64:
        receiptFile.base64,


      receiptFileName:
        receiptFile.name,


      receiptMimeType:
        receiptFile.mimeType

    };


    console.log(
      "Enviando confirmación..."
    );


    /* =====================================================
       ENVIAR AL BACKEND
       ===================================================== */

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    if (!response.ok) {

      throw new Error(
        `No fue posible enviar la información. Código: ${response.status}`
      );

    }


    const result =
      await response.json();


    console.log(
      "Respuesta de confirmación:",
      result
    );


    if (!result.success) {

      throw new Error(
        result.message ||
        "No fue posible registrar la información."
      );

    }


    /* =====================================================
       MOSTRAR ÉXITO
       ===================================================== */

    hideElement(
      confirmationContent
    );


    hideElement(
      loadingState
    );


    hideElement(
      errorState
    );


    showElement(
      successState
    );


    window.scrollTo({

      top:
        0,

      behavior:
        "smooth"

    });


  } catch (error) {

    console.error(
      "Error al enviar confirmación:",
      error
    );


    alert(
      error.message ||
      "Ocurrió un error al enviar la información."
    );


    const submitButton =
      document.getElementById(
        "submitConfirmation"
      );


    if (submitButton) {

      submitButton.disabled =
        false;


      submitButton.textContent =
        "Confirmar y enviar información";

    }

  }

}


/* =========================================================
   CONVERTIR ARCHIVO A BASE64
   ========================================================= */

function convertFileToBase64(file) {

  return new Promise(
    function (resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(
              reader.result || ""
            );


          /*
           * Enviamos el Data URL completo.
           * Apps Script podrá decodificarlo.
           */

          resolve({

            name:
              file.name,

            mimeType:
              file.type ||
              "application/octet-stream",

            base64:
              result

          });

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              `No fue posible leer el archivo ${file.name}.`
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   UTILIDADES DEL DOM
   ========================================================= */

function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  } else {

    console.warn(
      `No se encontró el elemento: ${id}`
    );

  }

}


function hideElement(element) {

  if (element) {

    element.classList.add(
      "hidden"
    );

  }

}


function showElement(element) {

  if (element) {

    element.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   MOSTRAR ERROR
   ========================================================= */

function showError(message) {

  console.error(
    "Error mostrado:",
    message
  );


  hideElement(
    loadingState
  );


  hideElement(
    confirmationContent
  );


  hideElement(
    successState
  );


  setText(
    "errorMessage",
    message
  );


  showElement(
    errorState
  );

}
