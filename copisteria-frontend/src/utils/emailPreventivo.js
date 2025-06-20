import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

export function esportaPreventivoPDFEmail({ dati, righe, logoDataUrl }) {
  const tableBody = [
    [
      { text: "Descrizione", style: "tableHeader", fillColor: "#FF6600" },
      { text: "Qtà", style: "tableHeader", fillColor: "#FF6600" },
      { text: "U.M.", style: "tableHeader", fillColor: "#FF6600" },
      { text: "Prezzo per Unità", style: "tableHeader", fillColor: "#FF6600" },
      { text: "Valore", style: "tableHeader", fillColor: "#FF6600" },
    ],
    ...righe.map((r) => [
      { text: r.descrizione },
      { text: r.quantita, alignment: "center" },
      { text: r.unita_misura || "" },
      { text: "€ " + Number(r.prezzo_unitario).toFixed(2), alignment: "right" },
      { text: "€ " + Number(r.totale_riga).toFixed(2), alignment: "right" },
    ]),
  ];

  const docDefinition = {
    content: [
      {
        columns: [
          [
            { text: dati.ragioneSociale, color: "#ff6600", style: "header" },
            { text: dati.ragioneSociale1, style: "small" },
            { text: dati.indirizzo, style: "small" },
            { text: dati.citta, style: "small" },
            { text: dati.telefono, style: "small" },
            { text: dati.sito, style: "small" },
            { text: dati.email, style: "small" },
          ],
          logoDataUrl
            ? {
                image: logoDataUrl,
                width: 150,
                alignment: "right",
                margin: [0, 0, 0, 0],
              }
            : { text: "LOGO", style: "logoPlaceholder" },
        ],
      },
      {
        columns: [
          [
            { text: "Cliente", color: "#ff6600", style: "minihead" },
            { text: dati.destinatario, style: "small" },
            { text: dati.destinatario_indirizzo, style: "small" },
          ],
          [
            { text: "Indirizzo", color: "#ff6600", style: "minihead" },
            { text: dati.spedizione, style: "small" },
            { text: dati.spedizione_indirizzo, style: "small" },
          ],
          [
            { text: "Data", color: "#ff6600", style: "minihead" },
            { text: dati.data, style: "small" },
            {
              text: "Prev. n° " + (dati.codice || ""),
              style: "minihead",
              color: "#ff6600",
              margin: [0, 6, 0, 0],
            },
          ],
        ],
        margin: [0, 12, 0, 12],
      },
      {
        style: "preventivoTable",
        table: {
          headerRows: 1,
          widths: ["*", 40, 40, 90, 70],
          body: tableBody,
        },
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? "#ff6600" : null;
          },
          hLineWidth: function (i, node) {
            return i === 1 ? 2 : 0.5;
          },
        },
        margin: [0, 12, 0, 0],
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 200,
            stack: [
              {
                columns: [
                  { text: "Imponibile", alignment: "left", width: "*" },
                  {
                    text: "€ " + Number(dati.subtotale).toFixed(2),
                    alignment: "right",
                    width: 60,
                  },
                ],
              },
              {
                columns: [
                  { text: "IVA 22.0%", alignment: "left", width: "*" },
                  {
                    text: "€ " + Number(dati.iva).toFixed(2),
                    alignment: "right",
                    width: 60,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Totale",
                    style: "totale",
                    alignment: "left",
                    width: "*",
                  },
                  {
                    text: "€ " + Number(dati.totale).toFixed(2),
                    style: "totale",
                    alignment: "right",
                    width: 60,
                  },
                ],
                margin: [0, 8, 0, 0],
              },
            ],
          },
        ],
        margin: [0, 16, 0, 16],
      },
      {
        text: "Termini e Condizioni",
        color: "#ff6600",
        bold: true,
        margin: [0, 24, 0, 2],
      },
      {
        text: dati.termini || "Il pagamento è dovuto entro 15 giorni",
        style: "small",
      },
      { text: dati.banca || "", style: "small", margin: [0, 4, 0, 0] },
    ],
    styles: {
      header: { fontSize: 20, bold: true, margin: [0, 0, 0, 2] },
      small: { fontSize: 10, margin: [0, 0, 0, 0] },
      logoPlaceholder: {
        alignment: "right",
        fontSize: 14,
        color: "#aaa",
        italics: true,
        margin: [0, 20, 0, 0],
      },
      preventivoTable: { margin: [0, 0, 0, 0] },
      tableHeader: {
        bold: true,
        color: "white",
        fillColor: "#C53B28",
        fontSize: 11,
        alignment: "center",
      },
      minihead: {
        fontSize: 11,
        bold: true,
        margin: [0, 2, 0, 0],
        color: "#ab2328",
      },
      totale: { bold: true, fontSize: 14 },
    },
    defaultStyle: { font: "Roboto" },
    pageMargins: [40, 50, 40, 60],
  };

  return pdfMake.createPdf(docDefinition);
}
