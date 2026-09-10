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


/* =========================================================
   ELEMENTOS DEL DOM
   ========================================================= */

const loadingState =
  document.getElementById("loadingState");

const errorState =
  document.getElementById("errorState");

const confirmationContent =
  document.getElementById("confirmationContent");

const successState =
  document.getElementById("successState");

const errorMessage =
  document.getElementById("errorMessage");


/* =========================================================
   INICIAR PÁGINA
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeConfirmationPage();

  }
);


/* =========================================================
   INICIALIZAR CONFIRMACIÓN
   ========================================================= */

async function initializeConfirmationPage() {

  try {

    /* Obtener ID desde la URL */

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


    /* Validar ID */

    if (!applicationId) {

      showError(
        "No se encontró un identificador de postulación válido."
      );

      return;

    }


    /* Consultar postulación */

    const response =
      await fetchApplication(
        applicationId
      );


    if (
      !response.success ||
      !response.application
    ) {

      showError(
        response.message ||
        "No fue posible encontrar tu postulación."
      );

      return;

    }


    /* Guardar información */

    currentApplication =
      response.application;


    /* Mostrar datos */

    populateApplicationData(
      currentApplication
    );


    /* Mostrar contenido */

    hideElement(
      loadingState
    );


    showElement(
      confirmationContent
    );


  } catch (error) {

    console.error(
      "Error al iniciar confirmación:",
      error
    );


    showError(
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


  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      "No fue posible conectar con el servidor."
    );

  }


  return await response.json();

}


/* =========================================================
   MOSTRAR DATOS DE POSTULACIÓN
   ========================================================= */

function populateApplicationData(application) {

  /* Nombre */

  const participantName =
    application.nombres ||
    application.nombreCompleto ||
    "";


  setText(
    "participantName",
    participantName
  );


  /* Programa */

  setText(
    "programName",
    application.programa || "—"
  );


  /* Application ID */

  setText(
    "applicationId",
    application.applicationId || "—"
  );


  /* Beca */

  setText(
    "scholarshipValue",
    formatScholarship(
      application.becaAsignada
    )
  );


  /* Valor académico */

  setText(
    "academicValue",
    formatCurrency(
      application.valorAcademico
    )
  );


  /* Derechos administrativos */

  setText(
    "administrativeValue",
    formatCurrency(
      application.derechosAdministrativos
    )
  );


  /* Total */

  setText(
    "totalValue",
    formatCurrency(
      application.totalPagar
    )
  );


  /* Link de pago */

  const paymentLink =
    document.getElementById(
      "paymentLink"
    );


  if (
    paymentLink &&
    application.linkPago
  ) {

    paymentLink.href =
      application.linkPago;

  }

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

    /* 1 = 100 % */

    if (number === 1) {

      return "Beca del 100 %";

    }


    /* 0.8 = 80 % */

    if (number === 0.8) {

      return "Beca del 80 %";

    }


    /* 0.5 = 50 % */

    if (number === 0.5) {

      return "Beca del 50 %";

    }


    /* 0 = sin beca */

    if (number === 0) {

      return "Sin beca";

    }


    /*
       Si se recibe otro formato numérico
    */

    if (number > 0 && number <= 1) {

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

document
  .getElementById("paymentReceipt")
  .addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];


      const nameElement =
        document.getElementById(
          "paymentReceiptName"
        );


      if (file) {

        nameElement.textContent =
          file.name;

      } else {

        nameElement.textContent =
          "Ningún archivo seleccionado";

      }

    }
  );


document
  .getElementById("professionalPhoto")
  .addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];


      const nameElement =
        document.getElementById(
          "professionalPhotoName"
        );


      if (file) {

        nameElement.textContent =
          file.name;

      } else {

        nameElement.textContent =
          "";

      }

    }
  );


/* =========================================================
   ENVÍO DEL FORMULARIO
   ========================================================= */

document
  .getElementById("confirmationForm")
  .addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      try {

        /* Validar postulación */

        if (!currentApplication) {

          throw new Error(
            "No se encontró información de la postulación."
          );

        }


        /* Obtener elementos */

        const confirmationCheckbox =
          document.getElementById(
            "participationConfirmation"
          );


        const paymentReceipt =
          document.getElementById(
            "paymentReceipt"
          ).files[0];


        const professionalPhoto =
          document.getElementById(
            "professionalPhoto"
          ).files[0];


        const biography =
          document.getElementById(
            "biography"
          ).value
          .trim();


        /* Validar */

        if (
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


        /* =================================================
           VALIDAR TAMAÑO DE ARCHIVOS

           Apps Script tiene límites de tamaño.

           Máximo recomendado:
           5 MB por archivo.
           ================================================= */

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


        /* =================================================
           ESTADO DEL BOTÓN
           ================================================= */

        const submitButton =
          document.getElementById(
            "submitConfirmation"
          );


        submitButton.disabled =
          true;


        submitButton.textContent =
          "Enviando información...";


        /* =================================================
           CONVERTIR ARCHIVOS
           ================================================= */

        const comprobanteFile =
          await convertFileToBase64(
            paymentReceipt
          );


        const fotoFile =
          await convertFileToBase64(
            professionalPhoto
          );


        /* =================================================
           PREPARAR DATOS
           ================================================= */

        const payload = {

          action:
            "confirmation",

          applicationId:
            currentApplication.applicationId,

          confirmacion:
            "CONFIRMADA",

          resenaBiografica:
            biography,

          comprobanteFile:
            comprobanteFile,

          fotoFile:
            fotoFile

        };


        /* =================================================
           ENVIAR AL BACKEND
           ================================================= */

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
            "No fue posible enviar la información."
          );

        }


        const result =
          await response.json();


        if (!result.success) {

          throw new Error(
            result.message ||
            "No fue posible registrar la información."
          );

        }


        /* =================================================
           MOSTRAR ÉXITO
           ================================================= */

        hideElement(
          confirmationContent
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
  );


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

          resolve({

            name:
              file.name,

            mimeType:
              file.type,

            base64:
              reader.result

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

  hideElement(
    loadingState
  );


  hideElement(
    confirmationContent
  );


  setText(
    "errorMessage",
    message
  );


  showElement(
    errorState
  );

}
