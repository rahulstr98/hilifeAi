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
    pasteConvert: true,
    pasteDialog: false,
    pasteIgnoreImg: false,
    pasteKeepImg: true,

    pasteTagsWhitelist:
      "span|font|b|i|u|strong|em|p|div|br|ul|ol|li|table|thead|tbody|tr|td",
    pasteTagsBlacklist: "script|style",

    // preserve styles from Word
    attributesWhitelist: {
      all: "style,class",
    },

    pasteStyles:
      "font-family,font-size,font-weight,font-style,text-decoration,color,background-color",

    addTagsWhitelist: "span|font",
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

  return (
    <SunEditor
      {...props}
      ref={editorRef}
      placeholder="Please type here..."
      name={name}
      lang="en"
      setOptions={options}
      // onImageUploadBefore={handleImageUploadBefore}
      onChange={onChange}
    />
  );
};

export default Editor;
