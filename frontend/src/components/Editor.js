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
      "Catamaran",
      "Baloo Thambi 2",
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
  const handlePageBreak = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    // Insert a visible marker
    editor.insertHTML(
      `<p class="page-break-label" data-page-break="true" style="
        border-top: 2px dashed #999;
        text-align: center;
        color: #666;
        margin: 16px 0;
        padding: 6px 0;
        font-weight: bold;
      ">--- Page Break ---</p><br/>`
    );
  };
  // ✅ After SunEditor mounts, inject custom button
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    // Add custom button dynamically
    const button = editor.util.createElement("button");
    button.className = "se-btn se-tooltip";
    button.type = "button";
    button.title = "Insert Page Break";
    button.innerHTML = "📄"; // You can use an SVG or icon
    button.style.fontSize = "18px";

    // Handle click
    button.addEventListener("click", () => handlePageBreak(editor));

    // Add to toolbar (e.g., after preview)
    const previewBtn = editor.context.tool.btns.preview?.parentNode;
    if (previewBtn) {
      previewBtn.parentNode.insertBefore(button, previewBtn.nextSibling);
    }
  }, []);

  const handleImageUploadBefore = async (files, info, uploadHandler) => {
    const KEY = "docs_upload_example_us_preset";
    const Data = new FormData();
    Data.append("file", files[0]);
    Data.append("upload_preset", KEY);

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/demo/image/upload",
        Data
      );
      const res = {
        result: [
          {
            url: response.data.secure_url,
            size: response.data.bytes,
            name: response.data.public_id,
          },
        ],
      };
      uploadHandler(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SunEditor
      {...props}
      ref={editorRef}
      placeholder="Please type here..."
      name={name}
      lang="en"
      setDefaultStyle="font-family: Arial; font-size: 14px;"
      setOptions={options}
      // onImageUploadBefore={handleImageUploadBefore}
      onChange={onChange}
    />
  );
};

export default Editor;
