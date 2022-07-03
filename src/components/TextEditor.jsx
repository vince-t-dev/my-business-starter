import React from "react";

// ckeditor 5
import { CKEditor } from '@ckeditor/ckeditor5-react';
// integrated from online builder
import InlineEditor from 'ckeditor5-custom-build/build/ckeditor';


function TextEditor(props) {
    // ckeditor config
    // text
    const textConfig = { toolbar: ["bold","italic","underline","undo","redo"], placeholder: props.placeholder || "Enter text" };
    // rte
    const rteConfig = {
        toolbar: ["bold","italic","underline","link","|","fontSize","alignment","bulletedList","numberedList","blockQuote","|","imageUpload","insertTable","undo","redo"],
        image: {
            resizeUnit:"px",
            toolbar: ["imageTextAlternative","imageStyle:alignLeft","imageStyle:alignRight"],
            styles: ["full","alignLeft","alignRight"]
        },
        // TODO: image upload - try SimpleUploadAdapter 
        ckfinder: {
            uploadUrl: "/__xpr__/pub_engine/my-business-starter/element/file_uploader",
            options: {
                resourceType: 'Images'
            }
        },
        placeholder: props.placeholder || "Enter text"
    };

    return (
        <>
            <CKEditor
                editor={ InlineEditor }
                config={ props.rte ? rteConfig : textConfig }
                data={ props.defaultValue || props.value }
                onReady={ editor => {
                    // handle html output for headings
                    if (!props.rte) editor.model.schema.extend("paragraph", {isLimit: true});
                    if (props.rte) {
                        // adding min height to rte box
                        editor.editing.view.change((writer) => {
                            writer.setStyle("min-height","100px", editor.editing.view.document.getRoot());
                        });
                    }
                } }
                onBlur={ ( event, editor ) => {
                    const data = editor.getData();
                    // strip out <p> tags for headings
                    let formatted_data = props.rte ? data : data.replace("<p>","").replace("</p>","");
                    props.onChange(props.name,formatted_data);
                } }
            />
        </>
    );
}

export default TextEditor;