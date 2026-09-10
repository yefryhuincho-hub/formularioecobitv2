const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzvJGoOIN5YePzN2uwRLa39qJEDFLQY3F3VpEPM9wCaHbwEZTL0luix4x1xHmnHO3I/exec";


export default async function handler(req, res) {

  try {

    /* =====================================================
       PERMITIR PETICIONES
       ===================================================== */

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );


    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );


    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );


    /* =====================================================
       RESPUESTA OPTIONS
       ===================================================== */

    if (req.method === "OPTIONS") {

      return res
        .status(200)
        .end();

    }


    /* =====================================================
       PETICIÓN GET
       ===================================================== */

    if (req.method === "GET") {

      const url =
        new URL(
          GOOGLE_APPS_SCRIPT_URL
        );


      /*
         Copiar parámetros recibidos
      */

      Object.keys(req.query).forEach(
        function (key) {

          url.searchParams.set(
            key,
            req.query[key]
          );

        }
      );


      const response =
        await fetch(
          url.toString(),
          {
            redirect: "follow"
          }
        );


      const text =
        await response.text();


      return res
        .status(200)
        .setHeader(
          "Content-Type",
          "application/json"
        )
        .send(text);

    }


    /* =====================================================
       PETICIÓN POST
       ===================================================== */

    if (req.method === "POST") {

      const params =
        new URLSearchParams();


      /*
         Convertir datos recibidos
         al formato esperado por Apps Script
      */

      Object.entries(
        req.body || {}
      ).forEach(
        function ([key, value]) {

          params.append(
            key,
            value
          );

        }
      );


      const response =
        await fetch(
          GOOGLE_APPS_SCRIPT_URL,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/x-www-form-urlencoded"

            },

            body:
              params.toString(),

            redirect:
              "follow"

          }
        );


      const text =
        await response.text();


      return res
        .status(200)
        .setHeader(
          "Content-Type",
          "application/json"
        )
        .send(text);

    }


    /* =====================================================
       MÉTODO NO PERMITIDO
       ===================================================== */

    return res.status(405).json({

      success: false,

      message:
        "Método no permitido."

    });


  } catch (error) {

    console.error(
      "Error en API Vercel:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

}