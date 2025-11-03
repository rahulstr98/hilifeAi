import SunEditor from 'suneditor-react'
import plugins from 'suneditor/src/plugins'
import { en } from 'suneditor/src/lang'
import CodeMirror from 'codemirror'
import katex from 'katex'
import 'suneditor/dist/css/suneditor.min.css'
import 'katex/dist/katex.min.css'
import axios from 'axios'

// ✅ Removed invalid codemirror imports (no need for htmlmixed/css if unused in v6)
const Editor = ({ name, onChange, ...props }) => {
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
    buttonList: [
      [
        'font',
        'fontSize',
        'formatBlock',
        'bold',
        'underline',
        'italic',
        'paragraphStyle',
        'blockquote',
        'strike',
        'subscript',
        'superscript',
        'fontColor',
        'hiliteColor',
        'textStyle',
        'removeFormat',
        'undo',
        'redo',
        'outdent',
        'indent',
        'align',
        'horizontalRule',
        'list',
        'lineHeight',
        'table',
        'link',
        'image',
        'fullScreen',
        'showBlocks',
        'codeView',
        'preview',
      ],
    ],
  }

  const handleImageUploadBefore = async (files, info, uploadHandler) => {
    const KEY = 'docs_upload_example_us_preset'
    const Data = new FormData()
    Data.append('file', files[0])
    Data.append('upload_preset', KEY)

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/demo/image/upload',
        Data
      )
      const res = {
        result: [
          {
            url: response.data.secure_url,
            size: response.data.bytes,
            name: response.data.public_id,
          },
        ],
      }
      uploadHandler(res)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <SunEditor
      {...props}
      placeholder="Please type here..."
      name={name}
      lang="en"
      setDefaultStyle="font-family: Arial; font-size: 14px;"
      setOptions={options}
      onImageUploadBefore={handleImageUploadBefore}
      onChange={onChange}
    />
  )
}

export default Editor
