import SunEditor from "suneditor-react";
import plugins from "suneditor/src/plugins";
import { en } from "suneditor/src/lang";
import CodeMirror from "codemirror";
import katex from "katex";
import "suneditor/dist/css/suneditor.min.css";
import "katex/dist/katex.min.css";
import axios from "axios";
import { useRef, useEffect } from "react";

// ✅ Removed invalid codemirror imports (no need for htmlmixed/css if unused in v6)
const Editor = ({ name, onChange, ...props }) => {
  const editorRef = useRef(null);
  const options = {
    plugins: plugins,
    height: 250,
    codeMirror: {
      src: CodeMirror,
      options: {
        indentWithTabs: true,
        tabSize: 2,
      },
    },
    katex: katex,
    lang: en,
    // pasteTagsWhitelist: "p|br|div|span|strong|b|i|u|ul|ol|li|table|tr|td",

    // pasteStyles:
    //   "font-weight,font-style,text-decoration,color,background-color",

    // attributesWhitelist: {
    //   all: "style,class",
    // },
    pasteHandler: (html) => {
      // Remove Word junk
      html = html.replace(/mso-[^:;"]+:[^;"]+;?/gi, "");
      html = html.replace(/font-size:[^;"]+;?/gi, "");
      html = html.replace(/font-family:[^;"]+;?/gi, "");

      // Auto-wrap H1 → span(style="font-size:18pt")
      html = html.replace(
        /<h1>(.*?)<\/h1>/gi,
        (match, content) =>
          `<h1><span style="font-size: 18pt">${content.trim()}</span></h1>`
      );

      return html;
    },

    fontSizeUnit: "pt",
    fontSize: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36],
    font: [
      "Montserrat",
      "முக்த மலர்",
      "நோட்டோ சான்ஸ் தமிழ்",
      "Neuropol X",
      // Google fonts
      "Lato",
      "Libre Baskerville",
      "Merriweather",
      "Raleway",
      // System fonts
      "Baskerville",
      "Bodoni",
      "Futura",
      "Cambria",
      "Tahoma",
      "Trebuchet MS",

      "Arial",
      "Calibri",
      "Comic Sans MS",
      "Courier New",
      "Georgia",
      "Impact",
      "Lucida Console",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Poppins",
      "Roboto",
      "Open Sans",
      "Montserrat",
      "Noto Sans Tamil",
      "Noto Serif Tamil",
      "Mukta Malar",
      "கட்டமரன்",
      "பாலூ தம்பி 2",
      "Helvetica",
    ],
    // defaultStyle:
    //   "font-family: 'Arial', 'Times New Roman', 'Montserrat', sans-serif; font-size: 14px;",

    buttonList: [
      [
        "font",
        "fontSize",
        "formatBlock",
        "bold",
        "underline",
        "italic",
        "paragraphStyle",
        "blockquote",
        "strike",
        "subscript",
        "superscript",
        "fontColor",
        "hiliteColor",
        "textStyle",
        "removeFormat",
        "undo",
        "redo",
        "outdent",
        "indent",
        "align",
        "horizontalRule",
        "list",
        "lineHeight",
        "table",
        "link",
        "image",
        "fullScreen",
        "showBlocks",
        "codeView",
        "preview",
      ],
    ],
  };

  const getLineCountFromHtml = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Count paragraphs & divs = lines
    let lines = temp.querySelectorAll("p, div").length;

    // Count <br> tags = additional line breaks
    lines += temp.querySelectorAll("br").length;

    // If editor is empty, count as 0 or 1
    return lines || 1;
  };

  const handleEditorChange = (content) => {
    // HTML length
    const lineCount = getLineCountFromHtml(content);
    let clean = content;
    if (onChange) onChange(clean);
  };

  return (
    <SunEditor
      {...props}
      ref={editorRef}
      placeholder="Please type here..."
      name={name}
      lang="en"
      setOptions={options}
      // onImageUploadBefore={handleImageUploadBefore}
      onChange={handleEditorChange}
    />
  );
};

export default Editor;
