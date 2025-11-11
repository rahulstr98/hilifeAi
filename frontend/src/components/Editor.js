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
      "Helvetica",
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
      setDefaultStyle="font-family: 'Helvetica Neue', Arial, sans-serif;"
      onPaste={(event, cleanData, maxCharCount, core) => {
        event.preventDefault(); // stop default paste
        const text = (event.clipboardData || window.clipboardData).getData(
          "text"
        );
        // paste only plain text — no styles
        core.insertHTML(text.replace(/\n/g, "<br>"));
      }}
      setOptions={options}
      // onImageUploadBefore={handleImageUploadBefore}
      onChange={onChange}
    />
  );
};

export default Editor;
